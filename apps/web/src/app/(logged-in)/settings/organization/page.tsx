import { Metadata } from "next";
import Organization from "./main";
import { Separator } from "@components/ui/separator";

export const metadata: Metadata = {
  title: "Organization Settings",
  description: "Access organization settings and manage your team",
  icons: ["/favicon.ico"],
};

export default async function Component() {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Organization Settings</h3>
        <p className='text-sm text-muted-foreground'>
          Update your organization information and manage your team here.
        </p>
      </div>
      <Separator />
      <Organization />
    </div>
  );
}
