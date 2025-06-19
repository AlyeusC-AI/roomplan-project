"use client";

import { Button } from "@components/ui/button";

import { useGetProjectById } from "@service-geek/api-client";
import { useParams } from "next/navigation";
import { MoreHorizontal } from "lucide-react";

import ContactInfoCard from "./ContactInfoCard";
import AdjusterInfoCard from "./AdjusterInfoCard";
import ProjectUsersCard from "./ProjectUsersCard";
import DescriptionCard from "./DescriptionCard";
import TasksCard from "./TasksCard";
import ProjectConversationCard from "./ProjectConversationCard";

export default function InfoSidebar() {
  const { id } = useParams();
  const { data: project } = useGetProjectById(id as string);
  const projectData = project?.data;

  return (
    <div className='right-4 top-4 z-30 w-full space-y-4'>
      <ContactInfoCard projectData={projectData} />
      <AdjusterInfoCard projectData={projectData} />
      <ProjectUsersCard projectData={projectData} />
      <DescriptionCard projectData={projectData} />
      <TasksCard />
      <ProjectConversationCard />
    </div>
  );
}
