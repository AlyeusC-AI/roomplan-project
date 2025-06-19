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

export function SidebarSubscriptionStatus() {
  const [showWarningModal, setShowWarningModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { data: subscriptionInfo, isLoading: isLoadingSubscriptionInfo } =
    useGetSubscriptionInfo();

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
          <span className='flex items-center gap-1 text-gray-400'>
            <Clock className='h-3 w-3' />
            {daysLeft}d left
          </span>
        </div>
        <Progress value={progress} className='h-1 bg-gray-700' />
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

  return (
    <>
      <Card className='mx-3 mb-3 border-gray-700 bg-gray-800/50'>
        <CardContent className='p-3'>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <div className='flex items-center gap-2'>
                  <span className='text-xs font-medium text-gray-200'>
                    {subscriptionInfo.plan?.name || "No Plan"}
                  </span>
                  {getStatusBadge(subscriptionInfo.status)}
                </div>
              </div>
            </div>

            {showWarning && (
              <div
                className={`flex items-center gap-1 rounded-md p-2 text-xs ${
                  isInactive
                    ? "border border-red-600/30 bg-red-600/20 text-red-400"
                    : "border border-yellow-600/30 bg-yellow-600/20 text-yellow-400"
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
              variant={isInactive ? "destructive" : "outline"}
              size='sm'
              className='h-8 w-full border-gray-600 text-xs text-gray-200 hover:bg-gray-700 hover:text-white'
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
