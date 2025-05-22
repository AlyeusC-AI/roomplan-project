"use client";

import DetailsInput from "@components/Project/overview/DetailsInput";
import { FancyBox } from "@components/ui/fancy-box";
import { Separator } from "@components/ui/separator";
import { LoadingPlaceholder } from "@components/ui/spinner";
import { useGetProjectById } from "@service-geek/api-client";
import { useParams } from "next/navigation";

export default function OverviewPage() {
  const { id } = useParams();
  const { data: project, isLoading } = useGetProjectById(id as string);

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
      {isLoading ? <LoadingPlaceholder /> : <DetailsInput />}
    </div>
  );
}
