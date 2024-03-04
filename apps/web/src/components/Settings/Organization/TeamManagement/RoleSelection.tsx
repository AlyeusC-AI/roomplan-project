import { Fragment, useState } from 'react'
import toast from 'react-hot-toast'
import Spinner from '@components/Spinner'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { AccessLevel } from '@restorationx/db'
import useAmplitudeTrack from '@utils/hooks/useAmplitudeTrack'
import clsx from 'clsx'
import produce from 'immer'
import { useRecoilState } from 'recoil'
import teamMembersState from '@atoms/teamMembers'

import { Member } from '../types'

import { RoleToDescription } from './constants'

interface PublishingOption {
  title: string
  description: string
  current: boolean
  accessLevel: AccessLevel
}
const publishingOptions: PublishingOption[] = [
  {
    title: RoleToDescription[AccessLevel.admin],
    description: 'Full access.',
    current: true,
    accessLevel: AccessLevel.admin,
  },
  {
    title: RoleToDescription[AccessLevel.accountManager],
    description: 'Access to everything except billing.',
    current: false,
    accessLevel: AccessLevel.accountManager,
  },
  {
    title: RoleToDescription[AccessLevel.projectManager],
    description:
      'Access to everything except billing, and organization settings',
    current: false,
    accessLevel: AccessLevel.projectManager,
  },
  {
    title: RoleToDescription[AccessLevel.contractor],
    description: 'Only able to access projects that they are assigned to',
    current: false,
    accessLevel: AccessLevel.contractor,
  },
  {
    title: RoleToDescription[AccessLevel.viewer],
    description: 'Only able to view projects that they are assigned to',
    current: false,
    accessLevel: AccessLevel.viewer,
  },
]

export default function RollSelection({ member }: { member: Member }) {
  const [_, setTeamMembers] = useRecoilState(teamMembersState)
  const [loading, setIsLoading] = useState(false)
  const { track } = useAmplitudeTrack()
  const selected = publishingOptions.find(
    (o) => o.accessLevel === member.accessLevel
  )
  const onSelect = async (option: PublishingOption) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/organization/member/${member.user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          accessLevel: option.accessLevel,
        }),
      })
      if (res.ok) {
        track('Update Organization Team Member Role')

        setTeamMembers((prevTeamMembers) => {
          const nextState = produce(prevTeamMembers, (draft) => {
            const memberIndex = prevTeamMembers.findIndex(
              (m) => m.user.id === member.user.id
            )
            draft[memberIndex] = {
              ...member,
              accessLevel: option.accessLevel,
            }
          })
          return nextState
        })
        toast.success('Successfully updated user role')
      } else {
        toast.error('Could not update user role.')
      }
    } catch (error) {
      console.error(error)
      toast.error('Could not update user role.')
    }
    setIsLoading(false)
  }
  return (
    <Listbox value={selected} onChange={onSelect} disabled={loading}>
      {({ open }) => (
        <>
          <Listbox.Label className="sr-only">Change Role</Listbox.Label>
          <div className="relative">
            <div className="inline-flex rounded-md shadow-sm">
              <div className="inline-flex items-center rounded-l-md border border-transparent border-gray-400 py-2 pl-3 pr-4 text-gray-500 ">
                <p className="ml-2.5 text-sm font-medium">
                  {loading ? (
                    <Spinner />
                  ) : (
                    <>{selected?.title || 'Unset Role'}</>
                  )}
                </p>
              </div>
              <Listbox.Button
                disabled={loading}
                className="inline-flex items-center rounded-l-none rounded-r-md border  border-l-0 border-gray-400 p-2 text-sm font-medium text-gray-500  "
              >
                <span className="sr-only">Change Role</span>
                <ChevronDownIcon
                  className="h-5 w-5 text-gray-500"
                  aria-hidden="true"
                />
              </Listbox.Button>
            </div>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute right-0 z-10 mt-2 w-96 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {publishingOptions.map((option) => (
                  <Listbox.Option
                    key={option.title}
                    className={({ active }) =>
                      clsx(
                        active ? 'bg-blue-500 text-white' : 'text-gray-900',
                        'cursor-default select-none px-4 py-2 text-sm hover:cursor-pointer'
                      )
                    }
                    value={option}
                  >
                    {({ selected, active }) => (
                      <div className="flex flex-col">
                        <div className="flex justify-between">
                          <p
                            className={
                              selected ? 'font-semibold' : 'font-normal'
                            }
                          >
                            {option.title}
                          </p>
                          {selected ? (
                            <span
                              className={
                                active ? 'text-white' : 'text-blue-500'
                              }
                            >
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </div>
                        <p
                          className={clsx(
                            active ? 'text-blue-200' : 'text-gray-500',
                            'mt-1'
                          )}
                        >
                          {option.description}
                        </p>
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  )
}
