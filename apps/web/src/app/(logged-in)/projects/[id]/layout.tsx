"use client";

import { SidebarNav } from "@/components/ui/sidebar-nav";

import { Separator } from "@components/ui/separator";
import {
  useActiveOrganization,
  useGetProjectById,
} from "@service-geek/api-client";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function Layout({ children }: React.PropsWithChildren) {
  const { id } = useParams();
  const { data: project, isLoading } = useGetProjectById(id as string);
  const org = useActiveOrganization();
  const sidebarNavItems = () => [
    {
      title: "Overview",
      href: `/projects/${id}/overview`,
    },
    {
      title: "Files",
      href: `/projects/${id}/files`,
    },
    {
      title: "Photos",
      href: `/projects/${id}/photos`,
    },
    {
      title: "Mitigation",
      href: `/projects/${id}/mitigation`,
    },
    {
      title: "Expenses",
      href: `/projects/${id}/expenses`,
    },
    // {
    //   title: "Calendar",
    //   href: `/projects/${id}/calendar`,
    // },
    // {
    //   title: "Roofing",
    //   href: `/projects/${id}/roofing`,
    // },
    // {
    //   title: "Documents",
    //   href: `/projects/${id}/documents`,
    // },

    {
      title: "Forms",
      href: `/projects/${id}/forms`,
    },
    {
      title: "Weather",
      href: `/projects/${id}/weather`,
    },
    {
      title: "Report",
      href: `/projects/${id}/report`,
    },
  ];
  if (
    (!project?.data || project?.data?.organizationId !== org?.id) &&
    !isLoading
  ) {
    return (
      <div className='flex min-h-[100%] flex-col items-center justify-center gap-6 rounded-lg bg-gradient-to-b from-gray-50 to-white p-12 shadow-lg transition-all hover:shadow-xl'>
        <div className='animate-pulse rounded-full bg-gray-100 p-6'>
          <svg
            className='h-16 w-16 text-gray-400 transition-colors hover:text-gray-500'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.5}
              d='M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z'
            />
          </svg>
        </div>
        <div className='space-y-4 text-center'>
          <h3 className='animate-fade-in text-2xl font-bold text-gray-900'>
            Project Not Found
          </h3>
          <p className='max-w-md text-lg leading-relaxed text-gray-600'>
            We couldn&apos;t locate the project you&apos;re looking for. It may
            have been moved or deleted.
          </p>
          <button
            onClick={() => window.history.back()}
            className='mt-4 rounded-full bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='space-y-6 py-4 pb-16 pl-5'>
        <div className='sticky top-0 z-20 w-full space-y-0.5 bg-background'>
          <h2 className='mt-4 text-2xl font-bold tracking-tight'>
            {project?.data?.name}
          </h2>
          <p className='pb-4 text-muted-foreground'>
            Manage your project details.
          </p>
          <div className='mt-6'>
            <SidebarNav items={sidebarNavItems()} />
          </div>
          <Separator className='mt-2' />
        </div>
        <div className='mt-[160px]'>{children}</div>
      </div>
    </>
  );
}
