import { useEffect, useState } from 'react'
import { Container } from '@components/LandingPage/Container'
import { Tab } from '@headlessui/react'
import projectManagement from '@images/screenshots/project-management.png'
import screenshotReminders from '@images/screenshots/reminders.png'
import screenshotRoomDetection from '@images/screenshots/room-detection.png'
import clsx from 'clsx'
import Image from 'next/image'

const features = [
  {
    title: 'Job management',
    description:
      'Organize and document all of your jobs in one simple to use software. RestorationX will give you the tools to make sure you are always paid for the work you do.',
    image: screenshotRoomDetection,
  },
  {
    title: 'Calendar Reminders',
    description:
      'Send text reminders to your team or your clients reminding them of scheduled events. Miscommunication is expensive and its a cost you can avoid.',
    image: screenshotReminders,
  },
  {
    title: 'Project Tracking',
    description:
      'Follow leads and clients through their lifecycle with our fully customizable dashboard',
    image: projectManagement,
  },
  // {
  //   title: 'Damage Detection',
  //   description:
  //     'Certain types of damages like fire and water damage will be detected by our model and highlighted per room.',
  //   image: screenshotVatReturns,
  // },
  // {
  //   title: 'Export Claims',
  //   description:
  //     'Coming soon - Easily export insurance claims to share with homeowners and insurance companies.',
  //   image: screenshotReporting,
  // },
]

export function PrimaryFeatures() {
  let [tabOrientation, setTabOrientation] = useState('horizontal')

  useEffect(() => {
    let lgMediaQuery = window.matchMedia('(min-width: 1024px)')

    function onMediaQueryChange({ matches }) {
      setTabOrientation(matches ? 'vertical' : 'horizontal')
    }

    onMediaQueryChange(lgMediaQuery)
    lgMediaQuery.addEventListener('change', onMediaQueryChange)

    return () => {
      lgMediaQuery.removeEventListener('change', onMediaQueryChange)
    }
  }, [])

  return (
    <section
      id="features"
      aria-label="Features for running your books"
      className="relative overflow-hidden bg-gray-50 pt-20 pb-28 sm:py-32"
    >
      <Container className="relative">
        <div className="max-w-3xl md:mx-auto md:text-center xl:max-w-none">
          <h2 className="font-display text-3xl tracking-tight text-primary sm:text-4xl md:text-5xl">
            Stop switching between multiple apps
          </h2>
          <p className="mt-6 text-lg tracking-tight text-neutral-600">
            Streamline your company's profits with technology that has all the tools you need in a simple-to-use package.
          </p>
        </div>
        <Tab.Group
          as="div"
          className="mt-16 grid grid-cols-1 items-center gap-y-2 pt-10 sm:gap-y-6 md:mt-20 lg:grid-cols-12 lg:pt-0"
          vertical={tabOrientation === 'vertical'}
        >
          {({ selectedIndex }) => (
            <>
              <div className="-mx-4 flex overflow-x-auto pb-4 sm:mx-0 sm:overflow-visible sm:pb-0 lg:col-span-5">
                <Tab.List className="relative z-10 flex gap-x-4 whitespace-nowrap px-4 sm:mx-auto sm:px-0 lg:mx-0 lg:block lg:gap-x-0 lg:gap-y-1 lg:whitespace-normal">
                  {features.map((feature, featureIndex) => (
                    <div
                      key={feature.title}
                      className={clsx(
                        'group relative rounded-md py-1 px-4 lg:rounded-r-none lg:rounded-l-xl lg:p-6',
                        selectedIndex === featureIndex
                          ? 'bg-gradient-to-br from-swag-dark/90 to-swag-light/90'
                          : 'hover:bg-gradient-to-br hover:from-swag-dark/90 hover:to-swag-light/90'
                      )}
                    >
                      <h3>
                        <Tab
                          className={clsx(
                            'font-display text-lg [&:not(:focus-visible)]:focus:outline-none',
                            selectedIndex === featureIndex
                              ? 'text-white '
                              : 'text-primary/60 hover:text-white'
                          )}
                        >
                          <span className="absolute inset-0 rounded-full lg:rounded-r-none lg:rounded-l-xl" />
                          {feature.title}
                        </Tab>
                      </h3>
                      <p
                        className={clsx(
                          'mt-2 hidden text-sm lg:block',
                          selectedIndex === featureIndex
                            ? 'text-white'
                            : 'text-primary/60 group-hover:text-white'
                        )}
                      >
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </Tab.List>
              </div>
              <Tab.Panels className="lg:col-span-7">
                {features.map((feature) => (
                  <Tab.Panel key={feature.title} unmount={false}>
                    <div className="relative sm:px-6 lg:hidden">
                      <div className="absolute -inset-x-4 -top-[6.5rem] -bottom-[4.25rem] bg-white/10 ring-1 ring-inset ring-white/10 sm:inset-x-0 sm:rounded-t-xl" />
                      <p className="relative mx-auto max-w-2xl text-base text-primary sm:text-center">
                        {feature.description}
                      </p>
                    </div>
                    <div className="relative mt-10 aspect-[3024/1666] w-[45rem] overflow-hidden rounded-xl bg-slate-50 shadow-xl shadow-blue-900/20 sm:w-auto lg:mt-0 lg:w-[67.8125rem]">
                      <Image
                        src={feature.image}
                        alt=""
                        layout="fill"
                        priority
                        sizes="(min-width: 1024px) 67.8125rem, (min-width: 640px) 100vw, 45rem"
                      />
                    </div>
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            </>
          )}
        </Tab.Group>
      </Container>
    </section>
  )
}
