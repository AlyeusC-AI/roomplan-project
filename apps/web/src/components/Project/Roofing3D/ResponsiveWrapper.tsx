import { useEffect, useRef } from 'react'
import projectInfoState from '@atoms/projectInfoState'
import { MAPBOX_API_KEY } from '@lib/constants'
import mapboxgl from 'mapbox-gl'
import { useRecoilState } from 'recoil'

const ResponsiveWrapper = ({ accessToken }: { accessToken: string }) => {
  const [projectInfo, setProjectInfo] = useRecoilState(projectInfoState)
  const mapContainer = useRef<any>(null)
  const map = useRef<mapboxgl.Map | any>(null)
  mapboxgl.accessToken = MAPBOX_API_KEY ?? ''
  useEffect(() => {
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [Number(projectInfo.lng), Number(projectInfo.lat)],
      zoom: 18,
      pitch: 45,
      bearing: -17.6,
      antialias: true,
    })
    map.current.on('style.load', () => {
      // Insert the layer beneath any symbol layer.
      const layers = map.current.getStyle().layers
      const labelLayerId = layers.find(
        (layer: any) => layer.type === 'symbol' && layer.layout['text-field']
      ).id

      // The 'building' layer in the Mapbox Streets
      // vector tileset contains building height data
      // from OpenStreetMap.
      map.current.addLayer(
        {
          id: 'add-3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#aaa',

            // Use an 'interpolate' expression to
            // add a smooth transition effect to
            // the buildings as the user zooms in.
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height'],
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height'],
            ],
            'fill-extrusion-opacity': 0.6,
          },
        },
        labelLayerId
      )
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className="grid h-full grid-rows-1 pt-2">
        <div
          id="map"
          style={{ height: 'calc(100vh - 15rem)' }}
          ref={mapContainer}
        ></div>
      </div>
    </>
  )
}

export default ResponsiveWrapper
