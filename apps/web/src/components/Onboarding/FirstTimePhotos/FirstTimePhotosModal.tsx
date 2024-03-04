import { Fragment, useEffect, useState } from 'react'
import PrimaryButton from '@components/DesignSystem/Buttons/PrimaryButton'
import { Dialog, Transition } from '@headlessui/react'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { trpc } from '@utils/trpc'

export const transitionClasses = {
  enter: 'transform transition ease-in-out duration-500 sm:duration-700',
  enterFrom: 'translate-x-full',
  enterTo: 'translate-x-0',
  leave: 'transform transition ease-in-out duration-500 sm:duration-700',
  leaveFrom: 'translate-x-0',
  leaveTo: 'translate-x-full',
}

export default function FirstTimePhotosModal() {
  const [open, setOpen] = useState(true)

  const setOnboardingStatus =
    trpc.onboardingStatus.setOnboardingStatus.useMutation()

  useEffect(() => {
    setOnboardingStatus.mutate({
      status: {
        seenPhotoModal: true,
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
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
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
                <div className="">
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-2xl font-medium leading-6 text-gray-900 sm:text-3xl"
                    >
                      Upload, Share, and Annotate Photos
                    </Dialog.Title>
                    <div className="my-8 flex items-center justify-center text-center">
                      <p className="px-8 text-base text-gray-800">
                        Get started by adding photos of the job site. Once
                        uploaded, you can share photos through our secure share
                        feature. Want to learn more? Checkout the video below!
                      </p>
                    </div>
                    {/* this video is expired */}
                    {/* <div className=" h-80 w-full items-center justify-center overflow-hidden rounded-md shadow-md">
                      <iframe
                        className="h-full w-full"
                        src="https://www.youtube.com/embed/yPC-yha6POE"
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      ></iframe>
                    </div> */}
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-center space-x-4 sm:mt-6">
                  <PrimaryButton type="button" onClick={() => setOpen(false)}>
                    Start Uploading <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </PrimaryButton>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
