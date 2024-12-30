import { ChangeEvent, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import { AutoSaveTextInput } from '@components/components'
import debounce from 'lodash.debounce'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { projectStore } from '@atoms/project'

import Form from './Form'
import FormContainer from './FormContainer'
import InputLabel from './InputLabel'
import LocationData from './LocationData'

const GooglePlacesAutocomplete = dynamic(
  () => import('react-google-autocomplete'),
  {
    ssr: false,
  }
)
interface PropertyOwnerData {
  clientName?: string
  clientEmail?: string
  clientPhoneNumber?: string
  location?: string
  assignmentNumber?: string
  refferal?: string
  claimSummary?: string
}

export default function ProjectOwnerInformation() {
  const router = useRouter()
  const projectInfo = projectStore(state => state.project)

  const onSave = async (data: PropertyOwnerData) => {
    try {
      const res = await fetch(
        `/api/project/${router.query.id}/client-information`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      )
      if (res.ok) {
        // @ts-ignore
        projectStore.getState().setProject(data)
      } else {
        toast.error(
          'Updated Failed. If the error persists please contact support@servicegeek.app'
        )
      }
    } catch (error) {
      console.error(error)
      toast.error(
        'Updated Failed. If the error persists please contact support@servicegeek.app'
      )
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedChangeHandler = useMemo(() => debounce(onSave, 500), [])

  useEffect(() => {
    return () => {
      debouncedChangeHandler.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <FormContainer className="col-span-10 lg:col-span-6">
        <Form
          title="Assignment Details"
          description="Record the property location as well as point of contact information
            for your records."
        >
          <AutoSaveTextInput
            className="col-span-6 sm:col-span-3"
            defaultValue={projectInfo.clientName}
            onSave={(clientName) => onSave({ clientName })}
            name="clientName"
            title="Client Name"
            ignoreInvalid
          />

          <AutoSaveTextInput
            className="col-span-6 sm:col-span-3"
            defaultValue={`${projectInfo.assignmentNumber || ''}`}
            onSave={(assignmentNumber) => onSave({ assignmentNumber })}
            name="assignmentNumber"
            title="Assignment Number"
            ignoreInvalid
          />

          <AutoSaveTextInput
            className="col-span-6 sm:col-span-3"
            defaultValue={projectInfo.clientPhoneNumber}
            onSave={(clientPhoneNumber) => onSave({ clientPhoneNumber })}
            name="clientPhoneNumber"
            title="Client Phone number"
            ignoreInvalid
            isPhonenumber
          />

          <AutoSaveTextInput
            className="col-span-6 sm:col-span-3"
            defaultValue={projectInfo.clientEmail}
            onSave={(clientEmail) => onSave({ clientEmail })}
            name="clientEmail"
            title="Client Email"
            ignoreInvalid
          />

          <AutoSaveTextInput
            className="col-span-6"
            defaultValue={projectInfo.refferal ?? ''}
            onSave={(refferal) => onSave({ refferal })}
            name="Refferal"
            isTextArea={true}
            title="Refferal"
          />

          <AutoSaveTextInput
            className="col-span-6"
            defaultValue={projectInfo.claimSummary}
            onSave={(claimSummary) => onSave({ claimSummary })}
            name="claimSummary"
            isTextArea={true}
            title="Claim summary"
          />

          <div className="col-span-6 flex flex-col justify-between">
            <InputLabel htmlFor="propertyAddress" className="mb-2">
              Property Address
            </InputLabel>

            <div className="flex">
              <GooglePlacesAutocomplete
                apiKey={process.env.GOOGLE_MAPS_API_KEY}
                language="en"
                style={{ boxShadow: 'none' }}
                className="block w-full rounded-md border-[1px] border-gray-300 px-2 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                options={{
                  types: [],
                }}
                id="propertyAddress"
                defaultValue={projectInfo.location}
                onPlaceSelected={(place) => {
                  if (place && place.formatted_address) {
                    onSave({ location: place.formatted_address })
                  }
                }}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  e.preventDefault()
                  if (e.target.value) {
                    debouncedChangeHandler({ location: e.target.value })
                  }
                }}
              />
            </div>
          </div>
        </Form>
      </FormContainer>
      <FormContainer className="col-span-10 lg:col-span-4">
        <LocationData />
      </FormContainer>
    </>
  )
}
