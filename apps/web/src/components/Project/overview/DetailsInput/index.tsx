"use client";

import { toast } from "sonner";

import AssignStakeholders from "./AssignStakeholders";
import InsuranceCompanyInformation from "./InsuranceCompanyInformation";
import ProjectInformation from "./ProjectInformation";
import PropertyOwnerInformation from "./PropertyOwnerInformation";
import Notes from "./Notes";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { teamMembersStore } from "@atoms/team-members";

import { projectStore } from "@atoms/project";
import { MentionMetadata } from "@components/DesignSystem/Mentions/useMentionsMetadata";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import { useSidebar } from "@components/ui/sidebar";

export default function DetailsInput() {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { id } = useParams();
  const { toggleSidebar, state } = useSidebar();
  useEffect(() => {
    if (state === "expanded") {
      toggleSidebar();
    }
  }, []);

  const onDelete = async () => {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }
    setIsLoading(false);
    try {
      const res = await fetch(`/api/v1/projects`, {
        method: "DELETE",
        body: JSON.stringify({
          id: id as string,
        }),
      });
      if (res.ok) {
        router.push("/projects");
      } else {
        toast.error("Could not delete project");
      }
    } catch {
      toast.error("Could not delete project");
    }
    setIsLoading(true);
    setIsConfirming(false);
  };

  const projectInfo = projectStore((state) => state.project);
  const teamMembers = teamMembersStore((state) => state.teamMembers);

  // const createProjectNote = trpc.projects.createProjectNote.useMutation();
  // const projectNotes = trpc.projects.getProjectNotes.useQuery({
  //   projectId: projectInfo!.id,
  // });
  // const notes = projectNotes.data || [];
  // const notesLoading = projectNotes.isLoading;
  const handleAddProjectNote = async ({
    note,
    mentions,
    metadata,
  }: {
    note: string;
    mentions: string[];
    metadata: MentionMetadata[];
  }) => {
    // const res = await createProjectNote.mutateAsync(
    //   {
    //     projectPublicId: id as string,
    //     body: note,
    //     mentions,
    //   },
    //   {
    //     onSettled: async () => {
    //       await notifyMentions({
    //         phoneNumbers: teamMembers
    //           .filter((tm) => mentions.includes(tm.userId))
    //           .map((t) => t.User.phone),
    //         metadata,
    //       });
    //       trpcContext.projects.getProjectNotes.invalidate();
    //     },
    //   }
    // );
  };
  const notifyMentions = async ({
    phoneNumbers,
    metadata,
  }: {
    phoneNumbers: string[];
    metadata: MentionMetadata[];
  }) => {
    try {
      const plainText = metadata.map(({ text }) => text).join("");
      const res = await fetch(`/api/notifications/mentions`, {
        method: "POST",
        body: JSON.stringify({
          body: plainText,
          phoneNumbers,
          client: projectInfo!.clientName,
          location: projectInfo!.location,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        console.log("mentions notified", json);
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className='space-y-7'>
      <PropertyOwnerInformation />
      <Notes
        title='Project Notes'
        subTitle='Share notes with your team about this project. You can tag team members by @ to notify them of a note.'
        notesData={[]}
        isLoading={false}
        handleAddProjectNote={handleAddProjectNote}
      />
      <AssignStakeholders />

      <div className='grid grid-cols-1 gap-6 xl:grid-cols-3'>
        <ProjectInformation />
        <InsuranceCompanyInformation />
      </div>
      <Card className='min-w-60 p-5'>
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-medium'>Project Settings</h3>
              <p className='text-sm text-muted-foreground'>
                Manage settings for this project
              </p>
            </div>
          </div>
          <Separator />
          <Button onClick={() => onDelete()} variant='destructive'>
            {isConfirming
              ? "Are you sure? This cannot be undone."
              : "Delete Project"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
