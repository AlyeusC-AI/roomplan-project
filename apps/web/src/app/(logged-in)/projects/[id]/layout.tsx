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
    // {
    //   title: "Roofing",
    //   href: `/projects/${id}/roofing`,
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

  useEffect(() => {
    fetch(`/api/v1/projects/${id}`)
      .then((res) => res.json())
      .then((data) => {
        project.setProject(data.data);
      });
  }, []);

  return (
    <>
      <div className='space-y-6 py-4 pb-16 pl-5'>
        <div className='sticky top-0 z-20 w-full space-y-0.5 bg-background'>
          <h2 className='mt-4 text-2xl font-bold tracking-tight'>
            {project.project?.name}
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
