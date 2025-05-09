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
