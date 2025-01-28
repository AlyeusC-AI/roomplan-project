import { Metadata } from "next";
import AccountSettings from "./main";
import { Separator } from "@components/ui/separator";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "ServiceGeek account settings",
  icons: ["/favicon.ico"],
};

export default async function Component() {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Account Settings</h3>
        <p className='text-sm text-muted-foreground'>
          Update your personal information and manage your account settings
          here.
        </p>
      </div>
      <Separator />
      <AccountSettings />
    </div>
  );
}
