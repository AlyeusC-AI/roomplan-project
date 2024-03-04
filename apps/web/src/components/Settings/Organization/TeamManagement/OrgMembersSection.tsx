import { FormEvent, ReactNode, useMemo, useState } from 'react'
import Error from '@components/DesignSystem/Alerts/Error'
import Success from '@components/DesignSystem/Alerts/Success'
import PrimaryButton from '@components/DesignSystem/Buttons/PrimaryButton'
import SecondaryButton from '@components/DesignSystem/Buttons/SecondaryButton'
import UserAvatar from '@components/DesignSystem/UserAvatar'
import useAmplitudeTrack from '@utils/hooks/useAmplitudeTrack'
import clsx from 'clsx'
import Image from 'next/image'
import { useRecoilState } from 'recoil'
import teamMembersState from '@atoms/teamMembers'
import userInfoState from '@atoms/userInfoState'
import validator from 'validator'

import { Invitation } from '../types'

import { RoleToDescription } from './constants'
import RemoveTeamMember from './RemoveTeamMember'
import RoleSelection from './RoleSelection'

interface OrgMembersSectionProps {
  invitations: Invitation[]
  hideEmptyState?: boolean
  hideDescription?: boolean
  noPadding?: boolean
  children?: ReactNode
  useSecondaryButton?: boolean
}

const OrgMembersSection = ({
  invitations,
  children,
  hideEmptyState = false,
  hideDescription = false,
  noPadding = false,
  useSecondaryButton = false,
}: OrgMembersSectionProps) => {
  const [email, setEmail] = useState('')
  const [emailStatus, setEmailStatus] = useState<{
    ok: boolean
    message: string
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [userInfo] = useRecoilState(userInfoState)
  const [teamMembers, setTeamMembers] = useRecoilState(teamMembersState)
  const { track } = useAmplitudeTrack()
  const addMember = async () => {
    setLoading(true)
    if (validator.isEmail(email)) {
      try {
        const res = await fetch('/api/organization/invite', {
          method: 'POST',
          body: JSON.stringify({
            email,
          }),
        })
        if (!res.ok) {
          const json = await res.json()
          console.error(json)
          if (json) {
            if (json.message === 'existing-invite') {
              setEmailStatus({
                ok: false,
                message: `An invitation already exists for ${email}.`,
              })
            } else if (json.message === 'existing-member') {
              setEmailStatus({
                ok: false,
                message: `${email} is already a member of this organization.`,
              })
            } else {
              setEmailStatus({
                ok: false,
                message: 'Something went wrong. Please try again.',
              })
            }
          } else {
            setEmailStatus({
              ok: false,
              message: 'Something went wrong. Please try again.',
            })
          }
        } else {
          track('Add Organization Team Member')
          setEmail('')

          const json = await res.json()
          setTeamMembers((prev) => [
            {
              isAdmin: false,
              accessLevel: 'viewer',
              user: {
                id: json.userId,
                email,
                firstName: '',
                lastName: '',
                phone: '',
              },
            },
            ...prev,
          ])
          setEmailStatus({
            ok: true,
            message: `An invitation was sent to ${email}`,
          })
        }
      } catch (error) {
        console.error(error)
        setEmailStatus({
          ok: false,
          message: 'Something went wrong. Please try again.',
        })
      }
    } else {
      setEmailStatus({
        ok: false,
        message: 'Please enter a valid email.',
      })
    }
    setLoading(false)
  }

  const addMemberSubmit = (e: FormEvent) => {
    e.preventDefault()
    addMember()
  }

  const filteredTeamMembers = useMemo(
    () => teamMembers.filter(({ user }) => user.email !== userInfo?.email),
    [teamMembers, userInfo]
  )

  return (
    <section aria-labelledby="team-details-heading">
      <form onSubmit={addMemberSubmit}>
        <div className={clsx(!noPadding && 'py-6 px-4 pb-10 sm:p-6')}>
          <>
            {!hideDescription && (
              <>
                <h2
                  id="team-details-heading"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Team Members
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Add members to your organization. They will recieve an
                  invitation email allowing them to access the projects within
                  this organization.
                </p>
              </>
            )}
            <div className="mt-6 flex flex-col sm:flex-row">
              <div className="flex-grow">
                <input
                  type="text"
                  name="add-team-members"
                  id="add-team-members"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                  placeholder="Email address"
                  aria-describedby="add-team-members-helper"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <span className="mt-3 sm:mt-0 sm:ml-3">
                {useSecondaryButton ? (
                  <SecondaryButton
                    onClick={addMember}
                    className="group"
                    loading={loading}
                  >
                    Send Invite
                  </SecondaryButton>
                ) : (
                  <PrimaryButton
                    onClick={addMember}
                    className="group"
                    loading={loading}
                  >
                    Send Invite
                  </PrimaryButton>
                )}
              </span>
            </div>
            {emailStatus && emailStatus.ok && !children && (
              <Success>{emailStatus.message}</Success>
            )}
            {emailStatus && !emailStatus.ok && (
              <Error title="There was a problem adding a new team member.">
                {emailStatus.message}
              </Error>
            )}
            <div className="mt-6">
              {filteredTeamMembers.length > 0 && children && <>{children}</>}
              {filteredTeamMembers.length > 0 ? (
                <ul role="list" className="divide-y divide-gray-200">
                  {filteredTeamMembers?.map((member) => {
                    return (
                      <li
                        key={member.user.email}
                        className="flex flex-col items-start justify-between space-y-6 py-4 pr-4 md:flex-row md:space-y-0"
                      >
                        <div className="flex">
                          <div className="flex items-center justify-center">
                            <UserAvatar
                              email={member.user?.email}
                              userId={member.user.id}
                              firstName={member.user.firstName || ''}
                              lastName={member.user.lastName || ''}
                            />
                            <div className="ml-4 flex flex-col">
                              <span className="text-sm font-medium text-gray-900">
                                {member.user.email}
                              </span>
                              <span className="text-sm text-gray-500">
                                {member.isAdmin
                                  ? 'Account Administrator'
                                  : RoleToDescription[member.accessLevel]}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center md:space-x-4">
                          <RoleSelection member={member} />
                          <RemoveTeamMember
                            id={member.user.id}
                            email={member.user.email}
                            setTeamMembers={setTeamMembers}
                            setEmailStatus={setEmailStatus}
                            isAdmin={member.isAdmin}
                          />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <>
                  {!hideEmptyState && (
                    <div className="flex flex-col items-center justify-center overflow-hidden pt-8 pb-2 sm:flex-row">
                      <div
                        style={{
                          width: 647.63626 / 3,
                          height: 632.17383 / 3,
                        }}
                      >
                        <Image
                          src="/images/team-empty-state.svg"
                          width={647.63626 / 3}
                          height={632.17383 / 3}
                          alt="Empty Team"
                        />
                      </div>
                      <div className="mt-4 flex-col items-center justify-center sm:ml-12 sm:mt-0">
                        <h3 className="text-lg font-medium text-gray-900">
                          Add Team Members
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 sm:max-w-sm">
                          You can control the access level of each team member
                          within your project once added. Access levels range
                          from Adminstrator to Viewer.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        </div>
      </form>
    </section>
  )
}

export default OrgMembersSection
