"use client";

import { projectStore } from '@atoms/project'
import { propertyDataStore } from '@atoms/property-data'

import TabTitleArea from '../TabTitleArea'

import DetailsInput from './DetailsInput'
import StatusPicker from './StatusPicker'
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { LoadingPlaceholder } from '@components/ui/spinner';

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
  const { id } = useParams()
  const { project, setProject } = projectStore((state) => state)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (project && project.publicId === id) {
      setLoading(false)
      return
    }
    fetch(`/api/v1/projects/${id}`)
    .then((res) => res.json())
    .then((data) => {
      console.log(data)
      setProject(data.project)
      setLoading(false)
    })
  }, [])
  return (
    <>
      {loading ? (
        <LoadingPlaceholder />
      ) : (
        <>
      <TabTitleArea
        title={project.clientName}
        description={<Description location={project.location} />}
      >
        {/* <StatusPicker /> */}
      </TabTitleArea>
      <DetailsInput />
    </>
      )}
    </>
  )
}
