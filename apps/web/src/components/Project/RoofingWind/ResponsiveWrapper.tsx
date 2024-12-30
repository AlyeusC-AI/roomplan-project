import { Fragment, useEffect, useRef, useState } from 'react'
import DatePicker from 'react-datepicker'
import { projectStore } from '@atoms/project'
import { subscriptionStore } from '@atoms/subscription-status'
import UpgradeModal from '@components/UpgradeModal'
import { Loader } from '@googlemaps/js-api-loader'
import { Dialog, Transition } from '@headlessui/react'
import {
  EllipsisHorizontalIcon,
  ListBulletIcon,
  MapIcon,
} from '@heroicons/react/24/outline'
import { SubscriptionStatus } from '@servicegeek/db'
import { trpc } from '@utils/trpc'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import Papa from 'papaparse'

import 'react-datepicker/dist/react-datepicker.css'

export type HailReportItem = {
  Time?: string
  Speed?: string
  Location?: string
  County?: string
  State?: string
  Lat?: string
  Lon?: string
  Comments?: string
}
const ResponsiveWrapper = ({ accessToken }: { accessToken: string }) => {
  const [hail, setHail] = useState<HailReportItem[]>([])
  const satelliteView = useRef<HTMLDivElement>(null)
  const projectInfo = projectStore((state) => state.project)
  const [loading, setLoading] = useState(true)
  const [toggleView, setToggleView] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const subscriptionStatus = subscriptionStore(state => state.subscriptionStatus)
  const [date, setDate] = useState(new Date())
  const router = useRouter()

  let id = router.query.id || ''
  if (Array.isArray(id) || !id) {
    id = ''
  }
  const allWeatherReports = trpc.weatherReportItems.getAll.useQuery({
    projectPublicId: router.query.id as string,
  })

  console.log(allWeatherReports)
  let columns = [
    'Time',
    'Speed',
    'Location',
    'County',
    'State',
    'Lat',
    'Lon',
    'Comments',
    'addToReport',
  ]
  // todo: https://github.com/JHahn42/ASCServer/blob/a51ba21078ee10089ccc2f3c87e2ac4c1ab22ead/weatherparser.js

  const createWeatherReportItemMutation =
    trpc.weatherReportItems.addWeatherItemToReport.useMutation({
      onSettled() {
        setIsCreating(false)
        allWeatherReports.refetch()
      },
    })
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)

  const deleteWeatherReportItemMutation =
    trpc.weatherReportItems.deleteWeatherReportItemFromReport.useMutation({
      onSettled() {
        allWeatherReports.refetch()
      },
    })
  const removeFromReport = (item: any) => {
    const found = allWeatherReports?.data?.find(
      (reportItem) => reportItem.lat === item.Lat && reportItem.lon === item.Lon
    )
    if (!found) return
    deleteWeatherReportItemMutation.mutateAsync({
      projectPublicId: router.query.id as string,
      id: found.id,
    })
  }
  useEffect(() => {
    const last7Days = []
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dd = String(d.getDate()).padStart(2, '0')
      const mm = String(d.getMonth() + 1).padStart(2, '0') //January is 0!
      const yyyy = d.getFullYear()
      // get last 2 digits of year
      const yy = yyyy.toString().substr(-2)
      const date = yy + mm + dd
      last7Days.push(date)
    }

    last7Days.forEach((date, i) => {
      // get hail report for last 7 days
      const url = `https://www.spc.noaa.gov/climo/reports/${date}_rpts_filtered_wind.csv`
      Papa.parse(url, {
        download: true,
        header: true,
        complete: (results: { data: HailReportItem[] }) => {
          if (results.data.length > 0) {
            results.data.forEach((item) => {
              if (item?.Time) {
                // check if last item in last7Days
                if (i === last7Days.length - 1) {
                  setLoading(false)
                }
                setHail((hail) => [...hail, item])
              }
            })
          }
        },
      })
    })
  }, [])

  const setMarkers = () => {
    const loader = new Loader({
      apiKey: process.env.GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ['places', 'drawing', 'geometry'],
    })
    loader.load().then(() => {
      if (!satelliteView.current) return
      const map = new google.maps.Map(satelliteView?.current, {
        zoom: 10,
        center: {
          lat: Number(projectInfo.lat),
          lng: Number(projectInfo.lng),
        },
        streetViewControl: false,
        rotateControl: false,
        mapTypeControl: false,
      })
      const markers = hail.map((item, i) => {
        // set custom marker
        const iconBase = 'http://maps.google.com/mapfiles/kml/shapes/water.png'

        const marker = new google.maps.Marker({
          icon: iconBase,
          position: {
            lat: Number(item.Lat),
            lng: Number(item.Lon),
          },
          map,
          title: item.Location,
        })
        console.log(marker)
        const infowindow = new google.maps.InfoWindow({
          content: `<div>
        <h1>${item.Location}</h1>
        <p>${item.Time}</p>
        <p>${item.Speed}</p>
        <p>${item.Comments}</p>
        </div>`,
        })
        marker.addListener('click', () => {
          infowindow.open(map, marker)
        })
        // last item in array
        if (i === hail.length - 1) {
          // set center to last item in array
          map.setCenter({
            lat: Number(item.Lat),
            lng: Number(item.Lon),
          })
        }
      })
    })
  }
  useEffect(() => {
    setMarkers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleView])

  const onClick = () => {
    setToggleView(!toggleView)
  }

  const addToReport = (item: HailReportItem) => {
    if (subscriptionStatus !== SubscriptionStatus.active) {
      setUpgradeModalOpen(true)
      return
    }
    setIsCreating(true)
    createWeatherReportItemMutation.mutateAsync({
      projectPublicId: router.query.id as string,
      time: item.Time ?? '',
      location: item.Location ?? '',
      county: item.County ?? '',
      state: item.State ?? '',
      lat: item.Lat ?? '',
      lon: item.Lon ?? '',
      comments: item.Comments ?? '',
      f_scale: '',
      speed: item.Speed ?? '',
      size: '',
      date: new Date(),
    })
  }

  // method to check if item is already in report
  const isItemInReport = (item: HailReportItem) => {
    const found = allWeatherReports?.data?.find(
      (reportItem) => reportItem.lat === item.Lat && reportItem.lon === item.Lon
    )
    if (found) {
      return true
    }
    return false
  }

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <Transition.Root show={isCreating} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={setIsCreating}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child // @ts-ignore
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                    <div>
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <EllipsisHorizontalIcon
                          className="h-6 w-6 text-gray-600"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="mt-3 text-center sm:mt-5">
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-medium leading-6 text-gray-900"
                        >
                          Saving weather item to report
                        </Dialog.Title>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
        <UpgradeModal open={upgradeModalOpen} setOpen={setUpgradeModalOpen} />
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">
              Wind report{' '}
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of wind reports for the last 7 days. The data is provided
              by the NOAA national weather service.
            </p>
            <p className="mt-2 text-sm text-gray-700">
              If you would like to specify a date range:
            </p>
            <div className="flex items-center justify-end rounded-md pt-1 text-xs text-neutral-800">
              <DatePicker
                placeholderText="Click to pick a date"
                selected={date}
                onChange={(d: Date) => {
                  setLoading(true)

                  setDate(d)
                  const dd = String(d.getDate()).padStart(2, '0')
                  const mm = String(d.getMonth() + 1).padStart(2, '0') //January is 0!
                  const yyyy = d.getFullYear()
                  // get last 2 digits of year
                  const yy = yyyy.toString().substr(-2)
                  const date = yy + mm + dd
                  console.log(date)
                  const url = `https://www.spc.noaa.gov/climo/reports/${date}_rpts_filtered_wind.csv`
                  Papa.parse(url, {
                    download: true,
                    header: true,
                    complete: (results: { data: HailReportItem[] }) => {
                      setHail([])
                      if (results.data.length > 0) {
                        results.data.forEach((item) => {
                          if (item?.Time) {
                            setLoading(false)
                            setHail((hail) => [...hail, item])
                          }
                        })
                      }
                    },
                  })
                }}
              />
            </div>
          </div>
          <div className="hidden space-x-2 overflow-hidden rounded-lg bg-gray-300 p-1 font-semibold md:flex">
            <button
              className={clsx(
                'flex items-center justify-center rounded-md px-2 py-1 text-xs text-neutral-800',
                !toggleView && 'bg-white'
              )}
              onClick={() => onClick()}
            >
              <ListBulletIcon className={clsx('mr-2 h-4 text-neutral-800')} />{' '}
              List View
            </button>
            <button
              className={clsx(
                'flex items-center justify-center rounded-md px-2 py-1 text-xs text-neutral-800',
                toggleView && 'bg-white'
              )}
              onClick={() => onClick()}
            >
              <MapIcon className={clsx('mr-2 h-4 text-neutral-800')} />
              Map View
            </button>
          </div>
        </div>
        <div className="mt-8 flex h-full flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table
                  className={clsx(
                    '"min-w-full divide-gray-300" block divide-y',
                    toggleView && 'hidden'
                  )}
                >
                  <thead className="bg-gray-50">
                    <tr>
                      {columns.map((column) => (
                        <th
                          scope="col"
                          key={column}
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          {column === 'addToReport' ? 'Add to report' : column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {hail && hail.length > 0 ? (
                      hail?.map((item, i) => (
                        <tr key={i}>
                          {columns.map((column, i) => {
                            if (column === 'addToReport') {
                              return (
                                <td
                                  key={column}
                                  className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
                                >
                                  {allWeatherReports.isSuccess &&
                                  isItemInReport(item) ? (
                                    <button
                                      onClick={(e) => removeFromReport(item)}
                                      className="rounded bg-gray-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
                                    >
                                      Remove from report
                                    </button>
                                  ) : (
                                    <button
                                      onClick={(e) => addToReport(item)}
                                      className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
                                    >
                                      Add to report
                                    </button>
                                  )}
                                </td>
                              )
                            } else {
                              return (
                                <td
                                  key={column}
                                  className="m-w-s overflow-auto py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
                                >
                                  {/* @ts-ignore-error */}
                                  {item[column]}
                                </td>
                              )
                            }
                          })}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          No hail reports found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div
                  id="map"
                  className={clsx(
                    ' group relative  col-span-5 block  h-screen overflow-hidden rounded-lg shadow-md md:col-span-2 lg:col-span-1',
                    !toggleView && 'hidden'
                  )}
                  ref={satelliteView}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ResponsiveWrapper
