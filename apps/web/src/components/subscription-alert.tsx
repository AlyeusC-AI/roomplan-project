import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import {
  SubscriptionInfo,
  useCreatePortalSession,
  useGetSubscriptionInfo,
} from "@service-geek/api-client";

export function SubscriptionAlert() {
  const [showAlert, setShowAlert] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [daysUntilEnd, setDaysUntilEnd] = useState<number | null>(null);

  const { data: subscriptionInfo } = useGetSubscriptionInfo();
  const {
    mutate: createPortalSession,
    isPending: isCreatingPortalSession,
    data: createPortalSessionData,
  } = useCreatePortalSession();
  useEffect(() => {
    if (subscriptionInfo) {
      checkSubscriptionStatus(subscriptionInfo);
    }
  }, [subscriptionInfo]);

  const checkSubscriptionStatus = (info: SubscriptionInfo) => {
    if (!info) return;

    const now = new Date();
    let endDate: Date | null = null;

    if (info.status === "trialing" && info.freeTrialEndsAt) {
      endDate = new Date(info.freeTrialEndsAt);
    } else if (info.status === "active" && info.currentPeriodEnd) {
      endDate = new Date(info.currentPeriodEnd);
    }

    if (endDate) {
      const daysLeft = Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      setDaysUntilEnd(daysLeft);

      // Show alert if less than 7 days remaining
      if (daysLeft <= 7) {
        setShowAlert(true);
        // Show dialog if less than 3 days remaining
        if (daysLeft <= 3) {
          setShowDialog(true);
        }
      }
    }
  };
  useEffect(() => {
    if (createPortalSessionData) {
      window.location.href = createPortalSessionData.url;
    }
  }, [createPortalSessionData]);

  const handleSubscribe = async () => {
    try {
      const response = await createPortalSession();
    } catch (error) {
      console.error("Failed to open billing portal:", error);
    }
  };

  if (!subscriptionInfo || !showAlert) return null;

  const isTrial = subscriptionInfo.status === "trialing";
  const message = isTrial
    ? `Your trial ends in ${daysUntilEnd} days`
    : subscriptionInfo.cancelAtPeriodEnd
      ? `Your subscription ends in ${daysUntilEnd} days`
      : `Your subscription renews in ${daysUntilEnd} days`;

  return (
    <>
      <Alert
        variant='destructive'
        className='fixed bottom-4 right-4 z-50 w-auto max-w-md'
      >
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>
          {isTrial ? "Trial Ending Soon" : "Subscription Notice"}
        </AlertTitle>
        <AlertDescription className='flex items-center justify-between'>
          <span>{message}</span>
          <Button variant='outline' size='sm' onClick={handleSubscribe}>
            {isTrial ? "Subscribe Now" : "Manage Subscription"}
          </Button>
        </AlertDescription>
      </Alert>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isTrial ? "Trial Ending Soon" : "Subscription Notice"}
            </DialogTitle>
            <DialogDescription>
              {message}. Please take action to ensure uninterrupted service.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setShowDialog(false)}>
              Later
            </Button>
            <Button onClick={handleSubscribe}>
              {isTrial ? "Subscribe Now" : "Manage Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
