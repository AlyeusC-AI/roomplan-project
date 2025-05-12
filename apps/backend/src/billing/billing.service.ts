import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrganizationService } from '../organization/organization.service';
import Stripe from 'stripe';
// import { CreateCheckoutSessionParams } from '@service-geek/api-client';
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
        apiVersion: '2025-04-30.basil',
      },
    );
  }

  async createCheckoutSession(params: any, user: any) {
    const { organizationId, priceId, type, plan, noTrial } = params;
    const organization = await this.organizationService.findOne(organizationId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      payment_method_collection: 'if_required',
      submit_type: 'subscribe',
      customer_email: user?.email,
      // billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
      metadata: {
        userId: user!.userId,
        organizationId: organizationId,
      },
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: noTrial
        ? undefined
        : {
            trial_period_days: 14,
            trial_settings: {
              end_behavior: {
                missing_payment_method: 'pause',
              },
            },
          },
      success_url: `${this.configService.get('FRONTEND_URL')}/projects?session_id={CHECKOUT_SESSION_ID}&from_checkout=true&userId=${user?.userId}&organizationId=${organizationId}&plan=${plan}`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/${type === 'register' ? 'register?page=4' : '/settings/billing'}`,
    });

    return session;
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
      expand: ['data.product'],
      active: true,
      type: 'recurring',
      recurring: {
        interval: 'month',
        usage_type: 'licensed',
      },
      lookup_keys: ['enterprise', 'team', 'startup'],
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
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionCreatedOrUpdated(subscription);
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

  private async handleSubscriptionCreatedOrUpdated(
    subscription: Stripe.Subscription,
  ) {
    // Get the price to determine the plan
    const price = await this.stripe.prices.retrieve(
      subscription.items.data[0].price.id,
      { expand: ['product'] },
    );

    // Use lookup_key to determine plan type
    const plan = price.lookup_key as 'startup' | 'team' | 'enterprise';

    if (!plan || !['startup', 'team', 'enterprise'].includes(plan)) {
      throw new BadRequestException('Invalid subscription plan');
    }

    // Calculate total users including additional seats
    let additionalUsers = 0;
    const additionalUserPriceId =
      plan === 'enterprise'
        ? this.configService.get('ADDITIONAL_USER_PRICE_ID_ENTERPRISE')
        : this.configService.get('ADDITIONAL_USER_PRICE_ID');

    // Find additional user subscription items
    const additionalUserItem = subscription.items.data.find(
      (item) => item.price.id === additionalUserPriceId,
    );

    if (additionalUserItem) {
      additionalUsers = additionalUserItem.quantity || 0;
    }

    // Base users per plan
    const baseUsers = plan === 'startup' ? 2 : plan === 'team' ? 5 : 10;
    const totalMaxUsers = baseUsers + additionalUsers;

    // Get organization ID from metadata
    const organizationId = subscription.metadata.organizationId;

    if (!organizationId) {
      throw new BadRequestException('No organization ID in metadata');
    }

    // Update organization subscription details
    await this.organizationService.updateSubscription(organizationId, {
      subscriptionId: subscription.id,
      subscriptionPlan: plan,
      customerId: subscription.customer as string,
      maxUsersForSubscription: totalMaxUsers,
      freeTrialEndsAt: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const organizationId = subscription.metadata.organizationId;

    if (!organizationId) {
      throw new BadRequestException('No organization ID in metadata');
    }

    // Update organization to remove subscription
    await this.organizationService.updateSubscription(organizationId, {
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
