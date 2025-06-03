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
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret is not configured');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      throw new BadRequestException(
        `Webhook signature verification failed: ${err.message}`,
      );
    }

    try {
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
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw new BadRequestException(
        `Error processing webhook: ${error.message}`,
      );
    }
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

    // Base users per plan
    const baseUsers = plan === 'startup' ? 2 : plan === 'team' ? 5 : 10;

    await this.organizationService.updateSubscription(organizationId, {
      subscriptionId: subscription.id,
      subscriptionPlan: plan,
      customerId: customer.id,
      maxUsersForSubscription: baseUsers,
      subscriptionStatus: subscription.status,
    });
  }

  private async handleSubscriptionCreatedOrUpdated(
    subscription: Stripe.Subscription,
  ) {
    try {
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
        subscriptionStatus: subscription.status,
      });

      return { updated: true };
    } catch (error) {
      console.error('Error handling subscription update:', error);
      throw new BadRequestException(
        `Error handling subscription update: ${error.message}`,
      );
    }
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

  private async getMaxUsersForPlan(priceId: string): Promise<number> {
    try {
      // Get the price to determine the plan
      const price = await this.stripe.prices.retrieve(priceId, {
        expand: ['product'],
      });

      // Use lookup_key to determine plan type
      const plan = price.lookup_key as 'startup' | 'team' | 'enterprise';

      if (!plan || !['startup', 'team', 'enterprise'].includes(plan)) {
        throw new BadRequestException('Invalid subscription plan');
      }

      // Base users per plan
      const baseUsers = plan === 'startup' ? 2 : plan === 'team' ? 5 : 10;

      return baseUsers;
    } catch (error) {
      console.error('Error getting max users for plan:', error);
      throw new BadRequestException(
        `Error getting max users for plan: ${error.message}`,
      );
    }
  }

  async updateAdditionalUsers(organizationId: string, additionalUsers: number) {
    try {
      // Get organization details
      const organization =
        await this.organizationService.findOne(organizationId);
      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      if (!organization.subscriptionId) {
        throw new BadRequestException('No active subscription');
      }

      // Get the subscription
      const subscription = await this.stripe.subscriptions.retrieve(
        organization.subscriptionId,
      );
      const price = await this.stripe.prices.retrieve(
        subscription.items.data[0].price.id,
        { expand: ['product'] },
      );

      // Determine plan type
      const plan = price.lookup_key as 'startup' | 'team' | 'enterprise';
      if (!plan || !['startup', 'team', 'enterprise'].includes(plan)) {
        throw new BadRequestException('Invalid subscription plan');
      }

      // Get the additional user price ID
      const additionalUserPriceId =
        plan === 'enterprise'
          ? this.configService.get('ADDITIONAL_USER_PRICE_ID_ENTERPRISE')
          : this.configService.get('ADDITIONAL_USER_PRICE_ID');

      if (!additionalUserPriceId) {
        throw new BadRequestException(
          'Additional user price ID not configured',
        );
      }

      // Find existing additional user item
      const existingItem = subscription.items.data.find(
        (item) => item.price.id === additionalUserPriceId,
      );

      if (existingItem) {
        // Update existing item
        await this.stripe.subscriptionItems.update(existingItem.id, {
          quantity: additionalUsers,
        });
      } else if (additionalUsers > 0) {
        // Add new item
        await this.stripe.subscriptions.update(subscription.id, {
          items: [
            {
              price: additionalUserPriceId,
              quantity: additionalUsers,
            },
          ],
        });
      }

      // Calculate total users
      const baseUsers = plan === 'startup' ? 2 : plan === 'team' ? 5 : 10;
      const totalMaxUsers = baseUsers + additionalUsers;

      // Update organization
      await this.organizationService.updateSubscription(organizationId, {
        maxUsersForSubscription: totalMaxUsers,
      });

      return { success: true, maxUsers: totalMaxUsers };
    } catch (error) {
      console.error('Error updating users:', error);
      throw new BadRequestException(`Error updating users: ${error.message}`);
    }
  }

  async getSubscriptionInfo(organizationId: string) {
    try {
      // Get organization details
      const organization =
        await this.organizationService.findOne(organizationId);
      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      // Fetch subscription details from Stripe
      const subscription = organization.subscriptionId
        ? await this.stripe.subscriptions.retrieve(
            organization.subscriptionId,
            {
              expand: [
                'items.data.price.product',
                'items.data.price.recurring',
              ],
            },
          )
        : null;

      // Fetch product features
      const features = subscription
        ? await this.stripe.products.list({
            ids: [
              (subscription.items.data[0].price.product as Stripe.Product).id,
            ],
          })
        : null;

      // Fetch customer details from Stripe
      const customer = organization.customerId
        ? await this.stripe.customers.retrieve(organization.customerId)
        : null;

      // Fetch recent invoices
      const invoices = organization.customerId
        ? await this.stripe.invoices.list({
            customer: organization.customerId,
            limit: 5,
          })
        : null;

      // Fetch available plans
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

      const availablePlans = prices.data.map((price: Stripe.Price) => {
        const product = price.product as Stripe.Product;
        return {
          id: price.id,
          price: price.unit_amount! / 100,
          product: {
            name: product.name,
            description: product.description,
            marketing_features: product.metadata.marketing_features
              ? JSON.parse(product.metadata.marketing_features)
              : [],
          },
        };
      });
      console.log(
        '🚀 ~ BillingService ~ getSubscriptionInfo ~ subscriptionInfo.subscription:',
        subscription,
      );

      // Format the response
      const subscriptionInfo = {
        status: organization.subscriptionId ? subscription?.status : 'never',
        customerId: organization.customerId,
        subscriptionId: organization.subscriptionId,
        plan: subscription?.items.data[0]
          ? {
              name: (subscription.items.data[0].price.product as Stripe.Product)
                .name,
              price: subscription.items.data[0].price.unit_amount! / 100,
              interval: subscription.items.data[0].price.recurring?.interval,
              features:
                features?.data[0].marketing_features.map(
                  (feature) => feature.name,
                ) || [],
            }
          : null,
        customer:
          customer && !customer.deleted
            ? {
                email: customer.email,
                name: customer.name,
                phone: customer.phone,
              }
            : null,
        currentPeriodEnd: subscription?.items.data[0]?.current_period_end
          ? new Date(
              subscription.items.data[0].current_period_end * 1000,
            ).toISOString()
          : null,
        freeTrialEndsAt: subscription?.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null,
        maxUsersForSubscription: organization.maxUsersForSubscription,
        cancelAtPeriodEnd: subscription?.cancel_at_period_end || false,
        recentInvoices:
          invoices?.data.map((invoice) => ({
            id: invoice.id,
            amount: invoice.amount_paid / 100,
            status: invoice.status,
            date: new Date(invoice.created * 1000).toISOString(),
            pdfUrl: invoice.invoice_pdf,
          })) || [],
        availablePlans,
      };

      return subscriptionInfo;
    } catch (error) {
      console.error('Error fetching subscription info:', error);
      throw new BadRequestException(
        `Error fetching subscription information: ${error.message}`,
      );
    }
  }
}
