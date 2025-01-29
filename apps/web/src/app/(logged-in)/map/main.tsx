"use client";

import { ProjectType } from "@servicegeek/db/queries/project/listProjects";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function ProjectMapView() {
  // const satelliteView = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<mapboxgl.Map>();
  const mapNode = useRef(null);
  const [open, setOpen] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(
    null
  );
  const router = useRouter();
  const [weatherInfo, setWeatherInfo] = useState<{
    forecast: string;
    humidity: number;
    temperature: string;
    wind: string;
  } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const updateAndFetchWeather = async (projectId: string) => {
    try {
      const res = await fetch(`/api/project/${projectId}/update-weather`, {
        method: "POST",
      });
      if (res.ok) {
        const { weatherData } = await res.json();
        setWeatherInfo(weatherData);
        setWeatherLoading(false);
      }
    } catch (e) {
      console.error(e);
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    const node = mapNode.current;

    // const loader = new Loader({
    //   apiKey: process.env.GOOGLE_MAPS_API_KEY!,
    //   version: 'weekly',
    //   libraries: ['places', 'drawing', 'geometry'],
    // })
    if (typeof window === "undefined" || node === null) return;
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY!;
    console.log("mapboxgl.accessToken", mapboxgl.accessToken);
    // otherwise, create a map instance
    const mapboxMap = new mapboxgl.Map({
      container: node,
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_API_KEY,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-74.5, 40],
      zoom: 9,
    });

    // save the map object to React.useState
    setMap(mapboxMap);

    return () => {
      mapboxMap.remove();
    };
    // loader.load().then(() => {
    //   if (satelliteView.current) {
    //     const mapInstance = new google.maps.Map(satelliteView.current, {
    //       zoom: 10,
    //       center: {
    //         lat: Number(projects ? projects[0].lat : "41.2033"),
    //         lng: Number(projects ? projects[0].lng : "77.1945"),
    //       },
    //       streetViewControl: false,
    //       rotateControl: false,
    //       mapTypeControl: false,
    //     });
    //     if (projects && projects.length > 0) {
    //       // set markers for each project location on map
    //       // set image for each marker
    //       projects.forEach((project) => {
    //         const marker = new google.maps.Marker({
    //           position: {
    //             lat: Number(project.lat),
    //             lng: Number(project.lng),
    //           },
    //           map: mapInstance,
    //           title: project.name,
    //         });
    //         marker.addListener("click", () => {
    //           // set selected project
    //           setSelectedProject(project);
    //           updateAndFetchWeather(project.publicId);
    //           setWeatherLoading(true);
    //           setOpen(true);
    //           // set map center to selected project
    //           mapInstance.setCenter({
    //             lat: Number(project.lat),
    //             lng: Number(project.lng),
    //           });

    //           mapInstance.setZoom(12);
    //         });
    //       });
    //     }
    //   }
    // });
  }, []);

  const handleNavigation = (e: any, publicId: string) => {
    e.preventDefault();
    router.push(`/projects/${publicId}/photos`);
  };

  return (
    // <AppContainer>
    //   <MainContent>
    <>
      <div
        id='map'
        className='group relative col-span-5 block h-full overflow-hidden rounded-lg shadow-md md:col-span-2 lg:col-span-1'
        ref={mapNode}
      />
      {/* {selectedProject && (
        <Transition.Root show={open} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={setOpen}>
            <Transition.Child
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
                            <XCircleIcon
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
                                <PictureInPicture className="h-32 rounded-xl pl-5 text-slate-400" />
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
                                  <span className="sr-only">Details for </span>
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
                                  <Address address={selectedProject.location} />
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
                                  <StatusPill status={selectedProject.status} />
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
                                    <LoadingSpinner />
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
                                      selectedProject.projectAssignees.length >
                                        0 &&
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
                                handleNavigation(e, selectedProject.publicId)
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
      )} */}
    </>
    //   </MainContent>
    // </AppContainer>
  );
}
