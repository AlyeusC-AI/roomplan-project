import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import Card from '@components/DesignSystem/Card'
import AutoSaveTextInput from '@components/DesignSystem/TextInput/AutoSaveTextInput'
import { GOOGLE_MAPS_API_KEY } from '@lib/constants'
import useAmplitudeTrack from '@utils/hooks/useAmplitudeTrack'
import debounce from 'lodash.debounce'
import dynamic from 'next/dynamic'
import { useRecoilState } from 'recoil'
import orgInfoState from '@atoms/orgInfoState'

import OrgPhoto from './OrgPhoto'
const GooglePlacesAutocomplete = dynamic(
  () => import('react-google-autocomplete'),
  {
    ssr: false,
  }
)

const OrgSettingsSection = () => {
  const [updateStatus, setUpdateStatus] = useState<{
    ok: boolean
    message: string
  } | null>(null)
  const [orgInfo] = useRecoilState(orgInfoState)
  const { track } = useAmplitudeTrack()
  const { name, address } = orgInfo

  const updateOrgSettings = async (data: {
    orgName?: string
    orgAddress?: string
  }) => {
    try {
      const res = await fetch('/api/organization', {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        toast.error('Failed to update organization details')
      } else {
        // attributes are booleans to not leak customer data
        track('Update Organization Settings', {
          name: !!data.orgName,
          address: !!data.orgAddress,
        })
      }
    } catch (error) {
      toast.error('Failed to update organization details')
    }
  }

  const debouncedChangeHandler = useMemo(
    () => debounce(updateOrgSettings, 500),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useEffect(() => {
    return () => {
      debouncedChangeHandler.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section aria-labelledby="organization-settings">
      <form>
        <Card bg="" className="shadow-none">
          <div>
            <h2
              id="organization-settings"
              className="text-lg font-medium leading-6 text-gray-900"
            >
              Organization Settings
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your organization
            </p>
            <AutoSaveTextInput
              name="organization-name"
              title="Organization Name"
              onSave={(orgName) => updateOrgSettings({ orgName })}
              defaultValue={name}
              className="mt-6"
              ignoreInvalid
            />
            <div className="mt-6">
              <label
                htmlFor="organization-address"
                className="block text-sm font-medium text-gray-700"
              >
                Organization Address
              </label>
              <div className="mt-1">
                <GooglePlacesAutocomplete
                  // @ts-expect-error
                  type="text"
                  name="organization-address"
                  id="organization-address"
                  required
                  apiKey={GOOGLE_MAPS_API_KEY}
                  language="en"
                  style={{ boxShadow: 'none' }}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:!border-sky-500 focus:!ring-sky-500 sm:text-sm"
                  options={{
                    types: [],
                  }}
                  onPlaceSelected={(place) => {
                    if (place && place.formatted_address) {
                      updateOrgSettings({ orgAddress: place.formatted_address })
                    }
                  }}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    e.preventDefault()
                    if (e.target.value) {
                      debouncedChangeHandler({ orgAddress: e.target.value })
                    }
                  }}
                  defaultValue={address}
                />
              </div>
            </div>
            <OrgPhoto />
          </div>
          {updateStatus && (
            <div className="mt-6">
              <p
                className={`text-sm  ${
                  updateStatus.ok ? 'text-green-600' : 'text-red-400'
                }`}
              >
                {updateStatus.message}
              </p>
            </div>
          )}
        </Card>
      </form>
    </section>
  )
}

export default OrgSettingsSection
