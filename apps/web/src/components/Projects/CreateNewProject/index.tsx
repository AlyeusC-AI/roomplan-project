import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  Fragment,
  SetStateAction,
  useState,
} from 'react'
import PrimaryButton from '@components/DesignSystem/Buttons/PrimaryButton'
import SecondaryButton from '@components/DesignSystem/Buttons/SecondaryButton'
import { Dialog, Transition } from '@headlessui/react'
import { GOOGLE_MAPS_API_KEY } from '@lib/constants'
import useAmplitudeTrack from '@utils/hooks/useAmplitudeTrack'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { event } from 'nextjs-google-analytics'
import { useRecoilState } from 'recoil'
import orgInfoState from '@atoms/orgInfoState'

const GooglePlacesAutocomplete = dynamic(
  () => import('react-google-autocomplete'),
  {
    ssr: false,
  }
)
// Should be an html form. Not a form because the google auto complete dropdown breaks when nested in a form and clicking "enter"
const CreateNewProject = ({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}) => {
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
    event('attempt_create_new_project', {
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
        event('create_new_project', {
          category: 'Project List',
          projectId: json.projectId,
        })
        track('Project Created', { projectId: json.projectId })

        router.push(`/projects/${json.projectId}/photos`)
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
    <Transition.Root
      show={open} // @ts-ignore
      as={Fragment}
    >
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          // @ts-ignore
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              // @ts-ignore
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="z-20 ">
                  <h2
                    id="payment-details-heading"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Create New Project
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Provide a name for your new project and upload images of the
                    job site
                  </p>
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
                  <div className="mt-4 flex items-center justify-end">
                    <SecondaryButton
                      onClick={() => setOpen(false)}
                      className="mr-2"
                    >
                      Cancel
                    </SecondaryButton>
                    <PrimaryButton onClick={createProject} loading={isCreating}>
                      Create
                    </PrimaryButton>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default CreateNewProject
