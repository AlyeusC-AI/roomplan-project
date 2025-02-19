"use client";

import { projectStore } from "@atoms/project";
import DetailsInput from "@components/Project/overview/DetailsInput";
import { FancyBox } from "@components/ui/fancy-box";
import { Separator } from "@components/ui/separator";
import { LoadingPlaceholder } from "@components/ui/spinner";

export default function OverviewPage() {
  const { project } = projectStore((state) => state);
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-medium'>Project Overview</h3>
          <p className='text-sm text-muted-foreground'>
            Update and manage your general project information and settings.
          </p>
        </div>
        <FancyBox />
      </div>
      <Separator />
      <>{!project ? <LoadingPlaceholder /> : <DetailsInput />}</>
    </div>
  );
}
