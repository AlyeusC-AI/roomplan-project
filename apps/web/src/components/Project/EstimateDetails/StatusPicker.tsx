import { Fragment, useState } from 'react'
import projectInfoState from '@atoms/projectInfoState'
import PrimaryButton from '@components/DesignSystem/Buttons/PrimaryButton'
import SecondaryButton from '@components/DesignSystem/Buttons/SecondaryButton'
import TertiaryButton from '@components/DesignSystem/Buttons/TertiaryButton'
import { SupportedColors } from '@components/DesignSystem/Pills/Pill'
import { StatusValuePill } from '@components/Projects/OrgCreation/StatusPill'
import Spinner from '@components/Spinner'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { trpc } from '@utils/trpc'
import { RouterOutputs } from '@restorationx/api'
import clsx from 'clsx'
import { capitalize } from 'lodash'
import { useRouter } from 'next/router'
import { useRecoilState } from 'recoil'
import { v4 } from 'uuid'
import { getRndInteger } from '@restorationx/utils'
import { STATUS_COLORS } from '@components/Settings/Workflow/ColorPicker'

export default function StatusPicker() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('')
  const [projectInfo] = useRecoilState(projectInfoState)
  const getAllProjectStatuses =
    trpc.projectStatus.getAllProjectStatuses.useQuery({
      publicProjectId: router.query.id as string,
    })
  const trpcContext = trpc.useContext()

  const createProjectStatus =
    trpc.projectStatus.createProjectStatus.useMutation({
      async onMutate({ label, color, description }) {
        await trpcContext.projectStatus.getAllProjectStatuses.cancel()
        const prevData =
          trpcContext.projectStatus.getAllProjectStatuses.getData({
            publicProjectId: router.query.id as string,
          })
        const temporaryId = v4()
        trpcContext.projectStatus.getAllProjectStatuses.setData(
          {
            publicProjectId: router.query.id as string,
          },
          (old) => {
            const newData = {
              id: getRndInteger(9999, 1000),
              label,
              color,
              description,
              publicId: temporaryId,
              order: prevData?.statuses.length || -1,
            }
            return {
              selectedStatus: {
                currentStatus: newData,
              },
              statuses: [...(old?.statuses || []), newData],
            }
          }
        )
        return { prevData, temporaryId }
      },
    })
  const associateProjectStatus =
    trpc.projectStatus.associateProjectStatus.useMutation({
      async onMutate({ publicProjectStatusId }) {
        await trpcContext.projectStatus.getAllProjectStatuses.cancel()
        const prevData =
          trpcContext.projectStatus.getAllProjectStatuses.getData({
            publicProjectId: router.query.id as string,
          })
        trpcContext.projectStatus.getAllProjectStatuses.setData(
          {
            publicProjectId: router.query.id as string,
          },
          (old) => {
            const newData = prevData?.statuses.find(
              (s) => s.publicId === publicProjectStatusId
            )
            return {
              selectedStatus: {
                currentStatus: newData || null,
              },
              statuses: old?.statuses || [],
            }
          }
        )
        return { prevData }
      },
      onSettled() {
        trpcContext.projectStatus.getAllProjectStatuses.invalidate()
      },
    })

  const setSelected = async (
    option: RouterOutputs['projectStatus']['getAllProjectStatuses']['statuses'][0]
  ) => {
    if (!option) return
    if (!option.publicId) {
      const newProjectStatus = await createProjectStatus.mutateAsync({
        label: option.label,
        color: option.color,
        description: option.description,
      })
      await associateProjectStatus.mutateAsync({
        publicProjectId: router.query.id as string,
        publicProjectStatusId: newProjectStatus.publicId,
      })
    } else {
      await associateProjectStatus.mutateAsync({
        publicProjectId: router.query.id as string,
        publicProjectStatusId: option.publicId,
      })
    }
  }

  const selectedColor = STATUS_COLORS.find(
    (s) =>
      s.name ===
      getAllProjectStatuses.data?.selectedStatus?.currentStatus?.color
  )

  return (
    <div className="flex justify-end">
      <Listbox
        value={getAllProjectStatuses.data?.selectedStatus?.currentStatus}
        onChange={setSelected}
      >
        {({ open }) => (
          <>
            <Listbox.Label className="sr-only">Change Status</Listbox.Label>
            <div className="relative">
              <div className="inline-flex divide-x divide-white rounded-md shadow-sm">
                <div className="inline-flex divide-x divide-white rounded-md shadow-sm">
                  <div
                    className={clsx(
                      'inline-flex items-center rounded-l-md border border-transparent  py-2 pl-3 pr-4 text-white shadow-sm',
                      selectedColor?.bgColor
                        ? selectedColor.bgColor
                        : 'bg-slate-400'
                    )}
                  >
                    Status:
                    {(createProjectStatus.isLoading ||
                      associateProjectStatus.isLoading) &&
                    !isCreating ? (
                      <Spinner className="ml-2.5" bg="text-white" />
                    ) : (
                      <p className="ml-2.5 text-sm font-bold">
                        {getAllProjectStatuses.data?.selectedStatus
                          ?.currentStatus?.label
                          ? capitalize(
                              getAllProjectStatuses.data?.selectedStatus
                                ?.currentStatus?.label
                            )
                          : projectInfo.status
                          ? capitalize(projectInfo.status)
                          : '--'}
                      </p>
                    )}
                  </div>
                  <Listbox.Button
                    disabled={
                      createProjectStatus.isLoading ||
                      associateProjectStatus.isLoading
                    }
                    className={clsx(
                      'inline-flex items-center rounded-l-none rounded-r-md p-2 text-sm font-medium text-white',
                      selectedColor?.bgColor
                        ? selectedColor.bgColor
                        : 'bg-slate-400'
                    )}
                  >
                    <span className="sr-only">Change published status</span>
                    <ChevronDownIcon
                      className="h-5 w-5 text-white"
                      aria-hidden="true"
                    />
                  </Listbox.Button>
                </div>
              </div>

              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute right-0 z-10 mt-2 w-80 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-primary-action ring-opacity-5 focus:outline-none">
                  <Listbox.Option
                    className={({ active }) =>
                      clsx(
                        'text-gray-900',
                        'w-full cursor-pointer select-none px-4 py-2 text-sm'
                      )
                    }
                    value={null}
                  >
                    {!isCreating ? (
                      <SecondaryButton
                        className="w-full"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setIsCreating(true)
                        }}
                      >
                        Create a new status
                      </SecondaryButton>
                    ) : (
                      <div
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                      >
                        <label
                          htmlFor="label"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Label
                        </label>
                        <div className="mt-1">
                          <input
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                            }}
                            id="label"
                            name="label"
                            type="label"
                            required
                            value={label}
                            onKeyDown={(e) => e.stopPropagation()}
                            onChange={(e) => setLabel(e.target.value)}
                            className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary-action focus:outline-none focus:ring-primary-action sm:text-sm"
                          />
                        </div>
                        <label
                          htmlFor="description"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Description
                        </label>
                        <div className="mt-1">
                          <input
                            id="description"
                            name="description"
                            type="description"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                            }}
                            onKeyDown={(e) => e.stopPropagation()}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary-action focus:outline-none focus:ring-primary-action sm:text-sm"
                          />
                        </div>
                        <label
                          htmlFor="color"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Color
                        </label>
                        <select
                          id="color"
                          name="color"
                          className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-action focus:outline-none focus:ring-primary-action sm:text-sm"
                          defaultValue="Red"
                          onChange={(e) => setColor(e.target.value)}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}
                        >
                          {SupportedColors.map((colorKey) => (
                            <option value={colorKey} key={colorKey}>
                              {capitalize(colorKey)}
                            </option>
                          ))}
                        </select>
                        <div className="mt-4 flex justify-end">
                          <TertiaryButton
                            className="mr-2"
                            onClick={(e) => {
                              setLabel('')
                              setDescription('')
                              setColor('')
                              e.preventDefault()
                              e.stopPropagation()
                              setIsCreating(false)
                            }}
                          >
                            Cancel
                          </TertiaryButton>
                          <PrimaryButton
                            loading={
                              createProjectStatus.isLoading ||
                              associateProjectStatus.isLoading
                            }
                            onClick={async (e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              await setSelected({
                                label,
                                description,
                                color,
                                publicId: '',
                                order: -1,
                                id: 1,
                              })
                              setIsCreating(false)
                            }}
                          >
                            Save Status
                          </PrimaryButton>
                        </div>
                      </div>
                    )}
                  </Listbox.Option>
                  {!isCreating && (
                    <>
                      {(getAllProjectStatuses.data?.statuses || []).map(
                        (option) => (
                          <Listbox.Option
                            key={option.label}
                            className={({ active }) =>
                              clsx(
                                active
                                  ? 'bg-blue-400 text-black'
                                  : 'text-gray-900',
                                'cursor-pointer select-none px-4 py-2 text-sm'
                              )
                            }
                            value={option}
                          >
                            {({ selected, active }) => (
                              <div className="flex flex-col">
                                <div className="flex justify-between">
                                  <div
                                    className={clsx(
                                      STATUS_COLORS.find(
                                        (s) => s.name === option.color
                                      )?.bgColor || 'bg-slate-400',
                                      'rounded-md bg-opacity-50 px-2 text-sm'
                                    )}
                                  >
                                    {option.label}
                                  </div>
                                  {selected ? (
                                    <span
                                      className={
                                        active ? 'text-white' : 'text-primary'
                                      }
                                    >
                                      <CheckIcon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                      />
                                    </span>
                                  ) : null}
                                </div>
                                {option.description && (
                                  <p
                                    className={clsx(
                                      active ? 'text-black' : 'text-gray-500',
                                      'mt-2'
                                    )}
                                  >
                                    {option.description}
                                  </p>
                                )}
                              </div>
                            )}
                          </Listbox.Option>
                        )
                      )}
                    </>
                  )}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
    </div>
  )
}
