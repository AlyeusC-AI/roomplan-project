import { projectStore } from '@atoms/project'
import { propertyDataStore } from '@atoms/property-data'

import TabTitleArea from '../TabTitleArea'

import DetailsInput from './DetailsInput'
import StatusPicker from './StatusPicker'

const Description = ({ location }: { location: string }) => {
  const propertyDataInfo = propertyDataStore(state => state)
  return (
    <span className="flex flex-col">
      <span className="block">{location}</span>
      <span className="flex flex-row">
        {propertyDataInfo.bathrooms && (
          <span className="flex flex-row items-center justify-center text-sm">
            {propertyDataInfo.bathrooms} Bath <span className="mx-2">-</span>
          </span>
        )}
        {propertyDataInfo.bedrooms && (
          <span className="flex flex-row items-center justify-center text-sm">
            {propertyDataInfo.bedrooms} Bedrooms <span className="mx-2">-</span>
          </span>
        )}
        {propertyDataInfo.squareFootage && (
          <span className="flex flex-row items-center justify-center text-sm">
            {propertyDataInfo.squareFootage} Sqft
          </span>
        )}
      </span>
    </span>
  )
}

export default function EstimateDetails() {
  const projectInfo = projectStore((state) => state.project)
  return (
    <>
      <TabTitleArea
        title={projectInfo.clientName}
        description={<Description location={projectInfo.location} />}
      >
        <div></div>
        <StatusPicker />
      </TabTitleArea>
      <DetailsInput />
    </>
  )
}
