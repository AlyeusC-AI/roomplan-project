import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useParams } from "next/navigation";
import { projectStore } from "@atoms/project";
import mapboxgl from "mapbox-gl";
import { useTheme } from "next-themes";
import "mapbox-gl/dist/mapbox-gl.css";

const WeatherTitle = ({ children }: { children: React.ReactNode }) => (
  <dt className='truncate text-xs font-semibold uppercase text-white'>
    {children}
  </dt>
);

const WeatherData = ({ children }: { children: React.ReactNode }) => (
  <dd>
    <div className='text-lg font-medium text-white'>{children}</div>
  </dd>
);
type LocationDataProps = {
  showWeather?: boolean;
  showMap?: boolean;
};
const LocationData = ({
  showMap = true,
  showWeather = true,
}: LocationDataProps) => {
  const projectInfo = projectStore((state) => state.project);
  const [, setStreetMap] = useState<mapboxgl.Map>();
  const streetMapView = useRef(null);
  const [, setSatelliteMap] = useState<mapboxgl.Map>();
  const satelliteMapView = useRef(null);
  const { id } = useParams();

  const updateAndFetchWeather = async () => {
    try {
      const res = await fetch(`/api/project/${id}/update-weather`, {
        method: "POST",
      });
      if (res.ok) {
        const { weatherData } = await res.json();
        projectStore.getState().setProject({ ...weatherData });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const theme = useTheme();

  useEffect(() => {
    const streetNode = streetMapView.current;
    const satelliteNode = satelliteMapView.current;
    if (
      typeof window === "undefined" ||
      (streetNode === null && satelliteNode === null)
    )
      return;
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY!;
    // otherwise, create a map instance

    const lngLat = {
      lat: parseFloat(projectInfo?.lat ?? "0"),
      lng: parseFloat(projectInfo?.lng ?? "0"),
    };

    const isDark =
      theme.theme === "dark" ||
      (theme.theme === "system" && theme.systemTheme === "dark");

    const streetMap = new mapboxgl.Map({
      container: streetNode!,
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_API_KEY,
      style: isDark
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/light-v11",
      interactive: false,
      center: lngLat,
      zoom: 16,
    });
    const satelliteMap = new mapboxgl.Map({
      container: satelliteNode!,
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_API_KEY,
      style: "mapbox://styles/mapbox/satellite-v9",
      center: lngLat,
      interactive: false,
      zoom: 16,
    });

    new mapboxgl.Marker({
      color: isDark ? "#FFF" : "#000062",
      draggable: false,
    })
      .setLngLat(lngLat)
      .addTo(streetMap);

    new mapboxgl.Marker({
      color: "#000062",
      draggable: false,
    })
      .setLngLat(lngLat)
      .addTo(satelliteMap);

    const nav = new mapboxgl.NavigationControl({
      visualizePitch: true,
    });
    streetMap.addControl(nav, "bottom-right");
    satelliteMap.addControl(nav, "bottom-right");

    // save the map object to React.useState
    setStreetMap(streetMap);
    setSatelliteMap(satelliteMap);

    return () => {
      streetMap.remove();
      satelliteMap.remove();
    };
  }, []);

  useEffect(() => {
    updateAndFetchWeather();
  }, []);

  return (
    <div className='grid w-full grid-cols-5 gap-5 lg:grid-cols-1'>
      {showMap === true && (
        <>
          <div
            id='street'
            className='group relative col-span-5 block size-full overflow-hidden rounded-lg shadow-md md:col-span-2 lg:col-span-1'
            ref={streetMapView}
          />
          <div
            id='satelitte'
            className='group relative col-span-5 block size-full overflow-hidden rounded-lg shadow-md md:col-span-2 lg:col-span-1'
            ref={satelliteMapView}
          />
        </>
      )}
      {showWeather === true && (
        <div
          className={clsx(
            "relative col-span-5 overflow-hidden rounded-lg bg-gradient-to-br text-white shadow-md md:col-span-1 lg:col-span-1",
            projectInfo?.forecast.toLowerCase() === "clouds" &&
              "from-blue-300 via-gray-400 to-gray-500",
            projectInfo?.forecast.toLowerCase() === "rain" &&
              "from-gray-400 via-gray-500 to-gray-700",
            projectInfo?.forecast.toLowerCase() === "clear" &&
              "from-blue-400 via-blue-500 to-blue-600"
          )}
        >
          <div className='grid grid-cols-2 gap-y-2 bg-opacity-80 p-5 md:flex-col'>
            <div className='flex items-center'>
              <dl>
                <WeatherTitle>Temperature</WeatherTitle>
                <WeatherData>
                  {projectInfo?.temperature ? (
                    <>
                      {Math.floor(parseFloat(projectInfo.temperature))}
                      <span className='ml-2 text-sm'>&deg;F</span>
                    </>
                  ) : (
                    "--"
                  )}
                </WeatherData>
              </dl>
            </div>
            <div className='flex items-center'>
              <dl>
                <WeatherTitle>Humidity</WeatherTitle>
                <WeatherData>
                  {projectInfo?.humidity ? (
                    <>
                      {projectInfo.humidity}
                      <span className='ml-2 text-sm'>%</span>
                    </>
                  ) : (
                    "--"
                  )}
                </WeatherData>
              </dl>
            </div>
            <div className='flex items-center'>
              <dl>
                <WeatherTitle>Forecast</WeatherTitle>
                <WeatherData>{projectInfo?.forecast || "--"}</WeatherData>
              </dl>
            </div>
            <div className='flex items-center'>
              <dl>
                <WeatherTitle>Wind</WeatherTitle>
                <WeatherData>
                  {projectInfo?.wind ? (
                    <>
                      {projectInfo.wind}
                      <span className='ml-2 text-sm'>mph</span>
                    </>
                  ) : (
                    "--"
                  )}
                </WeatherData>
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationData;
