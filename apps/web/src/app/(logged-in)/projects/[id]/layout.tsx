"use client";

import { SidebarNav } from "@/components/ui/sidebar-nav";
import { projectStore } from "@atoms/project";
import { projectsStore } from "@atoms/projects";
import { Separator } from "@components/ui/separator";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function Layout({ children }: React.PropsWithChildren) {
  const { id } = useParams();

  const projects = projectsStore((state) => state.projects);
  const project = projectStore((state) => state);

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
    {
      title: "Calendar",
      href: `/projects/${id}/calendar`,
    },
    {
      title: "Roofing",
      href: `/projects/${id}/roofing`,
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

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((res) => res.json())
      .then((data) => {
        project.setProject(data.data);
      });
  });

  return (
    <>
      <div className='hidden space-y-6 pb-16 pl-5 md:block'>
        <div className='fixed z-20 w-full space-y-0.5 bg-background'>
          <h2 className='mt-4 text-2xl font-bold tracking-tight'>
            {project.project?.name}
          </h2>
          <p className='text-muted-foreground'>Manage your project details.</p>
        </div>
        <div className='z-20 bg-background pt-10'>
          <Separator className='fixed my-12 mt-10' />
        </div>
        <div className='flex w-full flex-col space-y-8 pt-10 lg:flex-row lg:gap-x-12 lg:space-y-0'>
          <aside className='-mx-4 lg:w-1/5'>
            <SidebarNav className='fixed min-w-64' items={sidebarNavItems()} />
          </aside>
          <div className='mt-10 flex-1'>{children}</div>
        </div>
      </div>
    </>
  );
}
