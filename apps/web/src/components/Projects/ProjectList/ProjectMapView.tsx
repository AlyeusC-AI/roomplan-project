import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { projectsStore } from "@atoms/projects";

export const ProjectMapView = () => {
  const projects = projectsStore((state) => state.projects);
  const satelliteView = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.GOOGLE_MAPS_API_KEY!,
      version: "weekly",
      libraries: ["places", "drawing", "geometry"],
    });
    loader.load().then(() => {
      if (satelliteView.current) {
        const mapInstance = new google.maps.Map(satelliteView.current, {
          zoom: 10,
          center: {
            lat: Number(projects[0].lat || "41.2033"),
            lng: Number(projects[0].lng || "77.1945"),
          },
          streetViewControl: false,
          rotateControl: false,
          mapTypeControl: false,
        });
        if (projects && projects.length > 0) {
          // set markers for each project location on map
          projects.forEach((project) => {
            // add marker popup
            const infowindow = new google.maps.InfoWindow({
              content: `<div class="flex flex-col items-center">
                <h1 class="text-lg font-bold">${project.name}</h1>
                <p class="text-sm">${project.location}</p>
                </div>`,
            });
            const marker = new google.maps.Marker({
              position: {
                lat: Number(project.lat),
                lng: Number(project.lng),
              },
              map: mapInstance,
              title: project.name,
            });
            marker.addListener("click", () => {
              infowindow.open(mapInstance, marker);
            });
          });
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='grid grid-cols-1 gap-1 lg:grid-cols-1'>
      <div
        id='map'
        className='group relative col-span-5 block h-96 overflow-hidden rounded-lg shadow-md md:col-span-2 lg:col-span-1'
        ref={satelliteView}
      />
    </div>
  );
};
