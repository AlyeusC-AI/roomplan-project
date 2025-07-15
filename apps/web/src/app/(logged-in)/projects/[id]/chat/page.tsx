"use client";

import ProjectConversationCard from "@/components/Project/layout/ProjectConversationCard";
import { useParams } from "next/navigation";

export default function ProjectChatPage() {
  const { id } = useParams();

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-medium'>Project Chat</h2>
          <p className='text-sm text-muted-foreground'>
            Communicate with your team about this project
          </p>
        </div>
      </div>

      <div className=''>
        <ProjectConversationCard projectId={id as string} />
      </div>
    </div>
  );
}
