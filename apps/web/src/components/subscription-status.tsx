import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";

interface SubscriptionInfo {
  status: string;
  plan: {
    name: string;
    price: number;
    interval: string;
    features: string[];
  } | null;
  currentPeriodEnd: string | null;
  freeTrialEndsAt: string | null;
  maxUsersForSubscription: number;
  cancelAtPeriodEnd: boolean;
}

export function SubscriptionStatus() {
  const [subscriptionInfo, setSubscriptionInfo] =
    useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionInfo();
  }, []);

  const fetchSubscriptionInfo = async () => {
    try {
      const response = await fetch("/api/subscription-info");
      if (!response.ok) throw new Error("Failed to fetch subscription info");
      const data = await response.json();
      setSubscriptionInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      }
    > = {
      active: { label: "Active", variant: "default" },
      trialing: { label: "Trial", variant: "secondary" },
      past_due: { label: "Past Due", variant: "destructive" },
      canceled: { label: "Canceled", variant: "outline" },
      never: { label: "No Subscription", variant: "outline" },
    };

    const statusConfig = statusMap[status] || {
      label: status,
      variant: "outline",
    };
    return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
  };

  const getTrialProgress = () => {
    if (!subscriptionInfo?.freeTrialEndsAt) return null;

    const trialEnd = new Date(subscriptionInfo.freeTrialEndsAt);
    const now = new Date();
    const totalTrialDays = 14; // Assuming 14-day trial
    const daysLeft = Math.max(
      0,
      Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );
    const progress = ((totalTrialDays - daysLeft) / totalTrialDays) * 100;

    return (
      <div className='space-y-2'>
        <div className='flex justify-between text-sm'>
          <span>Trial Progress</span>
          <span>{daysLeft} days remaining</span>
        </div>
        <Progress value={progress} className='h-2' />
      </div>
    );
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch("/api/create-portal-session", {
        method: "POST",
      });
      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      setError("Failed to open billing portal");
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className='p-6 text-center text-destructive'>
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          Subscription Status
          {subscriptionInfo?.status && getStatusBadge(subscriptionInfo.status)}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {subscriptionInfo?.plan && (
          <div className='space-y-2'>
            <h3 className='font-medium'>{subscriptionInfo.plan.name}</h3>
            <p className='text-sm text-muted-foreground'>
              ${subscriptionInfo.plan.price}/{subscriptionInfo.plan.interval}
            </p>
            <ul className='list-disc pl-4 text-sm text-muted-foreground'>
              {subscriptionInfo.plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        )}

        {subscriptionInfo?.freeTrialEndsAt && getTrialProgress()}

        {subscriptionInfo?.currentPeriodEnd && (
          <div className='text-sm text-muted-foreground'>
            {subscriptionInfo.cancelAtPeriodEnd ? (
              <p>
                Subscription will end on{" "}
                {new Date(
                  subscriptionInfo.currentPeriodEnd
                ).toLocaleDateString()}
              </p>
            ) : (
              <p>
                Next billing date:{" "}
                {new Date(
                  subscriptionInfo.currentPeriodEnd
                ).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        <div className='flex justify-end'>
          <Button onClick={handleManageSubscription} variant='outline'>
            Manage Subscription
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
