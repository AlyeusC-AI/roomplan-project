import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrganizationService } from '../organization/organization.service';
import Stripe from 'stripe';

@Injectable()
export class BillingService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private organizationService: OrganizationService,
  ) {
    this.stripe = new Stripe(
      this.configService.get('STRIPE_SECRET_KEY') || '',
      {
        apiVersion: '2025-01-27.acacia',
      },
    );
  }

  async createCheckoutSession(organizationId: string, priceId: string) {
    const organization = await this.organizationService.findOne(organizationId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${this.configService.get('FRONTEND_URL')}/organizations/${organizationId}/billing?success=true`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/organizations/${organizationId}/billing?canceled=true`,
      customer_email: organization.members[0]?.user.email,
      metadata: {
        organizationId,
      },
    });

    return { sessionId: session.id };
  }

  async createPortalSession(organizationId: string) {
    const organization = await this.organizationService.findOne(organizationId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (!organization.customerId) {
      throw new BadRequestException('No subscription found');
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: organization.customerId,
      return_url: `${this.configService.get('FRONTEND_URL')}/organizations/${organizationId}/billing`,
    });

    return { url: session.url };
  }

  async getSubscriptionPlans() {
    const prices = await this.stripe.prices.list({
      active: true,
      expand: ['data.product'],
    });

    return prices.data.map((price) => ({
      id: price.id,
      name: (price.product as Stripe.Product).name,
      description: (price.product as Stripe.Product).description,
      price: price.unit_amount ? price.unit_amount / 100 : 0,
      currency: price.currency,
      interval: price.recurring?.interval,
      features: (price.product as Stripe.Product).marketing_features,
    }));
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutSessionCompleted(session);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionUpdated(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionDeleted(subscription);
        break;
      }
    }

    return { received: true };
  }

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ) {
    const organizationId = session.metadata?.organizationId;
    if (!organizationId) {
      throw new BadRequestException('Organization ID not found in metadata');
    }

    const subscription = await this.stripe.subscriptions.retrieve(
      session.subscription as string,
    );
    const customer = await this.stripe.customers.retrieve(
      session.customer as string,
    );

    await this.organizationService.updateSubscription(organizationId, {
      subscriptionId: subscription.id,
      subscriptionPlan: subscription.items.data[0].price.id,
      customerId: customer.id,
      maxUsersForSubscription: this.getMaxUsersForPlan(
        subscription.items.data[0].price.id,
      ),
      subscriptionStatus: subscription.status,
    });
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const organization = await this.organizationService.findBySubscriptionId(
      subscription.id,
    );
    if (!organization) return;

    await this.organizationService.updateSubscription(organization.id, {
      subscriptionPlan: subscription.items.data[0].price.id,
      maxUsersForSubscription: this.getMaxUsersForPlan(
        subscription.items.data[0].price.id,
      ),
      subscriptionStatus: subscription.status,
    });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const organization = await this.organizationService.findBySubscriptionId(
      subscription.id,
    );
    if (!organization) return;

    await this.organizationService.updateSubscription(organization.id, {
      subscriptionId: null,
      subscriptionPlan: null,
      maxUsersForSubscription: 0,
      subscriptionStatus: 'canceled',
    });
  }

  private getMaxUsersForPlan(priceId: string): number {
    // Define your plan limits here
    const planLimits = {
      price_basic: 5,
      price_pro: 20,
      price_enterprise: 100,
    };
    return planLimits[priceId] || 0;
  }
}
