import { ChangeEvent, useState } from 'react'
import useAmplitudeTrack from '@utils/hooks/useAmplitudeTrack'
import Image from 'next/image'
import { useRecoilState } from 'recoil'
import orgInfoState from '@atoms/orgInfoState'

const OrgPhoto = () => {
  const [orgInfo, setOrgInfo] = useRecoilState(orgInfoState)
  const [didErr, setDidErr] = useState(false)
  const { track } = useAmplitudeTrack()
  const uploadPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e || !e.target || !e.target.files) return
    const avatarFile = e.target.files[0]
    try {
      const body = new FormData()
      body.append('file', avatarFile)
      const res = await fetch('/api/organization/logo-upload', {
        method: 'POST',
        body,
      })
      if (res.ok) {
        track('Update Organization Photo')
        const json = await res.json()
        setOrgInfo((prev) => ({
          ...prev,
          logoId: json.id,
        }))
        setDidErr(true)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="mt-6">
      <label className="block text-sm font-medium text-gray-700">
        Organization Logo
      </label>
      {didErr ? (
        <div className="mt-1 flex h-52 w-52 justify-center rounded-md border-2 border-gray-300 px-6 pt-5 pb-6">
          <div className="flex flex-col items-center justify-center space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md bg-white font-medium text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={uploadPhoto}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="relative mt-1 flex h-52 w-52 justify-center rounded-md border-2 border-gray-300 px-6 pt-5 pb-6">
            <div>
              <Image
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/org-pictures/${orgInfo.publicId}/${orgInfo.logoId}.png`}
                onError={() => {
                  setDidErr(true)
                }}
                fill
                alt="user"
              />
            </div>
          </div>
          <label>Change Logo</label>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            onChange={uploadPhoto}
          />
        </div>
      )}
    </div>
  )
}

export default OrgPhoto
