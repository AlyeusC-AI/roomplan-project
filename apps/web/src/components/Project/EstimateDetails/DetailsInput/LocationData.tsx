import { ReactNode, useEffect, useRef } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { GOOGLE_MAPS_API_KEY } from '@lib/constants'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { useRecoilState } from 'recoil'
import projectInfoState from '@atoms/projectInfoState'

const WeatherTitle = ({ children }: { children: ReactNode }) => (
  <dt className="truncate text-xs font-semibold uppercase text-white">
    {children}
  </dt>
)

const WeatherData = ({ children }: { children: ReactNode }) => (
  <dd>
    <div className="text-lg font-medium text-white">{children}</div>
  </dd>
)
type LocationDataProps = {
  showWeather?: boolean
  showMap?: boolean
}
const LocationData = ({ showMap = true, showWeather = true} : LocationDataProps) => {
  const [projectInfo, setProjectInfo] = useRecoilState(projectInfoState)
  const streetView = useRef<HTMLDivElement>(null)
  const satelliteView = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const updateAndFetchWeather = async () => {
    try {
      const res = await fetch(
        `/api/project/${router.query.id}/update-weather`,
        { method: 'POST' }
      )
      if (res.ok) {
        const { weatherData } = await res.json()
        setProjectInfo((prev) => ({ ...prev, weatherData }))
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'drawing', 'geometry'],
    })
    loader.load().then(() => {
      if (streetView.current) {
        new google.maps.StreetViewPanorama(streetView.current, {
          position: {
            lat: Number(projectInfo.lat),
            lng: Number(projectInfo.lng),
          },
          motionTrackingControl: false,
          motionTracking: false,
        })
      }
      if (satelliteView.current) {
        new google.maps.Map(satelliteView.current, {
          zoom: 20,
          mapTypeId: 'satellite',
          center: {
            lat: Number(projectInfo.lat),
            lng: Number(projectInfo.lng),
          },
          streetViewControl: false,
          rotateControl: false,
          mapTypeControl: false,
        })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    updateAndFetchWeather()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="grid grid-cols-5 gap-5 lg:grid-cols-1">
      {showMap === true && (
        <>
          <div
            id="map"
            className=" group relative col-span-5 block h-56 overflow-hidden rounded-lg shadow-md md:col-span-2 lg:col-span-1"
            ref={streetView}
          />
          <div
            id="map"
            className=" group relative col-span-5 block h-56 overflow-hidden rounded-lg shadow-md md:col-span-2 lg:col-span-1"
            ref={satelliteView}
          />
        </>
      )}
      {showWeather === true && (
        <div
          className={clsx(
            'relative col-span-5 overflow-hidden rounded-lg bg-gradient-to-br text-white shadow-md md:col-span-1 lg:col-span-1',
            projectInfo.forecast.toLowerCase() === 'clouds' &&
              'from-blue-300 via-gray-400 to-gray-500',
            projectInfo.forecast.toLowerCase() === 'rain' &&
              'from-gray-400 via-gray-500 to-gray-700',
            projectInfo.forecast.toLowerCase() === 'clear' &&
              'from-blue-400 via-blue-500 to-blue-600'
          )}
        >
          <div className="grid grid-cols-2 gap-y-2 bg-opacity-80 p-5 md:flex-col">
            <div className="flex items-center">
              <dl>
                <WeatherTitle>Temperature</WeatherTitle>
                <WeatherData>
                  {projectInfo.temperature ? (
                    <>
                      {Math.floor(parseFloat(projectInfo.temperature))}
                      <span className="ml-2 text-sm">&deg;F</span>
                    </>
                  ) : (
                    '--'
                  )}
                </WeatherData>
              </dl>
            </div>
            <div className="flex items-center">
              <dl>
                <WeatherTitle>Humidity</WeatherTitle>
                <WeatherData>
                  {projectInfo.humidity ? (
                    <>
                      {projectInfo.humidity}
                      <span className="ml-2 text-sm">%</span>
                    </>
                  ) : (
                    '--'
                  )}
                </WeatherData>
              </dl>
            </div>
            <div className="flex items-center">
              <dl>
                <WeatherTitle>Forecast</WeatherTitle>
                <WeatherData>{projectInfo.forecast || '--'}</WeatherData>
              </dl>
            </div>
            <div className=" flex items-center">
              <dl>
                <WeatherTitle>Wind</WeatherTitle>
                <WeatherData>
                  {projectInfo.wind ? (
                    <>
                      {projectInfo.wind}
                      <span className="ml-2 text-sm">mph</span>
                    </>
                  ) : (
                    '--'
                  )}
                </WeatherData>
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LocationData
