import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import clsx from "clsx";
import { useParams } from "next/navigation";
import Papa from "papaparse";
import { CalendarIcon, EllipsisIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { Button } from "@components/ui/button";
import { format } from "date-fns";
import { Calendar } from "@components/ui/calendar";
import { cn } from "@lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Separator } from "@components/ui/separator";
import { Card } from "@components/ui/card";

import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";

export type HailReportItem = {
  Time?: string;
  Speed?: string;
  Location?: string;
  County?: string;
  State?: string;
  Lat?: string;
  Lon?: string;
  Comments?: string;
};
const ResponsiveWrapper = () => {
  const [hail, setHail] = useState<HailReportItem[]>([]);
  // const satelliteView = useRef<HTMLDivElement>(null);
  const mapNode = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map>();
  const [view, setView] = useState<"list" | "map">("list");
  const [isCreating, setIsCreating] = useState(false);
  const [date, setDate] = useState(new Date());
  const { id } = useParams<{ id: string }>();

  // const allWeatherReports = trpc.weatherReportItems.getAll.useQuery({
  //   projectPublicId: id,
  // });

  const columns = [
    "Time",
    "Speed",
    "Location",
    "County",
    "State",
    "Lat",
    "Lon",
    "Comments",
    "addToReport",
  ];

  // const createWeatherReportItemMutation =
  //   trpc.weatherReportItems.addWeatherItemToReport.useMutation({
  //     onSettled() {
  //       setIsCreating(false);
  //       allWeatherReports.refetch();
  //     },
  //   });

  // const deleteWeatherReportItemMutation =
  //   trpc.weatherReportItems.deleteWeatherReportItemFromReport.useMutation({
  //     onSettled() {
  //       allWeatherReports.refetch();
  //     },
  //   });
  const removeFromReport = (item: HailReportItem) => {
    const found = allWeatherReports?.data?.find(
      (reportItem) => reportItem.lat === item.Lat && reportItem.lon === item.Lon
    );
    if (!found) return;
    // deleteWeatherReportItemMutation.mutateAsync({
    //   projectPublicId: id,
    //   id: found.id,
    // });
  };
  useEffect(() => {
    const last7Days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0"); //January is 0!
      const yyyy = d.getFullYear();
      // get last 2 digits of year
      const yy = yyyy.toString().substr(-2);
      const date = yy + mm + dd;
      last7Days.push(date);
    }

    last7Days.forEach((date) => {
      // get hail report for last 7 days
      const url = `https://www.spc.noaa.gov/climo/reports/${date}_rpts_filtered_wind.csv`;
      Papa.parse(url, {
        download: true,
        header: true,
        complete: (results: { data: HailReportItem[] }) => {
          if (results.data.length > 0) {
            results.data.forEach((item) => {
              if (item?.Time) {
                setHail((hail) => [...hail, item]);
              }
            });
          }
        },
      });
    });
  }, []);

  // useEffect(() => {
  //   mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY!;

  //   const node = mapNode.current;

  //   if (typeof window === "undefined" || node === null) {
  //     console.log("No window or node");
  //     return;
  //   }

  //   const mapRef = new mapboxgl.Map({
  //     container: node,
  //     maxZoom: 2,
  //     minZoom: 2,
  //     accessToken: process.env.NEXT_PUBLIC_MAPBOX_API_KEY,
  //     zoom: 2,
  //     center: [-28, 47],
  //     style: "mapbox://styles/mapbox/dark-v11",
  //   });

  //   console.log("Setting up map");

  //   // mapRef.on("load", () => {
  //   //   mapRef.addSource("raster-array-source", {
  //   //     type: "raster-array",
  //   //     url: "mapbox://rasterarrayexamples.gfs-winds",
  //   //     tileSize: 512,
  //   //   });
  //   //   mapRef.addLayer({
  //   //     id: "wind-layer",
  //   //     type: "raster-particle",
  //   //     source: "raster-array-source",
  //   //     "source-layer": "10winds",
  //   //     paint: {
  //   //       "raster-particle-speed-factor": 0.4,
  //   //       "raster-particle-fade-opacity-factor": 0.9,
  //   //       "raster-particle-reset-rate-factor": 0.4,
  //   //       "raster-particle-count": 4000,
  //   //       "raster-particle-max-speed": 40,
  //   //       "raster-particle-color": [
  //   //         "interpolate",
  //   //         ["linear"],
  //   //         ["raster-particle-speed"],
  //   //         1.5,
  //   //         "rgba(134,163,171,256)",
  //   //         2.5,
  //   //         "rgba(126,152,188,256)",
  //   //         4.12,
  //   //         "rgba(110,143,208,256)",
  //   //         4.63,
  //   //         "rgba(110,143,208,256)",
  //   //         6.17,
  //   //         "rgba(15,147,167,256)",
  //   //         7.72,
  //   //         "rgba(15,147,167,256)",
  //   //         9.26,
  //   //         "rgba(57,163,57,256)",
  //   //         10.29,
  //   //         "rgba(57,163,57,256)",
  //   //         11.83,
  //   //         "rgba(194,134,62,256)",
  //   //         13.37,
  //   //         "rgba(194,134,63,256)",
  //   //         14.92,
  //   //         "rgba(200,66,13,256)",
  //   //         16.46,
  //   //         "rgba(200,66,13,256)",
  //   //         18.0,
  //   //         "rgba(210,0,50,256)",
  //   //         20.06,
  //   //         "rgba(215,0,50,256)",
  //   //         21.6,
  //   //         "rgba(175,80,136,256)",
  //   //         23.66,
  //   //         "rgba(175,80,136,256)",
  //   //         25.21,
  //   //         "rgba(117,74,147,256)",
  //   //         27.78,
  //   //         "rgba(117,74,147,256)",
  //   //         29.32,
  //   //         "rgba(68,105,141,256)",
  //   //         31.89,
  //   //         "rgba(68,105,141,256)",
  //   //         33.44,
  //   //         "rgba(194,251,119,256)",
  //   //         42.18,
  //   //         "rgba(194,251,119,256)",
  //   //         43.72,
  //   //         "rgba(241,255,109,256)",
  //   //         48.87,
  //   //         "rgba(241,255,109,256)",
  //   //         50.41,
  //   //         "rgba(256,256,256,256)",
  //   //         57.61,
  //   //         "rgba(256,256,256,256)",
  //   //         59.16,
  //   //         "rgba(0,256,256,256)",
  //   //         68.93,
  //   //         "rgba(0,256,256,256)",
  //   //         69.44,
  //   //         "rgba(256,37,256,256)",
  //   //       ],
  //   //     },
  //   //   });
  //   // });

  //   setMap(mapRef);

  //   return () => {
  //     mapRef.remove();
  //   };
  // }, []);

  useEffect(() => {
    const node = mapNode.current;

    if (typeof window === "undefined" || node === null) return;
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY!;
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
  }, []);
  const addToReport = (item: HailReportItem) => {
    setIsCreating(true);
    // createWeatherReportItemMutation.mutateAsync({
    //   projectPublicId: id,
    //   time: item.Time ?? "",
    //   location: item.Location ?? "",
    //   county: item.County ?? "",
    //   state: item.State ?? "",
    //   lat: item.Lat ?? "",
    //   lon: item.Lon ?? "",
    //   comments: item.Comments ?? "",
    //   f_scale: "",
    //   speed: item.Speed ?? "",
    //   size: "",
    //   date: new Date(),
    // });
  };

  // method to check if item is already in report
  const isItemInReport = (item: HailReportItem) => {
    const found = allWeatherReports?.data?.find(
      (reportItem) => reportItem.lat === item.Lat && reportItem.lon === item.Lon
    );
    if (found) {
      return true;
    }
    return false;
  };

  return (
    <Tabs
      value={view}
      onValueChange={(e) => setView(e as "list" | "map")}
      className='flex flex-col'
    >
      <div className='px-4 sm:px-6 lg:px-8'>
        <div className='space-y-6 sm:flex-auto'>
          <div>
            <h3 className='text-lg font-medium'>Wind report</h3>
            <p className='text-sm text-muted-foreground'>
              A list of wind reports for the last 7 days. The data is provided
              by the NOAA national weather service.
            </p>
          </div>
          <Separator />
          <div className='flex items-center justify-between rounded-md pt-1 text-xs text-neutral-800'>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className='mr-2 size-4' />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='p-0'>
                <Calendar
                  mode='single'
                  selected={date}
                  onSelect={(d) => {
                    setDate(d ?? new Date());
                    const dd = String(d?.getDate()).padStart(2, "0");
                    const mm = String(d?.getMonth() ?? 0 + 1).padStart(2, "0"); //January is 0!
                    const yyyy = d?.getFullYear();
                    // get last 2 digits of year
                    const yy = yyyy?.toString().substr(-2);
                    const date = yy + mm + dd;
                    console.log(date);
                    const url = `https://www.spc.noaa.gov/climo/reports/${date}_rpts_filtered_wind.csv`;
                    Papa.parse(url, {
                      download: true,
                      header: true,
                      complete: (results: { data: HailReportItem[] }) => {
                        setHail([]);
                        if (results.data.length > 0) {
                          results.data.forEach((item) => {
                            if (item?.Time) {
                              setHail((hail) => [...hail, item]);
                            }
                          });
                        }
                      },
                    });
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <TabsList className='grid w-48 grid-cols-2'>
              <TabsTrigger value='list'>List View</TabsTrigger>
              <TabsTrigger value='map'>Map View</TabsTrigger>
            </TabsList>
          </div>
        </div>
        <Transition.Root show={isCreating} as={Fragment}>
          <Dialog as='div' className='relative z-10' onClose={setIsCreating}>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0'
              enterTo='opacity-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100'
              leaveTo='opacity-0'
            >
              <div className='fixed inset-0 bg-gray-500/75 transition-opacity' />
            </Transition.Child>

            <div className='fixed inset-0 z-10 overflow-y-auto'>
              <div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
                <Transition.Child
                  as={Fragment}
                  enter='ease-out duration-300'
                  enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
                  enterTo='opacity-100 translate-y-0 sm:scale-100'
                  leave='ease-in duration-200'
                  leaveFrom='opacity-100 translate-y-0 sm:scale-100'
                  leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
                >
                  <Dialog.Panel className='relative overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6'>
                    <div>
                      <div className='mx-auto flex size-12 items-center justify-center rounded-full bg-gray-100'>
                        <EllipsisIcon
                          className='size-6 text-gray-600'
                          aria-hidden='true'
                        />
                      </div>
                      <div className='mt-3 text-center sm:mt-5'>
                        <Dialog.Title
                          as='h3'
                          className='text-lg font-medium leading-6 text-gray-900'
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
        <div className='sm:flex sm:items-center'>
          <TabsContent value='list'>
            <div className='mt-8 flex h-full flex-col overflow-x-auto sm:-mx-6 lg:-mx-8'>
              <div className='inline-block min-w-full py-2 align-middle md:px-6 lg:px-8'>
                <Card>
                  <div className='shadow ring-1 ring-black/5 md:rounded-lg'>
                    <table
                      className={clsx(
                        "block min-w-full divide-y divide-gray-300",
                        view == "map" && "hidden"
                      )}
                    >
                      <thead className='bg-backround'>
                        <tr>
                          {columns.map((column) => (
                            <th
                              scope='col'
                              key={column}
                              className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-foreground sm:pl-6'
                            >
                              {column === "addToReport"
                                ? "Add to report"
                                : column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-200'>
                        {hail && hail.length > 0 ? (
                          hail?.map((item, i) => (
                            <tr key={i}>
                              {columns.map((column) => {
                                if (column === "addToReport") {
                                  return (
                                    <td
                                      key={column}
                                      className='py-4 pl-4 pr-3 text-sm font-medium text-foreground sm:pl-6'
                                    >
                                      {/* {allWeatherReports.isSuccess &&
                                      isItemInReport(item) ? (
                                        <Button
                                          onClick={() => removeFromReport(item)}
                                          variant='destructive'
                                        >
                                          Remove from report
                                        </Button>
                                      ) : (
                                        // <button
                                        //   onClick={() => removeFromReport(item)}
                                        //   className='rounded bg-gray-500 px-4 py-2 font-bold text-white hover:bg-blue-700'
                                        // >

                                        // </button>
                                        <Button
                                          onClick={() => addToReport(item)}
                                        >
                                          Add to report
                                        </Button>
                                      )} */}
                                    </td>
                                  );
                                } else {
                                  return (
                                    <td
                                      key={column}
                                      className='overflow-auto py-4 pl-4 pr-3 text-sm font-medium text-foreground sm:pl-6'
                                    >
                                      {/* @ts-expect-error IDK yet */}
                                      {item[column]}
                                    </td>
                                  );
                                }
                              })}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6'>
                              No hail reports found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent value='map'>
            {/* <div
              id='map'
              className={clsx(
                "group relative col-span-5 block h-screen overflow-hidden rounded-lg shadow-md md:col-span-2 lg:col-span-1"
              )}
              ref={mapNode}
            /> */}
            <div
              id='map'
              className='group relative col-span-5 block h-full overflow-hidden rounded-lg shadow-md md:col-span-2 lg:col-span-1'
              ref={mapNode}
            />
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
};

export default ResponsiveWrapper;
