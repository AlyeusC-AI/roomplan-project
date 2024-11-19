import { Fragment, useState } from 'react'
import Confetti from 'react-confetti'
import PrimaryButton from '@components/DesignSystem/Buttons/PrimaryButton'
import SecondaryButton from '@components/DesignSystem/Buttons/SecondaryButton'
import GradientText from '@components/DesignSystem/GradientText'
import { Dialog, Transition } from '@headlessui/react'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import Image from 'next/image'

const Bubble = ({ active }: { active: boolean }) => (
  <div
    className={clsx(
      'h-3 w-3 rounded-full',
      active ? ' bg-blue-300' : 'bg-neutral-300'
    )}
  />
)

export const transitionClasses = {
  enter: 'transform transition ease-in-out duration-500 sm:duration-700',
  enterFrom: 'translate-x-full',
  enterTo: 'translate-x-0',
  leave: 'transform transition ease-in-out duration-500 sm:duration-700',
  leaveFrom: 'translate-x-0',
  leaveTo: 'translate-x-full',
}

export default function WelcomeModal() {
  const [open, setOpen] = useState(true)
  const [index, setIndex] = useState(0)
  console.log('index', index)

  return (
    <Transition.Root
      show={open} // @ts-ignore
      as={Fragment}
    >
      <Dialog as="div" className="relative z-10" onClose={() => null}>
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
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
                <Confetti recycle={false} numberOfPieces={400} />
                {index === 0 && (
                  <div className="">
                    <div className="mt-3 text-center sm:mt-5">
                      <div className="mb-4 flex items-center justify-center">
                        <div className="relative w-64">
                          <Image
                            src="/images/onboarding/welcome.png"
                            height={992}
                            width={1308}
                            alt="Welcome to ServiceGeek"
                          />
                        </div>
                      </div>
                      <Dialog.Title
                        as="h3"
                        className="text-3xl font-medium leading-6 text-gray-900"
                      >
                        Welcome to Service Geek!
                      </Dialog.Title>
                      <div className="mt-8 flex flex-col items-center justify-center text-center">
                        <p className="max-w-sm text-base text-gray-800">
                          Let&apos;s get started. You and your team can now use
                          ServiceGeek for free forever.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {index === 1 && (
                  <div className="">
                    <div className="mt-3 text-center sm:mt-5">
                      <div className="mb-4 flex items-center justify-center">
                        <div className="relative w-64">
                          <Image
                            src="/images/onboarding/projects.png"
                            height={614}
                            width={949}
                            alt="A person holding a clipboard with a blue checkmark"
                          />
                        </div>
                      </div>
                      <Dialog.Title
                        as="h3"
                        className="text-3xl font-medium leading-6 text-gray-900"
                      >
                        Create & Manage Projects
                      </Dialog.Title>
                      <div className="mt-8 flex items-center justify-center text-center">
                        <p className="max-w-sm text-base text-gray-800">
                          Add a client name and address to create a new project.
                          Manage key elements of a job including photo
                          collection, scope documention, and document
                          collection.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {index === 2 && (
                  <div className="">
                    <div className="mt-3 text-center sm:mt-5">
                      <div className="mb-4 flex items-center justify-center">
                        <div className="relative w-64">
                          <Image
                            src="/images/onboarding/mobile.png"
                            height={932}
                            width={1086}
                            alt="A person standing next to a mobile app"
                          />
                        </div>
                      </div>
                      <Dialog.Title
                        as="h3"
                        className="text-3xl font-medium leading-6 text-gray-900"
                      >
                        Download the App
                      </Dialog.Title>
                      <div className="mt-8 flex items-center justify-center text-center">
                        <p className="max-w-sm text-base text-gray-800">
                          Download the ServiceGeek mobile application to quickly
                          snap photos, take notes, and record readings while in
                          the field.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {index === 3 && (
                  <div className="">
                    <div className="mt-3 text-center sm:mt-5">
                      <div className="mb-4 flex items-center justify-center">
                        <div className="relative w-64">
                          <Image
                            src="/images/onboarding/completed.png"
                            height={660}
                            width={1009}
                            alt="Celebration and a blue checkmark"
                          />
                        </div>
                      </div>
                      <Dialog.Title
                        as="h3"
                        className="text-3xl font-medium leading-6 text-gray-900"
                      >
                        It&apos;s that simple!
                      </Dialog.Title>
                      <div className="mt-8 flex items-center justify-center text-center">
                        <p className="max-w-sm text-base text-gray-800">
                          That&apos;s all there is to it. Click &ldquo;Setup
                          Organization&rdquo; below to get started.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-4 mb-2 flex items-center justify-center space-x-2">
                  <Bubble active={index === 0} />
                  <Bubble active={index === 1} />
                  <Bubble active={index === 2} />
                  <Bubble active={index === 3} />
                </div>
                <div className="mt-5 flex items-center justify-center space-x-4 sm:mt-6">
                  {index === 0 && (
                    <PrimaryButton
                      type="button"
                      onClick={() => setIndex((i) => i + 1)}
                    >
                      Next Steps <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </PrimaryButton>
                  )}
                  {index > 0 && index < 3 && (
                    <>
                      <SecondaryButton
                        type="button"
                        onClick={() => setIndex((i) => i - 1)}
                      >
                        Previous
                      </SecondaryButton>
                      <PrimaryButton
                        type="button"
                        onClick={() => setIndex((i) => i + 1)}
                      >
                        Next Steps <ArrowRightIcon className="ml-2 h-5 w-5" />
                      </PrimaryButton>
                    </>
                  )}
                  {index === 3 && (
                    <>
                      <SecondaryButton
                        type="button"
                        onClick={() => setIndex((i) => i - 1)}
                      >
                        Previous
                      </SecondaryButton>
                      <PrimaryButton
                        type="button"
                        onClick={() => setOpen(false)}
                      >
                        Setup Organization
                      </PrimaryButton>
                    </>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
