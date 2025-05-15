"use client";

import { toast } from "sonner";

import AssignStakeholders from "./AssignStakeholders";
import InsuranceCompanyInformation from "./InsuranceCompanyInformation";
import ProjectInformation from "./ProjectInformation";
import PropertyOwnerInformation from "./PropertyOwnerInformation";
import Notes from "./Notes";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { projectStore } from "@atoms/project";
import { MentionMetadata } from "@components/DesignSystem/Mentions/useMentionsMetadata";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import { useSidebar } from "@components/ui/sidebar";
import {
  useGetProjectById,
  useDeleteProject,
  useGetOrganizationMembers,
} from "@service-geek/api-client";

export default function DetailsInput() {
  const { id } = useParams();

  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toggleSidebar, state } = useSidebar();
  const deleteProject = useDeleteProject();

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

    setIsDeleting(true);
    try {
      await deleteProject.mutateAsync(id as string);
      router.push("/projects");
    } catch (error) {
      toast.error("Could not delete project");
    } finally {
      setIsDeleting(false);
      setIsConfirming(false);
    }
  };

  return (
    <div className='space-y-7'>
      <PropertyOwnerInformation />
      {/* <Notes
        title='Project Notes'
        subTitle='Share notes with your team about this project. You can tag team members by @ to notify them of a note.'
        notesData={[]}
        isLoading={false}
        handleAddProjectNote={handleAddProjectNote}
      /> */}
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
          <Button
            onClick={() => onDelete()}
            variant='destructive'
            disabled={isDeleting}
          >
            {isDeleting
              ? "Deleting..."
              : isConfirming
                ? "Are you sure? This cannot be undone."
                : "Delete Project"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
