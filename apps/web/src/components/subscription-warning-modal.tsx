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
import { useRouter } from "next/navigation";

interface SubscriptionWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  status: string;
}

export function SubscriptionWarningModal({
  isOpen,
  onClose,
  onUpgrade,
  status,
}: SubscriptionWarningModalProps) {
  const isTrial = status === "trialing";
  const isInactive = !["active", "trialing"].includes(status);
  const router = useRouter();

  const handleUpgrade = () => {
    router.push("/settings/billing");
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Only allow closing if it's a trial warning
        if (!isInactive) {
          onClose();
        }
      }}
    >
      <DialogContent
        className='sm:max-w-md'
        onPointerDownOutside={(e) => {
          // Prevent closing on outside click for inactive subscriptions
          if (isInactive) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <AlertCircle className='h-5 w-5 text-destructive' />
            {isInactive ? "Subscription Inactive" : "Trial Ending Soon"}
          </DialogTitle>
          <DialogDescription>
            {isInactive
              ? "Your subscription is no longer active. Please upgrade to continue using the service."
              : "Your trial period is ending soon. Upgrade to continue using all features."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='sm:justify-start'>
          <Button
            variant='destructive'
            onClick={handleUpgrade}
            className='w-full'
          >
            {isInactive ? "Upgrade Now" : "Upgrade Plan"}
          </Button>
          {!isInactive && (
            <Button variant='outline' onClick={onClose} className='w-full'>
              Maybe Later
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
