import { CheckIcon } from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Track leads',
    description: 'Utilizing our fully customizable Kan-Ban board, track all of your leads, projects and clients',
  },
  {
    name: 'Weather maps/data',
    description:
      'View and search hail, wind and tornado data. Add it to your report at the end if you need to justify the loss',
  },
  {
    name: 'Notifications',
    description:
      "Setup text reminders for upcoming jobs from within your organization calendar. Text clients that you're on your way",
  },
  {
    name: 'Job site photos',
    description:
      'Quickly and easily navigate through your job site images',
  },
  {
    name: 'Roof measurements',
    description:
      'Unlimited and highly detailed roof measurement reports on any address at no additional cost',
  },
  {
    name: 'Esignatures',
    description:
      'Store PDF files and collect esignatures directly from your clients - either while on the job or remotely.',
  },
  {
    name: 'Dry logs',
    description:
      'Record temperature, humidity, and have the GPP automatically calculated within our mitigation section. ',
  },
  {
    name: 'Custom Reports',
    description:
      'Download all job site information including the photos, notes, reading, and measurements to send with your invoice nad always get paid. ',
  },
]

export default function PlatformFeatures() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl py-16 px-4 sm:px-6 lg:grid lg:grid-cols-3 lg:gap-x-8 lg:py-24 lg:px-8">
        <div>
          <h2
            className="bg-gradient-to-br from-swag-dark  to-swag-light bg-clip-text text-lg font-semibold text-transparent"
            id="platform-features"
          >
            Fully customizable
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            All-in-one platform
          </p>
          <p className="mt-4 text-lg text-gray-500">
            Stop paying for over-priced and complicated software. Join RestorationX today. 
          </p>
        </div>
        <div className="mt-12 lg:col-span-2 lg:mt-0">
          <dl className="space-y-10 sm:grid sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-4 sm:gap-x-6 sm:gap-y-10 sm:space-y-0 lg:gap-x-8">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <dt>
                  <CheckIcon
                    className="absolute h-6 w-6 text-green-500"
                    aria-hidden="true"
                  />
                  <p className="ml-9 text-lg font-medium leading-6 text-gray-900">
                    {feature.name}
                  </p>
                </dt>
                <dd className="mt-2 ml-9 text-base text-gray-500">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
