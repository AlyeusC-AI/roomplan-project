import { projectStore } from '@atoms/project'

import FormContainer from '../EstimateDetails/DetailsInput/FormContainer'
import LocationData from '../EstimateDetails/DetailsInput/LocationData'

const ResponsiveWrapper = ({ accessToken }: { accessToken: string }) => {
  const projectInfo = projectStore(state => state.project)

  return (
    <>
      <FormContainer className="col-span-10 bg-white lg:col-span-4">
        <LocationData showMap={false} />
      </FormContainer>
      <div className="grid grid-rows-1 pt-2">
        <iframe
          scrolling="true"
          className="w-full"
          style={{ height: 'calc(100vh - 15rem)' }}
          src={`https://accuweather.vercel.app/wind-map?lat=${projectInfo.lat}&long=${projectInfo.lng}`}
        ></iframe>
      </div>
    </>
  )
}

export default ResponsiveWrapper
