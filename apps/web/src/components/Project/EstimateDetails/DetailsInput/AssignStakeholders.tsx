import { useEffect, useRef, useState } from 'react'
import UserAvatar from '@components/DesignSystem/UserAvatar'
import Spinner from '@components/Spinner'
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { CheckIcon } from '@heroicons/react/24/outline'
import { Stakeholders } from '@servicegeek/db/queries/project/getUsersForProject'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { useRecoilState, useRecoilValue } from 'recoil'
import stakeholderState from '@atoms/stakeholderState'
import { teamMembersAsStakeHolders } from '@atoms/teamMembers'

import FormContainer from './FormContainer'

export default function AssignStakeholders() {
  const teamMembers = useRecoilValue(teamMembersAsStakeHolders)
  const [stakeholders, setStakeholders] = useRecoilState(stakeholderState)
  const [loadingId, setLoadingId] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  const addUser = (userId: string) => {
    return fetch(`/api/project/${router.query.id}/stakeholder`, {
      method: 'POST',
      body: JSON.stringify({
        userId,
      }),
    })
  }

  const removeUser = (userId: string) => {
    return fetch(`/api/project/${router.query.id}/stakeholder`, {
      method: 'DELETE',
      body: JSON.stringify({
        userId: userId,
      }),
    })
  }

  const onRemove = async (userId: string) => {
    console.log('removing', userId)
    setLoadingId(userId)
    try {
      const res = await removeUser(userId)
      if (!res.ok) {
        console.error(res)
      }
    } catch (error) {
      console.error(error)
    }
    setLoadingId('')
    setStakeholders((p) => p.filter((m) => m.userId !== userId))
  }

  const onAdd = async (user: Stakeholders) => {
    console.log('adding', user.userId)
    setLoadingId(user.userId)
    try {
      const res = await addUser(user.userId)
      if (!res.ok) {
        console.error(res)
      }
    } catch (error) {
      console.error(error)
    }
    setLoadingId('')
    setStakeholders((p) => [...p, user])
  }

  useEffect(() => {
    // @ts-expect-error
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside, true)
    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [])

  return (
    <FormContainer className="col-span-10">
      <div className="flex flex-col  border border-gray-300 shadow-md sm:rounded-md">
        <div className="bg-white px-4 py-5">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Project Assignees
          </h3>
          <p className="mt-1 mb-1 text-sm text-gray-600">
            Assign employees within your organization to this job. Team members
            that are assigned to a project can optionally receive notifications
            about upcoming job events.
          </p>
        </div>
        <div className="flex-grow bg-white px-4">
          <div className="relative" ref={ref}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen((p) => !p)
              }}
              className="relative flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 bg-white py-2 pl-3 pr-3 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            >
              <div>Click to Assign Team Members</div>
              <ChevronUpDownIcon className="h-6 text-gray-500" />
            </button>
            {isOpen && (
              <div className="absolute top-full left-0 z-50 w-full rounded-md border border-gray-300 bg-white shadow-md">
                {teamMembers.map((member) => {
                  const selected = stakeholders.find(
                    (m) => member.userId === m.userId
                  )
                  return (
                    <button
                      disabled={!!loadingId}
                      key={member.userId}
                      onClick={(e) => {
                        e.stopPropagation()

                        if (selected) {
                          onRemove(member.userId)
                        } else {
                          onAdd(member)
                        }
                      }}
                      className="grid w-full grid-cols-7 gap-2 px-4 py-3 text-sm hover:bg-blue-50 sm:text-base"
                    >
                      <div className="col-span-1 flex h-full items-center justify-center">
                        <UserAvatar
                          userId={member.userId}
                          firstName={member.user.firstName || undefined}
                          lastName={member.user.lastName || undefined}
                          email={member.user?.email}
                        />
                      </div>
                      <div className="col-span-5 flex h-full flex-col justify-start overflow-hidden">
                        <div
                          className={clsx(
                            'font-semibold',
                            'block truncate text-left'
                          )}
                        >
                          {member.user.firstName && member.user.lastName && (
                            <span className="mr-2">
                              {member.user.firstName} {member.user.lastName}
                            </span>
                          )}
                        </div>
                        <span
                          className={clsx(
                            ' text-gray-500',
                            'text-left font-semibold'
                          )}
                        >
                          {member.user.email}
                        </span>
                        <span
                          className={clsx(
                            ' text-gray-500',
                            'text-left font-semibold'
                          )}
                        >
                          {member.user.phone}
                        </span>
                      </div>
                      <div className="col-span-1 flex h-full items-center justify-center">
                        {loadingId === member.userId ? (
                          <Spinner />
                        ) : (
                          <>{selected && <CheckIcon className="h-6" />}</>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        <ul className="flex-grow space-y-4 bg-white px-4 py-5 sm:space-y-6 sm:p-6">
          {stakeholders.map((stakeholder) => (
            <li
              key={`staleholder-${stakeholder.userId}`}
              className="flex items-center"
            >
              <UserAvatar
                userId={stakeholder.userId}
                firstName={stakeholder.user.firstName || undefined}
                lastName={stakeholder.user.lastName || undefined}
                email={stakeholder.user?.email}
              />
              <div className="ml-4 flex flex-col justify-start truncate">
                <div className={clsx('font-semibold', 'block truncate')}>
                  {stakeholder.user.firstName && stakeholder.user.lastName && (
                    <span className="mr-2">
                      {stakeholder.user.firstName} {stakeholder.user.lastName}
                    </span>
                  )}
                </div>
                <span className={clsx(' text-gray-500', 'font-semibold')}>
                  {stakeholder.user.email}
                </span>
                <span className={clsx(' text-gray-500', 'font-semibold')}>
                  {stakeholder.user.phone}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </FormContainer>
  )
}
