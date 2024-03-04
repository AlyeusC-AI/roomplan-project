import { Dispatch, SetStateAction, useState } from 'react'
import TertiaryButton from '@components/DesignSystem/Buttons/TertiaryButton'
import { TrashIcon } from '@heroicons/react/24/outline'
import useAmplitudeTrack from '@utils/hooks/useAmplitudeTrack'

import { Member } from '../types'

const RemoveTeamMember = ({
  isAdmin,
  id,
  email,
  setTeamMembers,
  setEmailStatus,
}: {
  isAdmin: boolean
  id: string
  email: string
  setTeamMembers: Dispatch<SetStateAction<Member[]>>
  setEmailStatus: Dispatch<
    SetStateAction<{
      ok: boolean
      message: string
    } | null>
  >
}) => {
  const [loadingDelete, setLoadingDelete] = useState(false)
  const { track } = useAmplitudeTrack()
  const removeMember = async (id: string, memberEmail: string) => {
    setLoadingDelete(true)
    try {
      const res = await fetch(`/api/organization/member/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        track('Remove Organization Team Member')
        setTeamMembers((prevEmailInvitations) => {
          return prevEmailInvitations.filter(
            (value) => value.user.email !== memberEmail
          )
        })
        setEmailStatus({
          ok: true,
          message: `Removed ${memberEmail} from the organization.`,
        })
      } else {
        setEmailStatus({
          ok: false,
          message: `Could not remove ${memberEmail}. Please try again.`,
        })
      }
    } catch (error) {
      setEmailStatus({
        ok: false,
        message: `Could not remove ${memberEmail}. Please try again.`,
      })
    }
    setLoadingDelete(false)
  }

  if (isAdmin) return null
  return (
    <TertiaryButton
      loading={loadingDelete}
      variant="danger"
      onClick={() => removeMember(id, email)}
    >
      <TrashIcon className="h-6" />
    </TertiaryButton>
  )
}

export default RemoveTeamMember
