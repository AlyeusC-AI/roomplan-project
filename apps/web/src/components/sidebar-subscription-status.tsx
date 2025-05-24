import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Clock,
  ArrowUpRight,
  AlertTriangle,
  Crown,
} from "lucide-react";
import { SubscriptionWarningModal } from "./subscription-warning-modal";
import { useRouter, usePathname } from "next/navigation";
import { useGetSubscriptionInfo } from "@service-geek/api-client";
import { useSidebar } from "./ui/sidebar";

export function SidebarSubscriptionStatus() {
  const [showWarningModal, setShowWarningModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { data: subscriptionInfo, isLoading: isLoadingSubscriptionInfo } =
    useGetSubscriptionInfo();
  const { toggleSidebar, state } = useSidebar();

  useEffect(() => {
    if (pathname === "/settings/billing") {
      setShowWarningModal(false);
    } else if (
      subscriptionInfo &&
      subscriptionInfo?.status !== "active" &&
      subscriptionInfo?.status !== "trialing"
    ) {
      setShowWarningModal(true);
    }
  }, [pathname]);
  useEffect(() => {
    if (
      subscriptionInfo &&
      subscriptionInfo?.status !== "active" &&
      subscriptionInfo?.status !== "trialing" &&
      pathname !== "/settings/billing"
    ) {
      setShowWarningModal(true);
    }
  }, [subscriptionInfo]);

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

  if (isLoadingSubscriptionInfo || !subscriptionInfo) return null;
  console.log(
    "🚀 ~ SidebarSubscriptionStatus ~ subscriptionInfo:",
    subscriptionInfo
  );

  const isTrial = subscriptionInfo.status === "trialing";
  const isExpiring = subscriptionInfo.cancelAtPeriodEnd;
  const isInactive = !["active", "trialing"].includes(subscriptionInfo.status);
  const showWarning = isTrial || isExpiring || isInactive;

  if (!showWarning) return null;

  if (state === "collapsed") {
    return (
      <>
        <Card className='mx-2 mt-2 border-none bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
          <CardContent className='p-2'>
            <div className='flex flex-col items-center gap-2'>
              <div className='flex flex-col items-center gap-1'>
                {isTrial ? (
                  <div className='flex items-center gap-1 text-muted-foreground'>
                    <Clock className='h-4 w-4' />
                    <span className='text-[10px]'>
                      {Math.ceil(
                        (new Date(subscriptionInfo.freeTrialEndsAt!).getTime() -
                          new Date().getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}
                    </span>
                  </div>
                ) : (
                  <AlertTriangle
                    className={`h-4 w-4 ${isInactive ? "text-destructive" : "text-yellow-500"}`}
                  />
                )}
              </div>
              <Button
                variant={isInactive ? "destructive" : "ghost"}
                size='sm'
                className='h-7 w-7 p-0 hover:bg-primary/10'
                onClick={handleManageSubscription}
                title={isInactive ? "Upgrade" : "Manage subscription"}
              >
                <Crown className='h-4 w-4' />
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
