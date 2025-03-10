import { Metadata } from "next";
import WorkflowPage from "./main";
import { Separator } from "@components/ui/separator";

export const metadata: Metadata = {
  title: "Workflow Settings",
  description: "RestoreGeek workflow settings",
  icons: ["/favicon.ico"],
};

export default async function Component() {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Workflows</h3>
        <p className='text-sm text-muted-foreground'>
          Customize and manage your workflow settings.
        </p>
      </div>
      <Separator />
      <WorkflowPage />
    </div>
  );
}
