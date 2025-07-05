"use client";

import { Button } from "@components/ui/button";

import { useGetProjectById } from "@service-geek/api-client";
import { useParams, usePathname } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";

import ContactInfoCard from "./ContactInfoCard";
import AdjusterInfoCard from "./AdjusterInfoCard";
import ProjectUsersCard from "./ProjectUsersCard";
import DescriptionCard from "./DescriptionCard";
import TasksCard from "./TasksCard";
import ProjectConversationCard from "./ProjectConversationCard";
import clsx from "clsx";

export default function InfoSidebar({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean, setIsCollapsed: (isCollapsed: boolean) => void }) {
  const { id } = useParams();
  const pathname = usePathname();
  const { data: project } = useGetProjectById(id as string);
  const projectData = project?.data;
  if (!projectData) return null;
  if (pathname.includes("report")) return null;

  return (
    <div
      className={clsx(
        "",
        isCollapsed ? "w-5 min-w-5" : "w-full w-[400px]"
      )}
    >
      <div
        className={clsx(
          "fixed right-0 top-0 z-30 bg-accent h-screen overflow-y-auto",
          isCollapsed ? "w-12 min-w-12" : "w-[200px] lg:w-[240px] xl:w-[300px] 2xl:w-[400px]"
        )}
      >
        {!isCollapsed && (<div className='space-y-4 p-4'>
          <div className='space-y-4 divide-y divide-gray-200 rounded-lg border border-border bg-background p-4'>
            <ContactInfoCard projectData={projectData} />
            <ProjectUsersCard projectData={projectData} />
            <AdjusterInfoCard projectData={projectData} />
            <DescriptionCard projectData={projectData} />
          </div>
          <div className='rounded-lg border border-border bg-background p-4'>
            <TasksCard />
          </div>
          <div className='rounded-lg border border-border bg-background p-4'>
            <ProjectConversationCard projectId={projectData.id} />
          </div>
        </div>)
        }
      </div>
    </div>
  );
}
