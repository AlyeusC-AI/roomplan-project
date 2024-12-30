import { Metadata } from "next";
import BillingPage from './main';
import { Separator } from '@components/ui/separator';

export const metadata: Metadata = {
  title: "Billing",
  description: "Access organization settings and manage your team",
  icons: ["/favicon.ico"],
};

export default function Component() {
  return (
    <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium">Billing</h3>
      <p className="text-sm text-muted-foreground">
        Manage your current plan and billing information.
      </p>
    </div>
    <Separator />
    <BillingPage />
  </div>
  )
}