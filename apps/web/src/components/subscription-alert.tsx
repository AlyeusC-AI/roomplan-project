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

interface SubscriptionInfo {
  status: string;
  currentPeriodEnd: string | null;
  freeTrialEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
}

export function SubscriptionAlert() {
  const [subscriptionInfo, setSubscriptionInfo] =
    useState<SubscriptionInfo | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [daysUntilEnd, setDaysUntilEnd] = useState<number | null>(null);

  useEffect(() => {
    fetchSubscriptionInfo();
    // Check every hour
    const interval = setInterval(fetchSubscriptionInfo, 3600000);
    return () => clearInterval(interval);
  }, []);

  const fetchSubscriptionInfo = async () => {
    try {
      const response = await fetch("/api/subscription-info");
      if (!response.ok) throw new Error("Failed to fetch subscription info");
      const data = await response.json();
      setSubscriptionInfo(data);
      checkSubscriptionStatus(data);
    } catch (error) {
      console.error("Error fetching subscription info:", error);
    }
  };

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

  const handleSubscribe = async () => {
    try {
      const response = await fetch("/api/create-portal-session", {
        method: "POST",
      });
      const { url } = await response.json();
      window.location.href = url;
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
