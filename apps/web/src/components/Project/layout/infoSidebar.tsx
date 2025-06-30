"use client";

import { Button } from "@components/ui/button";

import { useGetProjectById } from "@service-geek/api-client";
import { useParams } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";

import ContactInfoCard from "./ContactInfoCard";
import AdjusterInfoCard from "./AdjusterInfoCard";
import ProjectUsersCard from "./ProjectUsersCard";
import DescriptionCard from "./DescriptionCard";
import TasksCard from "./TasksCard";
import ProjectConversationCard from "./ProjectConversationCard";
import { useState } from "react";
import clsx from "clsx";

export default function InfoSidebar() {
  const { id } = useParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: project } = useGetProjectById(id as string);
  const projectData = project?.data;
  if (!projectData) return null;

  return (
    <div
      className={clsx(
        "relative h-screen",
        isCollapsed ? "w-5 min-w-5" : "w-full min-w-96 max-w-[25rem]"
      )}
    >
      <div
        className={clsx(
          "fixed right-0 top-0 z-30 h-screen bg-accent",
          isCollapsed ? "w-20 min-w-20" : "w-full min-w-96 max-w-[25rem]"
        )}
      >
        {isCollapsed ? (
          <button
            className='absolute -left-6 top-4 flex h-10 w-10 items-center justify-center rounded-lg border-0 bg-accent'
            onClick={() => setIsCollapsed(false)}
            aria-label='Expand sidebar'
            style={{ zIndex: 40 }}
          >
            <ChevronLeft size={24} />
          </button>
        ) : (
          <>
            {/* <button
              className='absolute -left-6 top-4 flex h-10 w-10 items-center justify-center rounded-lg border-0 bg-accent'
              onClick={() => setIsCollapsed(true)}
              aria-label='Collapse sidebar'
              style={{ zIndex: 40 }}
            >
              <ChevronRight size={24} />
            </button> */}
            <div className='space-y-4 p-4'>
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
