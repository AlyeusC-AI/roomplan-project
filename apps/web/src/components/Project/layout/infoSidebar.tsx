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
import { Card, CardContent } from "@components/ui/card";

export default function InfoSidebar() {
  const { id } = useParams();
  const { data: project } = useGetProjectById(id as string);
  const projectData = project?.data;
  if (!projectData) return null;

  return (
    <Card className='right-4 top-4 z-30 w-full space-y-4'>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <div className='border-b border-gray-200 pb-4'>
            <ContactInfoCard projectData={projectData} />
          </div>
          <div className='border-b border-gray-200 pb-4'>
            <AdjusterInfoCard projectData={projectData} />
          </div>
          <div className='border-b border-gray-200 pb-4'>
            <ProjectUsersCard projectData={projectData} />
          </div>
          <div className='border-b border-gray-200 pb-4'>
            <DescriptionCard projectData={projectData} />
          </div>
          <div className='border-b border-gray-200 pb-4'>
            <TasksCard />
          </div>
          <div>
            <ProjectConversationCard />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
