"use client"

import { FormEvent, useState } from 'react'
import { PrimaryButton } from '@components/components/button'
import { Input } from '@components/ui/input'
import WelcomeModal from '@components/onboarding/WelcomeModal'
import useAmplitudeTrack from '@utils/hooks/useAmplitudeTrack'
import Image from 'next/image'

import OrgSizeDropdown, { CompanySize } from './OrgSizeDropdown'

const sizes = [
  { id: 1, size: '1-10' },
  { id: 2, size: '10-20' },
  { id: 3, size: '20-50' },
  { id: 4, size: '50-75' },
  { id: 5, size: '75+' },
]

export default function OrgCreation() {
  const [orgName, setOrgName] = useState('')
  const [orgSize, setSelectedOrgSize] = useState<CompanySize | null>(null)
  const [error, setError] = useState('')
  const [missingOrgSize, setMissingOrgSize] = useState(false)
  const [loading, setLoading] = useState(false)
  const { track } = useAmplitudeTrack()
  const createOrganization = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!orgSize) {
      setMissingOrgSize(true)
      return
    }
    setMissingOrgSize(false)
    setLoading(true)
    try {
      const res = await fetch('/api/organization', {
        method: 'POST',
        body: JSON.stringify({
          orgName,
          orgSize: orgSize.size,
        }),
      })
      if (res.ok) {
        track('Create Organization')
        window.location.assign('/projects')
      } else {
        setError('Failed to create organization.')
        setLoading(false)
      }
    } catch (err) {
      setLoading(false)
      setError('Something went wrong creating your account.')
    }
  }

  return (
    <>
      <WelcomeModal />
      <div className="flex h-full flex-1 flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="relative mb-2 w-64">
          <Image
            src="/images/onboarding/setup-business.svg"
            height={720}
            width={1096}
            alt="Man standing next to checkbox"
          />
        </div>
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Set up Your Business
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Before continuing, please provide a name for your business and
              invite users to your account.
            </p>
          </div>
          {error && (
            <div className="mb-4 rounded-md border-2 border-red-300 p-4 shadow-md ">
              <p>
                <span className="mr-2 font-bold">Error:</span>
                {error} If the issue persists please contact{' '}
                <a
                  className="text-blue-500 underline"
                  href="mailto:support@halo.ai"
                >
                  support
                </a>
                .
              </p>
            </div>
          )}
          <form className="mt-8 space-y-6" onSubmit={createOrganization}>
            <Input
              name="business-name"
              value={orgName}
              onChange={(e) => {
                setOrgName(e.target.value)
              }}
              required={true}
              // inputProps={{
              //   minLength: 3,
              //   maxLength: 50,
              //   placeholder: 'Your Business',
              // }}
            />
            <div>
              <OrgSizeDropdown
                selected={orgSize}
                setSelected={(value) => {
                  setSelectedOrgSize(value)
                  setMissingOrgSize(false)
                }}
                sizes={sizes}
              />
              {missingOrgSize && (
                <p className="mt-2 text-sm text-red-600" id={`${name}-error`}>
                  Please select an organization size
                </p>
              )}
            </div>
            <div>
              <PrimaryButton
                id="organization-creation"
                type="submit"
                loading={loading}
                className="w-full"
              >
                Setup Business
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
