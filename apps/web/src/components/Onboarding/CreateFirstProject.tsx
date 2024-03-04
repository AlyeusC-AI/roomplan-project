import orgInfoState from '@atoms/orgInfoState'
import PrimaryButton from '@components/DesignSystem/Buttons/PrimaryButton'
import { GOOGLE_MAPS_API_KEY } from '@lib/constants'
import useAmplitudeTrack from '@utils/hooks/useAmplitudeTrack'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { event } from 'nextjs-google-analytics'
import { ChangeEvent, FormEvent, useState } from 'react'
import { useRecoilState } from 'recoil'

const GooglePlacesAutocomplete = dynamic(
  () => import('react-google-autocomplete'),
  {
    ssr: false,
  }
)
// Should be an html form. Not a form because the google auto complete dropdown breaks when nested in a form and clicking "enter"
const CreateFirstProject = () => {
  const router = useRouter()
  const [projectName, setProjectName] = useState('')
  const [projectLocation, setProjectLocation] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [orgInfo] = useRecoilState(orgInfoState)
  const { track } = useAmplitudeTrack()

  const createProject = async (e: FormEvent) => {
    e.preventDefault()
    if (!projectLocation || !projectName) {
      return
    }
    event('attempt_create_first_project', {
      category: 'Project List',
    })

    setIsCreating(true)
    try {
      const res = await fetch('/api/project', {
        method: 'POST',
        body: JSON.stringify({
          name: projectName,
          location: projectLocation,
        }),
      })
      if (res.ok) {
        const json = await res.json()
        event('create_first_project', {
          category: 'Project List',
          projectId: json.projectId,
        })
        track('Project Created', { projectId: json.projectId })
        router.push(`/projects/${json.projectId}/overview`)
      } else {
        console.error('Could not create project')
        setIsCreating(false)
      }
    } catch (error) {
      setIsCreating(false)
      console.error(error)
    }
  }
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mb-8 flex flex-col items-center justify-center md:flex-row">
        <div className="relative flex h-64 w-64">
          <Image
            src="/images/onboarding/first-project.svg"
            height={829}
            width={991}
            alt="Man waving"
          />
        </div>
        <div>
          <h1 className="max-w-md text-3xl">Create your first project</h1>
          <h2 className="my-4 max-w-md text-xl font-medium leading-6 text-gray-900">
            We&apos;re almost there.
          </h2>
          <p className="mt-1 max-w-sm text-base text-gray-500">
            Get started by creating your first project. Simply provide a name
            and a location to get started.
          </p>
        </div>
      </div>
      <div className="w-full max-w-full">
        <h2 className="my-4 max-w-md text-xl font-medium leading-6 text-gray-900">
          Create your First Project
        </h2>
        <form
          onSubmit={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
        >
          <div className="mt-6">
            <label
              htmlFor="project-name"
              className="block text-sm font-medium text-gray-700"
            >
              Client Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="project-name"
                id="project-name"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                placeholder="Client Name"
              />
            </div>
          </div>
          <div className="mt-6">
            <label
              htmlFor="project-location"
              className="block text-sm font-medium text-gray-700"
            >
              Project Location
            </label>
            <div className="mt-1">
              <GooglePlacesAutocomplete
                // @ts-expect-error
                type="text"
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
                    setProjectLocation(place.formatted_address)
                  }
                }}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  e.preventDefault()
                  if (e.target.value) setProjectLocation(e.target.value)
                }}
                defaultValue={projectLocation}
              />
            </div>
          </div>
          <div className="mt-4 flex w-full items-center justify-end">
            <PrimaryButton
              className="w-full"
              onClick={createProject}
              loading={isCreating}
              type="submit"
            >
              Create Project
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateFirstProject
