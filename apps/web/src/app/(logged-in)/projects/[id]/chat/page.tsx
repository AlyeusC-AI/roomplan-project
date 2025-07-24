"use client";

import ProjectConversationCard from "@/components/Project/layout/ProjectConversationCard";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Maximize2 } from "lucide-react";
import { useGetProjectMembers } from "@service-geek/api-client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Phone, MessageCircle } from "lucide-react";

export default function ProjectChatPage() {
  const { id } = useParams();
  const [open, setOpen] = useState(false);
  const { data: membersData } = useGetProjectMembers(id as string);
  const members = membersData?.users || [];

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-medium'>Project Chat</h2>
          <p className='text-sm text-muted-foreground'>
            Communicate with your team about this project
          </p>
        </div>
        <button
          type='button'
          className='ml-4 rounded p-2 transition hover:bg-muted'
          aria-label='Full screen chat'
          onClick={() => setOpen(true)}
        >
          <Maximize2 className='h-5 w-5' />
        </button>
      </div>

      <div className=''>
        <ProjectConversationCard projectId={id as string} />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='flex h-[90vh] w-full max-w-none flex-row p-0'>
          {/* Sidebar */}
          <aside className='flex h-full w-64 flex-col overflow-y-auto border-r bg-muted/40 p-4'>
            <h3 className='mb-4 text-base font-semibold'>Project Members</h3>
            <ul className='space-y-3'>
              {members.map(
                (user: {
                  id: string;
                  firstName: string;
                  lastName: string;
                  avatar: string | null;
                }) => (
                  <li
                    key={user.id}
                    className='flex items-center gap-3 rounded p-2 hover:bg-muted/60'
                  >
                    <Avatar>
                      <AvatarImage
                        src={user.avatar || undefined}
                        alt={user.firstName}
                      />
                      <AvatarFallback>
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className='min-w-0 flex-1'>
                      <div className='truncate text-sm font-medium'>
                        {user.firstName} {user.lastName}
                      </div>
                    </div>
                    <button className='p-1 hover:text-primary' title='Call'>
                      <Phone className='h-4 w-4' />
                    </button>
                    <button className='p-1 hover:text-primary' title='Message'>
                      <MessageCircle className='h-4 w-4' />
                    </button>
                  </li>
                )
              )}
            </ul>
          </aside>
          {/* Main chat area */}
          <div className='flex min-w-0 flex-1 flex-col justify-center'>
            <ProjectConversationCard projectId={id as string} isFullScreen />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
