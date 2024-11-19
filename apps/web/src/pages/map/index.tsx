// @ts-nocheck
import { Fragment, useEffect, useRef, useState } from 'react'
import Address from '@components/DesignSystem/Address'
import UserAvatar from '@components/DesignSystem/UserAvatar'
import AppContainer from '@components/layouts/AppContainer'
import MainContent from '@components/layouts/MainContent'
import StatusPill from '@components/Projects/OrgCreation/StatusPill'
import ProjectListImage from '@components/Projects/ProjectList/ProjectListImage'
import Spinner from '@components/Spinner'
import { Loader } from '@googlemaps/js-api-loader'
import { Dialog, Transition } from '@headlessui/react'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { GOOGLE_MAPS_API_KEY } from '@lib/constants'
import getInvitation from '@servicegeek/db/queries/invitations/getInvitation'
import getSubcriptionStatus from '@servicegeek/db/queries/organization/getSubscriptionStatus'
import getProjectStats from '@servicegeek/db/queries/project/getProjectStats'
import { ProjectType } from '@servicegeek/db/queries/project/listProjects'
import getProjectsData from '@lib/pages/getProjectsData'
import { getQueueTime } from '@lib/qstash/queueInference'
import getOrgInfo, { OrgInfo } from '@lib/serverSidePropsUtils/getOrgInfo'
import getUserInfo, { UserInfo } from '@lib/serverSidePropsUtils/getUserInfo'
import { ORG_ACCESS_LEVEL } from '@lib/serverSidePropsUtils/getUserWithAuthStatus'
import { supabaseServiceRole } from '@lib/supabase/supabaseServiceRoleClient'
import { PresignedUrlMap } from '@pages/projects/[id]/photos'
import { OrganizationInvitation, SubscriptionStatus } from '@servicegeek/db'
import { User } from '@supabase/auth-helpers-nextjs'
import clsx from 'clsx'
import dateFormat from 'dateformat'
import type { GetServerSidePropsContext, NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { RecoilRoot } from 'recoil'
import initRecoilAtoms from '@atoms/initRecoilAtoms'
import superjson from 'superjson'

export interface InviteStatus {
  accepted: boolean
  organizationName: string
  inviteId: string
}

export interface ProjectStats {
  openedProjects: { cur: number; prev: number }
  closedProjects: { cur: number; prev: number }
}
interface ProjectPageProps {
  error?: string
  user: User
  orgId?: string | null
  projects?: ProjectType[] | null
  subscriptionStatus: SubscriptionStatus
  inviteStatus: InviteStatus | null
  userInfo: UserInfo
  orgInfo: OrgInfo
  urlMap: PresignedUrlMap
  projectStats: ProjectStats
  totalProjects: number
}
const ProjectMapView: NextPage<ProjectPageProps> = ({
  // user,
  orgId,
  projects,
  subscriptionStatus,
  inviteStatus,
  userInfo,
  orgInfo,
  urlMap,
  projectStats,
  totalProjects,
}) => {
  const satelliteView = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(true)
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(
    null
  )
  const router = useRouter()
  const [weatherInfo, setWeatherInfo] = useState<{
    forecast: string
    humidity: number
    temperature: string
    wind: string
  } | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const updateAndFetchWeather = async (projectId: string) => {
    try {
      const res = await fetch(`/api/project/${projectId}/update-weather`, {
        method: 'POST',
      })
      if (res.ok) {
        const { weatherData } = await res.json()
        setWeatherInfo(weatherData)
        setWeatherLoading(false)
      }
    } catch (e) {
      console.error(e)
      setWeatherLoading(false)
    }
  }
  useEffect(() => {
    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'drawing', 'geometry'],
    })
    loader.load().then(() => {
      if (satelliteView.current) {
        const mapInstance = new google.maps.Map(satelliteView.current, {
          zoom: 10,
          center: {
            lat: Number(projects ? projects[0].lat : '41.2033'),
            lng: Number(projects ? projects[0].lng : '77.1945'),
          },
          streetViewControl: false,
          rotateControl: false,
          mapTypeControl: false,
        })
        if (projects && projects.length > 0) {
          // set markers for each project location on map
          // set image for each marker
          projects.forEach((project) => {
            // add marker popup
            const infowindow = new google.maps.InfoWindow({
              content: `<div class="flex flex-col items-center">
                <h1 class="text-lg font-bold">${project.name}</h1>
                <p class="text-sm">${project.location}</p>
                </div>`,
            })

            const marker = new google.maps.Marker({
              position: {
                lat: Number(project.lat),
                lng: Number(project.lng),
              },
              map: mapInstance,
              title: project.name,
            })
            marker.addListener('click', () => {
              // set selected project
              setSelectedProject(project)
              updateAndFetchWeather(project.publicId)
              setWeatherLoading(true)
              setOpen(true)
              // set map center to selected project
              mapInstance.setCenter({
                lat: Number(project.lat),
                lng: Number(project.lng),
              })

              mapInstance.setZoom(12)
            })
          })
        }
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleNavigation = (e: any, publicId: string) => {
    e.preventDefault()
    router.push(`/projects/${publicId}/photos`)
  }

  return (
    <RecoilRoot
      initializeState={initRecoilAtoms({
        userInfo,
        orgInfo,
        urlMap,
        projects: projects || [],
      })}
    >
      <AppContainer subscriptionStatus={subscriptionStatus}>
        <Head>
          <title>ServiceGeek - Dashboard</title>
          <meta
            name="description"
            content="Access projects that you have integrated with ServiceGeek"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <MainContent>
          <div
            id="map"
            className=" group relative col-span-5 block  h-screen overflow-hidden rounded-lg shadow-md md:col-span-2 lg:col-span-1"
            ref={satelliteView}
          />
          {selectedProject && (
            <Transition.Root
              show={open} // @ts-ignore
              as={Fragment}
            >
              <Dialog as="div" className="relative z-10" onClose={setOpen}>
                <Transition.Child
                  // @ts-ignore
                  as={Fragment}
                  enter="ease-in-out duration-2000"
                  enterFrom="opacity-0"
                  enterTo="opacity-50"
                  leave="ease-in-out duration-2000"
                  leaveFrom="opacity-50"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-gray-500 bg-opacity-30 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                      <Transition.Child
                        // @ts-ignore
                        as={Fragment}
                        enter="transform transition ease-in-out duration-500 sm:duration-700"
                        enterFrom="translate-x-full"
                        enterTo="translate-x-0"
                        leave="transform transition ease-in-out duration-500 sm:duration-700"
                        leaveFrom="translate-x-0"
                        leaveTo="translate-x-full"
                      >
                        <Dialog.Panel className="pointer-events-auto relative w-96">
                          <Transition.Child
                            // @ts-ignore
                            as={Fragment}
                            enter="ease-in-out duration-500"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in-out duration-500"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <div className="absolute top-0 left-0 -ml-8 flex pt-4 pr-2 sm:-ml-10 sm:pr-4">
                              <button
                                type="button"
                                className="rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                                onClick={() => setOpen(false)}
                              >
                                <span className="sr-only">Close panel</span>
                                <XMarkIcon
                                  className="h-6 w-6"
                                  aria-hidden="true"
                                />
                              </button>
                            </div>
                          </Transition.Child>
                          <div className="h-full overflow-y-auto bg-white p-8">
                            <div className="space-y-6 pb-16">
                              <div>
                                <div className="aspect-w-10 aspect-h-7 block w-full overflow-hidden rounded-lg">
                                  {selectedProject?.images.length === 0 ? (
                                    <PhotoIcon className="h-32 rounded-xl pl-5 text-slate-400" />
                                  ) : (
                                    <div className="aspect-w-10 aspect-h-7 block w-full overflow-hidden rounded-lg">
                                      <ProjectListImage
                                        path={selectedProject?.images[0].key}
                                      />
                                    </div>
                                  )}
                                </div>
                                <div className="mt-4 flex items-start justify-between">
                                  <div>
                                    <h2 className="text-lg font-medium text-gray-900">
                                      <span className="sr-only">
                                        Details for{' '}
                                      </span>
                                      {selectedProject.clientName}
                                    </h2>
                                    <p className="text-sm font-medium text-gray-500">
                                      {selectedProject._count.images} Photos
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <dl className="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200">
                                  <div className="flex justify-between py-3 text-sm font-medium">
                                    <dt className="text-gray-500">Address</dt>
                                    <dt className="text-gray-500">
                                      <Address
                                        address={selectedProject.location}
                                      />
                                    </dt>
                                  </div>
                                  <div className="flex justify-between py-3 text-sm font-medium">
                                    <dt className="text-gray-500">Created</dt>
                                    <dd className="text-gray-900">
                                      {dateFormat(
                                        selectedProject.createdAt,
                                        'dddd, mmmm dS yyyy'
                                      )}
                                    </dd>
                                  </div>
                                  <div className="flex justify-between py-3 text-sm font-medium">
                                    <dt className="text-gray-500">Status</dt>
                                    <dt className="text-gray-500">
                                      <StatusPill
                                        status={selectedProject.status}
                                      />
                                    </dt>
                                  </div>
                                  <div className="flex justify-between py-3 text-sm font-medium">
                                    <dt className="text-gray-500">
                                      Forecast
                                      <br />
                                      Temperature
                                      <br />
                                      Humidity
                                      <br />
                                      Wind
                                    </dt>
                                    {weatherLoading ? (
                                      <dt>
                                        <Spinner />
                                      </dt>
                                    ) : (
                                      <dt className="text-gray-500">
                                        {weatherInfo?.forecast}
                                        <br />
                                        {weatherInfo?.temperature}°F
                                        <br />
                                        {weatherInfo?.humidity} %
                                        <br />
                                        {weatherInfo?.wind} mph
                                      </dt>
                                    )}
                                  </div>
                                  <div className="flex justify-between py-3 text-sm font-medium">
                                    <dt className="text-gray-500">Assignees</dt>
                                    <dt className="text-gray-500">
                                      <div
                                        className={`relative flex h-full ${
                                          selectedProject.projectAssignees
                                            .length > 0 &&
                                          'h-4 min-h-[1rem] w-4 min-w-[1rem] sm:h-8 sm:min-h-[2rem] sm:w-8 sm:min-w-[2rem]'
                                        }`}
                                      >
                                        {selectedProject.projectAssignees.map(
                                          (a, i) => (
                                            <div
                                              key={a.userId}
                                              className="absolute h-full "
                                              style={{ left: `${i * 15}px` }}
                                            >
                                              <UserAvatar
                                                className={clsx(
                                                  'h-4 min-h-[1rem] w-4 min-w-[1rem] sm:h-8 sm:min-h-[2rem] sm:w-8 sm:min-w-[2rem]'
                                                )}
                                                textSize="text-xs"
                                                userId={a.userId}
                                                firstName={a.user.firstName}
                                                lastName={a.user.lastName}
                                                email={a.user?.email}
                                              />
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </dt>
                                  </div>
                                </dl>
                              </div>

                              <div className="flex">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    handleNavigation(
                                      e,
                                      selectedProject.publicId
                                    )
                                  }}
                                  className="flex-1 rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          </div>
                        </Dialog.Panel>
                      </Transition.Child>
                    </div>
                  </div>
                </div>
              </Dialog>
            </Transition.Root>
          )}
        </MainContent>
      </AppContainer>
    </RecoilRoot>
  )
}
export default ProjectMapView

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  try {
    let now,
      end = 0
    now = performance.now()
    const { user, orgAccessLevel } = await getProjectsData(ctx)

    getQueueTime()

    if (!user) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      }
    }

    if (!user.org) {
      return {
        redirect: {
          destination: '/projects',
          permanent: false,
        },
      }
    }

    if (orgAccessLevel === ORG_ACCESS_LEVEL.REMOVED) {
      return {
        redirect: {
          destination: '/access-revoked',
          permanent: false,
        },
      }
    }

    const publicOrgId = user.org?.organization.publicId || null
    let projects = null
    let totalProjects = 0
    if (user.org?.organization.id) {
      const orgWithProjects = user.org.organization.projects
      totalProjects = user.org.organization._count.projects
      projects = superjson.serialize(orgWithProjects)
        .json as unknown as ProjectType[]
    }
    const subscriptionStatus = await getSubcriptionStatus(user.id)

    let inviteStatus: InviteStatus | null = null
    let invitation: OrganizationInvitation | null = null
    if (user.inviteId) {
      invitation = await getInvitation(user.inviteId)
      if (invitation) {
        inviteStatus = {
          accepted: invitation?.isAccepted,
          organizationName: user.org!.organization.name,
          inviteId: invitation.invitationId,
        }
      }
    }

    const imageKeys = projects?.reduce<string[]>((prev, cur) => {
      const images = cur.images.reduce<string[]>(
        (p, c) => [decodeURIComponent(c.key), ...p],
        []
      )
      return [...images, ...prev]
    }, []) as string[]

    const { data, error } = await supabaseServiceRole.storage
      .from('project-images')
      .createSignedUrls(imageKeys, 1800)

    const urlMap = !data
      ? {}
      : data.reduce<PresignedUrlMap>((p, c) => {
          if (c.error) return p
          if (!c.path) return p
          return {
            [c.path]: c.signedUrl,
            ...p,
          }
        }, {})

    const projectStats = await getProjectStats(user.org?.organizationId!)

    end = performance.now()
    console.log(`/projects took ${end - now} ms`)
    return {
      props: {
        orgId: publicOrgId,
        totalProjects,
        projects,
        subscriptionStatus,
        inviteStatus,
        userInfo: getUserInfo(user),
        orgInfo: getOrgInfo(user),
        urlMap,
        projectStats,
      },
    }
  } catch (e) {
    console.error(e)
    return {
      props: {},
    }
  }
}
