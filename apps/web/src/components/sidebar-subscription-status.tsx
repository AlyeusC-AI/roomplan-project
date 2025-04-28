import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock } from "lucide-react";
import { SubscriptionWarningModal } from "./subscription-warning-modal";
import { useRouter, usePathname } from "next/navigation";

interface SubscriptionInfo {
  status: string;
  plan: {
    name: string;
    price: number;
    interval: string;
  } | null;
  currentPeriodEnd: string | null;
  freeTrialEndsAt: string | null;
  maxUsersForSubscription: number;
  cancelAtPeriodEnd: boolean;
}

export function SidebarSubscriptionStatus() {
  const [subscriptionInfo, setSubscriptionInfo] =
    useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchSubscriptionInfo();
    const interval = setInterval(fetchSubscriptionInfo, 3600000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (pathname === "/settings/billing") {
      setShowWarningModal(false);
    } else if (subscriptionInfo&&
      subscriptionInfo?.status !== "active" &&
      subscriptionInfo?.status !== "trialing"
    ) {
      setShowWarningModal(true);
    }
  }, [pathname]);

  const fetchSubscriptionInfo = async () => {
    try {
      const response = await fetch("/api/subscription-info");
      if (!response.ok) throw new Error("Failed to fetch subscription info");
      const data = await response.json();
      console.log("🚀 ~ fetchSubscriptionInfo ~ data:", data)
      setSubscriptionInfo(data);

      if (
        data.status !== "active" &&
        data.status !== "trialing" &&
        pathname !== "/settings/billing"
      ) {
        setShowWarningModal(true);
      }
    } catch (error) {
      console.error("Error fetching subscription info:", error);
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
      canceled: { label: "Canceled", variant: "destructive" },
      never: { label: "No Subscription", variant: "destructive" },
    };

    const statusConfig = statusMap[status] || {
      label: status,
      variant: "outline",
    };
    return (
      <Badge variant={statusConfig.variant} className='text-xs'>
        {statusConfig.label}
      </Badge>
    );
  };

  const getTrialProgress = () => {
    if (!subscriptionInfo?.freeTrialEndsAt) return null;

    const trialEnd = new Date(subscriptionInfo.freeTrialEndsAt);
    const now = new Date();
    const totalTrialDays = 14;
    const daysLeft = Math.max(
      0,
      Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );
    const progress = ((totalTrialDays - daysLeft) / totalTrialDays) * 100;

    return (
      <div className='space-y-1'>
        <div className='flex items-center justify-between text-xs'>
          <span className='flex items-center gap-1 text-muted-foreground'>
            <Clock className='h-3 w-3' />
            {daysLeft}d left
          </span>
        </div>
        <Progress value={progress} className='h-1' />
      </div>
    );
  };

  const handleManageSubscription = async () => {
    router.push("/settings/billing");
  };

  if (loading || !subscriptionInfo) return null;

  const isTrial = subscriptionInfo.status === "trialing";
  const isExpiring = subscriptionInfo.cancelAtPeriodEnd;
  const isInactive = !["active", "trialing"].includes(subscriptionInfo.status);
  const showWarning = isTrial || isExpiring || isInactive;

  if(!showWarning) return null;
  return (
    <>
      <Card className='mx-2 mt-2'>
        <CardContent className='p-2'>
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <div className='flex items-center gap-2'>
                  <span className='text-xs font-medium'>
                    {subscriptionInfo.plan?.name || "No Plan"}
                  </span>
                  {getStatusBadge(subscriptionInfo.status)}
                </div>
              </div>
            </div>

            {showWarning && (
              <div
                className={`flex items-center gap-1 rounded-md p-1 text-xs ${
                  isInactive
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                <AlertCircle className='h-3 w-3' />
                <span>
                  {isInactive
                    ? "Subscription inactive - Please upgrade"
                    : isTrial
                      ? "Trial ending"
                      : "Subscription ending"}
                </span>
              </div>
            )}

            {getTrialProgress()}

            <Button
              variant={isInactive ? "destructive" : "ghost"}
              size='sm'
              className='h-7 w-full text-xs'
              onClick={handleManageSubscription}
            >
              {isInactive ? "Upgrade Now" : isTrial ? "Upgrade" : "Manage Plan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <SubscriptionWarningModal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        onUpgrade={handleManageSubscription}
        status={subscriptionInfo.status}
      />
    </>
  );
}
