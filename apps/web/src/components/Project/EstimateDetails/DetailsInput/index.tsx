import toast from 'react-hot-toast'
import SecondaryButton from '@components/DesignSystem/Buttons/SecondaryButton'

import AssignStakeholders from './AssignStakeholders'
import Form from './Form'
import InsuranceCompanyInformation from './InsuranceCompanyInformation'
import ProjectInformation from './ProjectInformation'
import PropertyOwnerInformation from './PropertyOwnerInformation'
import Notes from './Notes'
import { useRef, useState } from 'react'
import UserAvatar from '@components/DesignSystem/UserAvatar'
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { teamMembersAsStakeHolders } from '@atoms/teamMembers'

import FormContainer from './FormContainer'
import { trpc } from '@utils/trpc'
import projectInfoState from '@atoms/projectInfoState'
import MentionsTextArea from '@components/DesignSystem/Mentions/MentionsTextArea'
import MentionsDisplay from '@components/DesignSystem/Mentions/MentionsDisplay'
import formatDistance from 'date-fns/formatDistance'
import { useUser } from '@supabase/auth-helpers-react'
import useMentionsMetadata, {
  MentionMetadata,
} from '@components/DesignSystem/Mentions/useMentionsMetadata'

export default function DetailsInput() {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const onDelete = async () => {
    if (!isConfirming) {
      setIsConfirming(true)
      return
    }
    setIsLoading(false)
    try {
      const res = await fetch(`/api/project/${router.query.id}`, {
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
  const projectInfo = useRecoilValue(projectInfoState)
  const teamMembers = useRecoilValue(teamMembersAsStakeHolders)

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
        projectPublicId: router.query.id as string,
        body: note,
        mentions,
      },
      {
        onSettled: async (data) => {
          const res1 = await notifyMentions({
            phoneNumbers: teamMembers
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
    <div className=" grid grid-cols-10 gap-6">
      <PropertyOwnerInformation />
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
          <SecondaryButton
            onClick={() => onDelete()}
            variant="danger"
            loading={isLoading}
          >
            {isConfirming
              ? 'Are you sure? This cannot be undone.'
              : 'Delete Project'}
          </SecondaryButton>
        </Form>
      </FormContainer>
    </div>
  )
}
