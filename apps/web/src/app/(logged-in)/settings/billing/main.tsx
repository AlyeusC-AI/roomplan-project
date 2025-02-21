"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingPlaceholder } from "@components/ui/spinner";
import {
  CheckIcon,
  Loader2,
  CreditCard,
  Calendar,
  Users,
  Receipt,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface Invoice {
  id: string;
  amount: number;
  status: string;
  date: string;
  pdfUrl: string | null;
}

interface SubscriptionInfo {
  status: "active" | "canceled" | "past_due" | "never" | "trialing";
  customerId: string;
  subscriptionId: string;
  plan: {
    name: string;
    price: number;
    interval: string;
    features: string[];
  } | null;
  customer: {
    email: string;
    name: string | null;
    phone: string | null;
  } | null;
  currentPeriodEnd: string | null;
  freeTrialEndsAt: string | null;
  maxUsersForSubscription: number;
  cancelAtPeriodEnd: boolean;
  recentInvoices: Invoice[];
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] =
    useState<SubscriptionInfo | null>(null);

  useEffect(() => {
    fetchSubscriptionInfo();
  }, []);

  const fetchSubscriptionInfo = async () => {
    try {
      const response = await fetch("/api/subscription-info");
      if (!response.ok) throw new Error("Failed to fetch subscription info");
      const data = await response.json();
      setSubscriptionInfo(data);
    } catch (error) {
      toast.error("Failed to load subscription information");
    } finally {
      setLoading(false);
    }
  };

  const redirectToPortal = async () => {
    try {
      setPortalLoading(true);
      const response = await fetch("/api/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: subscriptionInfo?.customerId }),
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (error) {
      toast.error("Failed to redirect to billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) return <LoadingPlaceholder />;

  return (
    <div className='mx-auto max-w-5xl space-y-8 p-8'>
      {/* Header Section */}

      {/* Main Subscription Card */}
      <Card className='overflow-hidden'>
        <div className='bg-primary/5 p-6'>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <h2 className='text-2xl font-semibold'>
                {subscriptionInfo?.plan?.name || "No Active Plan"}
              </h2>
              <p className='text-sm text-muted-foreground'>
                {subscriptionInfo?.plan
                  ? `${subscriptionInfo.maxUsersForSubscription} users included`
                  : "Choose a plan to get started"}
              </p>
            </div>
            {subscriptionInfo?.status && (
              <div className='flex items-center gap-3'>
                {subscriptionInfo.cancelAtPeriodEnd && (
                  <Badge
                    variant='outline'
                    className='border-yellow-500/20 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                  >
                    Cancels soon
                  </Badge>
                )}
                <Badge
                  variant={
                    subscriptionInfo.status === "active"
                      ? "default"
                      : subscriptionInfo.status === "trialing"
                        ? "secondary"
                        : "destructive"
                  }
                  className='px-4 py-1'
                >
                  {subscriptionInfo.status.charAt(0).toUpperCase() +
                    subscriptionInfo.status.slice(1)}
                </Badge>
              </div>
            )}
          </div>
        </div>

        <CardContent className='grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3'>
          {/* Price Info */}
          {subscriptionInfo?.plan && (
            <>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <CreditCard className='h-4 w-4' />
                  Billing Amount
                </div>
                <div className='flex items-baseline gap-1'>
                  <span className='text-3xl font-bold'>
                    ${subscriptionInfo.plan.price}
                  </span>
                  <span className='text-muted-foreground'>
                    /{subscriptionInfo.plan.interval}
                  </span>
                </div>
              </div>

              {/* Next Payment */}
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Calendar className='h-4 w-4' />
                  Next Payment
                </div>
                <p className='text-xl font-medium'>
                  {subscriptionInfo.currentPeriodEnd
                    ? new Date(
                        subscriptionInfo.currentPeriodEnd
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              {/* User Limit */}
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Users className='h-4 w-4' />
                  User Limit
                </div>
                <p className='text-xl font-medium'>
                  {subscriptionInfo.maxUsersForSubscription} users
                </p>
              </div>
            </>
          )}
        </CardContent>

        {subscriptionInfo?.plan?.features?.length &&
          subscriptionInfo?.plan?.features?.length > 0 && (
            <>
              <Separator />
              <CardContent className='p-6'>
                <h3 className='mb-4 text-sm font-medium'>Included Features</h3>
                <ul className='grid gap-3 md:grid-cols-2'>
                  {subscriptionInfo.plan.features.map((feature, i) => (
                    <li key={i} className='flex items-center gap-2'>
                      <CheckIcon className='h-4 w-4 text-primary' />
                      <span className='text-sm'>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </>
          )}

        <Separator />
        <CardFooter className='p-6'>
          <div className='flex w-full flex-col gap-4 sm:flex-row'>
            <Button
              onClick={redirectToPortal}
              disabled={portalLoading}
              className='flex-1'
              size='lg'
            >
              {portalLoading ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <CreditCard className='mr-2 h-4 w-4' />
              )}
              Manage Subscription
            </Button>
            {!subscriptionInfo?.plan && (
              <Button asChild variant='outline' size='lg' className='flex-1'>
                <a href='/pricing'>View Plans</a>
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Recent Invoices */}
      {subscriptionInfo?.recentInvoices &&
        subscriptionInfo.recentInvoices.length > 0 && (
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>Recent Invoices</CardTitle>
                  <CardDescription>
                    View and download your recent invoices
                  </CardDescription>
                </div>
                <Receipt className='h-8 w-8 text-muted-foreground' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {subscriptionInfo.recentInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className='flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50'
                  >
                    <div>
                      <p className='font-medium'>
                        ${invoice.amount.toFixed(2)}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {new Date(invoice.date).toLocaleDateString()}
                      </p>
                    </div>
                    {invoice.pdfUrl && (
                      <Button variant='ghost' size='sm' asChild>
                        <a
                          href={invoice.pdfUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center gap-2'
                        >
                          <ExternalLink className='h-4 w-4' />
                          Download
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
