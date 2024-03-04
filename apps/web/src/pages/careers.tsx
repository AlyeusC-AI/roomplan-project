/* eslint-disable @next/next/no-img-element */
import { Fragment } from 'react'
import { Footer } from '@components/LandingPage/Footer'
import { Header } from '@components/LandingPage/Header'
import { Menu, Transition } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import classNames from '@utils/classNames'
import Head from 'next/head'

export default function Careers() {
  return (
    <>
      <Head>
        <title>
          RestorationX - A job management platform built for restoration
        </title>
        <meta
          name="description"
          content="A job management platform built for restoration"
        />
      </Head>
      <Header />
      <main className="bg-gray-50">
        <div className="relative bg-gray-50">
          <div className="lg:absolute lg:inset-0">
            <div className="lg:absolute lg:inset-y-0 lg:left-0 lg:w-1/2">
              <img
                className="h-56 w-full object-cover lg:absolute lg:h-full"
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1567&q=80"
                alt=""
              />
            </div>
          </div>
          <div className="relative px-6 pt-12 pb-16 sm:pt-16 lg:mx-auto lg:grid lg:max-w-7xl lg:grid-cols-2 lg:px-8">
            <div className="lg:col-start-2 lg:pl-8">
              <div className="mx-auto max-w-prose text-base lg:ml-auto lg:mr-0 lg:max-w-lg">
                <h2 className="font-semibold leading-6 text-blue-600">
                  Work with us
                </h2>
                <h3 className="mt-2 text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-4xl">
                  Our Process
                </h3>
                <p className="mt-8 text-lg text-gray-500">
                  Our company specializes in creating innovative software
                  solutions for the restoration industry. We are dedicated to
                  developing cutting-edge technology that makes the restoration
                  process more efficient, accurate, and cost-effective. We are
                  looking for talented and passionate individuals to join our
                  team and help us push the boundaries of what&apos;s possible
                  in this field.
                </p>
                <p className="mt-8 text-lg text-gray-500">
                  As an employee of our company, you will work on a variety of
                  projects, from researching and developing new technologies to
                  designing and implementing software solutions. You will have
                  the opportunity to collaborate with a talented and diverse
                  team of engineers, designers, and industry experts, and to
                  make a real impact on the restoration industry.
                </p>{' '}
                <p className="mt-8 text-lg text-gray-500">
                  We are looking for individuals with a strong background in
                  computer science and software engineering, as well as a
                  passion for innovation and problem-solving. If you have
                  experience with software development, a portfolio of relevant
                  work, and a desire to learn and grow, we would love to hear
                  from you.
                </p>{' '}
                <p className="mt-8 text-lg text-gray-500">
                  We offer competitive compensation packages, flexible working
                  arrangements, and a supportive and collaborative work
                  environment. We also believe in work-life balance and
                  providing our team with opportunities for personal and
                  professional growth. If you&apos;re looking for an exciting
                  opportunity to work on innovative software solutions and make
                  a real impact in the restoration industry, please visit our
                  career page and apply today!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="bg-gray-50 pb-5 sm:pt-16 lg:mx-auto lg:grid lg:max-w-7xl lg:grid-cols-1 lg:px-8">
          <h3 className="border-b border-gray-200 pb-5 text-lg font-medium leading-6 text-gray-900">
            Job Postings
          </h3>

          {[
            {
              id: 134534,
              title: 'Senior Mobile Developer',
              team: 'Core team',
            },
            {
              id: 134535,
              title: 'Senior Data Engineer',
              team: 'Machine learning org',
            },
            {
              id: 134536,
              title: 'Head of Sales',
              team: 'Finance org',
            },
          ].map((job, i) => (
            <div key={i} className="border-b border-gray-200 pb-5 pt-5">
              <div className="sm:flex sm:items-baseline sm:justify-between">
                <div className="sm:w-0 sm:flex-1">
                  <h1
                    id="message-heading"
                    className="text-lg font-medium text-gray-900"
                  >
                    {job.title}
                  </h1>
                  <p className="mt-1 truncate text-sm text-gray-500">
                    {job.team}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:justify-start">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800">
                    Open
                  </span>
                  <Menu
                    as="div"
                    className="relative ml-3 inline-block text-left"
                  >
                    <div>
                      <Menu.Button className="-my-2 flex items-center rounded-full bg-gray-50 p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <span className="sr-only">Open options</span>
                        <EllipsisVerticalIcon
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      </Menu.Button>
                    </div>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-50 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                href="mailto:matt@restorationx.app"
                                className={classNames(
                                  active
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-700',
                                  'flex justify-between px-4 py-2 text-sm'
                                )}
                              >
                                <span>Contact</span>
                              </a>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>
          ))}
        </div> */}
      </main>
      <Footer />
    </>
  )
}
