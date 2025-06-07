export interface MarketingFeature {
  name: string;
}

export interface Product {
  name: string;
  description: string;
  marketing_features: MarketingFeature[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: MarketingFeature[];
}

export interface CheckoutSessionResponse {
  url: string;
}

export interface CreateCheckoutSessionParams {
  organizationId: string;
  priceId: string;
  type: string;
  plan: string;
  noTrial: boolean;
}

export interface SubscriptionInfo {
  status: string;
  customerId: string | null;
  subscriptionId: string | null;
  plan: {
    name: string;
    price: number;
    interval: string;
    features: string[];
  } | null;
  customer: {
    email: string;
    name: string;
    phone: string;
  } | null;
  currentPeriodEnd: string | null;
  freeTrialEndsAt: string | null;
  maxUsersForSubscription: number;
  cancelAtPeriodEnd: boolean;
  recentInvoices: {
    id: string;
    amount: number;
    status: string;
    date: string;
    pdfUrl: string;
  }[];
  availablePlans: {
    id: string;
    price: number;
    product: {
      name: string;
      description: string;
      marketing_features: string[];
    };
  }[];
}

export interface UpdateUsersResponse {
  success: boolean;
  maxUsers: number;
}
