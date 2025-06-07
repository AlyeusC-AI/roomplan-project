"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { LoadingPlaceholder } from "@components/ui/spinner";
import { useRouter } from "next/navigation";

function getMapBounds(coordinates: { lat: number; lng: number }[]) {
  if (!coordinates.length) {
    throw new Error("Coordinates array is empty.");
  }

  // Initialize the bounds with the first coordinate
  const bounds = new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]);

  // Extend the bounds to include each coordinate
  for (const coord of coordinates) {
    bounds.extend(coord);
  }

  // Get the center of the bounds
  const center = bounds.getCenter();

  // Get the span of the bounds (southwest and northeast corners)
  const span = {
    southwest: bounds.getSouthWest(),
    northeast: bounds.getNorthEast(),
  };

  return { center, span, bounds };
}

export default function ProjectMapView() {
  // const satelliteView = useRef<HTMLDivElement>(null)
  const [, setMap] = useState<mapboxgl.Map>();
  const mapNode = useRef(null);

  const [loading, setLoading] = useState(false);
  // const { setProjects } = projectsStore();

  // useEffect(() => {
  //   fetchProjects();
  // }, []);

  // function fetchProjects() {
  //   setLoading(true);
  //   fetch(`/api/v1/projects?limit=100`)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setProjects(data.projects, data.total);
  //       setLoading(false);
  //       console.log(data);
  //       setTimeout(() => createMap(data.projects), 1000);
  //     })
  //     .catch((err) => {
  //       if (err instanceof Error) {
  //         console.error(err);
  //         toast.error("Failed to fetch projects", {
  //           description: err.message,
  //         });
  //       }
  //       setLoading(false);
  //     });
  // }

  const theme = useTheme();

  const isDark =
    theme.theme === "dark" ||
    (theme.theme === "system" && theme.systemTheme === "dark");

  const router = useRouter();

  const createMap = (projects: Project[]) => {
    const node = mapNode.current;

    // const loader = new Loader({
    //   apiKey: process.env.GOOGLE_MAPS_API_KEY!,
    //   version: 'weekly',
    //   libraries: ['places', 'drawing', 'geometry'],
    // })
    if (typeof window === "undefined" || node === null) return;

    const bounds = getMapBounds(
      projects.map((p) => ({ lat: Number(p.lat), lng: Number(p.lng) }))
    );

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY!;
    // otherwise, create a map instance
    const mapboxMap = new mapboxgl.Map({
      container: node,
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_API_KEY,
      style: isDark
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/light-v11",
      center: bounds.center,
      bounds: bounds.bounds,
      zoom: 9,
      doubleClickZoom: false,
      dragPan: false,
    });

    mapboxMap.fitBounds(bounds.bounds, {
      padding: 100,
      maxZoom: 15, // Optional: Sets a maximum zoom level
      duration: 1000, // Optional: Animation duration in milliseconds
    });

    mapboxMap.scrollZoom.disable();

    // save the map object to React.useState
    setMap(mapboxMap);

    projects.forEach((project) => {
      const marker = new mapboxgl.Marker({
        color: isDark ? "#FFF" : "#000062",
        draggable: false,
      })
        .setDraggable(false)
        .setLngLat({
          lat: Number(project.lat),
          lng: Number(project.lng),
        })
        .addTo(mapboxMap);
    });

    map.on("click", function (e) {
      console.log(e);

      mapboxMap.featuresAt(
        e.point,
        { radius: 100, layer: "YOUR MARKER LAYER ID" },
        (_, features) => {
          console.log(features[0]);
        }
      );
    });

    return () => {
      mapboxMap.remove();
    };
  };

  if (loading) {
    return <LoadingPlaceholder />;
  }

  return (
    <>
      <div
        id='map'
        className='group relative col-span-5 block h-full overflow-hidden rounded-lg shadow-md md:col-span-2 lg:col-span-1'
        ref={mapNode}
      />
    </>
  );
}
