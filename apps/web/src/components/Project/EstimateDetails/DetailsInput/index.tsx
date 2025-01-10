'use client'

import { toast } from 'sonner'

import AssignStakeholders from './AssignStakeholders'
import Form from './Form'
import InsuranceCompanyInformation from './InsuranceCompanyInformation'
import ProjectInformation from './ProjectInformation'
import PropertyOwnerInformation from './PropertyOwnerInformation'
import Notes from './Notes'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { teamMembersStore } from '@atoms/team-members'

import FormContainer from './FormContainer'
import { trpc } from '@utils/trpc'
import { projectStore } from '@atoms/project'
import { MentionMetadata } from '@components/DesignSystem/Mentions/useMentionsMetadata'
import { Button } from '@components/ui/button'

export default function DetailsInput() {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { id } = useParams()
  const onDelete = async () => {
    if (!isConfirming) {
      setIsConfirming(true)
      return
    }
    setIsLoading(false)
    try {
      const res = await fetch(`/api/project/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        router.push('/projects')
      } else {
        toast.error('Could not delete project')
      }
    } catch (error) {
      toast.error('Could not delete project')
    }
    setIsLoading(true)
    setIsConfirming(false)
  }

  const trpcContext = trpc.useContext()
  const projectInfo = projectStore((state) => state.project)
  const teamMembers = teamMembersStore(
    (state) => state.getTeamMembersAsStakeHolders
  )

  const createProjectNote = trpc.projects.createProjectNote.useMutation()
  const projectNotes = trpc.projects.getProjectNotes.useQuery({
    projectId: projectInfo.id,
  })
  const notes = projectNotes.data || []
  const notesLoading = projectNotes.isLoading
  const handleAddProjectNote = async ({
    note,
    mentions,
    metadata,
  }: {
    note: string
    mentions: string[]
    metadata: MentionMetadata[]
  }) => {
    const res = await createProjectNote.mutateAsync(
      {
        projectPublicId: id as string,
        body: note,
        mentions,
      },
      {
        onSettled: async () => {
          await notifyMentions({
            phoneNumbers: teamMembers()
              .filter((tm) => mentions.includes(tm.userId))
              .map((t) => t.user.phone),
            metadata,
          })
          trpcContext.projects.getProjectNotes.invalidate()
        },
      }
    )
  }
  const notifyMentions = async ({
    phoneNumbers,
    metadata,
  }: {
    phoneNumbers: string[]
    metadata: MentionMetadata[]
  }) => {
    try {
      const plainText = metadata.map(({ text }) => text).join('')
      const res = await fetch(`/api/notifications/mentions`, {
        method: 'POST',
        body: JSON.stringify({
          body: plainText,
          phoneNumbers,
          client: projectInfo.clientName,
          location: projectInfo.location,
        }),
      })
      if (res.ok) {
        const json = await res.json()
        console.log('mentions notified', json)
      }
    } catch (error) {
      console.error(error)
    }
  }
  return (
    <div className="w-[100vh-100px]">
      <PropertyOwnerInformation />
      <div className=" grid grid-cols-10 gap-6">
      <Notes
          title="Project Notes"
          subTitle="Share notes with your team about this project. You can tag team members by @ to notify them of a note."
          notesData={notes}
          isLoading={notesLoading}
          handleAddProjectNote={handleAddProjectNote}
        />
        <AssignStakeholders />
        <ProjectInformation />
        <InsuranceCompanyInformation />
        <FormContainer className="col-span-10">
          <Form
            title="Project Settings"
            description="Manage settings for this project"
            childContainerClassNames="flex"
          >
            <Button onClick={() => onDelete()} variant="destructive">
              {isConfirming
                ? 'Are you sure? This cannot be undone.'
                : 'Delete Project'}
            </Button>
          </Form>
        </FormContainer>
      </div>
    </div>
  )
}
