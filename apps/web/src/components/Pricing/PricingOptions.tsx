import { CheckIcon } from '@heroicons/react/24/outline'
import { useUser } from '@supabase/auth-helpers-react'
import clsx from 'clsx'
import Link from 'next/link'

const freeTeir = {
  title: 'Trial',
  price: 0,
  frequency: '/user / month',
  description: 'Everything you need to get started. Free for 14 days',
  features: [
    '10 projects',
    '10 seats',
    'Mitigation & Scope Management',
    '48-hour support response time',
  ],
  cta: 'Start Free Trial',
  mostPopular: false,
  isTrial: true,
  priceId: '',
}

const pricing = [
  {
    title: 'Basic',
    price: 25,
    frequency: '/user / month',
    description:
      'The essentials for running your company. Great for small to medium size businesses.',
    features: [
      'Unlimited projects',
      'Unlimited photos',
      '15 seats',
      'Mitigation & Scope Management',
    ],
    cta: 'Get Started',
    mostPopular: true,
    priceId: 'basic',
    isTrial: false,
  },
  {
    title: 'Pro',
    price: 32,
    frequency: '/user / month',
    description: 'The essentials and more. Perfect for large businesses',
    features: [
      'Unlimited projects',
      'Unlimited photos',
      'PDF Reports',
      'Mitigation & Scope Management',
      'Weather data',
      'Priority Support',
      'Roof reports delivered within 24 hours after ordering',
    ],
    cta: 'Get Started',
    mostPopular: false,
    priceId: 'pro',
    isTrial: false,
  },
]

export default function PricingOptions({
  inProduct = false,
}: {
  inProduct?: boolean
}) {
  const user = useUser()

  const teirs = inProduct ? pricing : [freeTeir, ...pricing]

  return (
    <div
      className={clsx(
        'mx-auto max-w-7xl py-24 px-6 lg:px-8',
        !inProduct && 'bg-gray-50'
      )}
    >
      {!inProduct && (
        <>
          <h2
            className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl sm:leading-none lg:text-6xl"
            id="pricing"
          >
            Pricing plans for teams of all sizes
          </h2>
          <p className="mt-6 max-w-2xl text-xl text-gray-500">
            Choose an affordable plan that&apos;s packed with the best features
            for restoration needs.
          </p>
        </>
      )}

      {/* Tiers */}
      <div
        className={clsx(
          'space-y-12 lg:grid lg:gap-x-8 lg:space-y-0',
          inProduct && 'lg:grid-cols-2',
          !inProduct && 'mt-24 lg:grid-cols-3'
        )}
      >
        {teirs.map((tier) => (
          <div
            key={tier.title}
            className={clsx(
              'relative flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm',
              tier.isTrial && user && 'opacity-40'
            )}
          >
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">
                {tier.title}
              </h3>
              {tier.mostPopular ? (
                <p className="absolute top-0 -translate-y-1/2 transform rounded-full bg-primary-action py-1.5 px-4 text-sm font-semibold text-white">
                  Most popular
                </p>
              ) : null}
              <p className="mt-4 flex items-baseline text-gray-900">
                <span className="text-5xl font-bold tracking-tight">
                  ${tier.price}
                </span>
                <span className="ml-1 text-xl font-semibold">
                  {tier.frequency}
                </span>
              </p>
              <p className="mt-6 text-gray-500">{tier.description}</p>

              {/* Feature list */}
              <ul role="list" className="mt-6 space-y-6">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex">
                    <CheckIcon
                      className="h-6 w-6 flex-shrink-0 text-blue-500"
                      aria-hidden="true"
                    />
                    <span className="ml-3 text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            {tier.isTrial ? (
              <>
                {user ? (
                  <div
                    className={clsx(
                      'bg-blue-50 text-primary-action-hover  hover:bg-blue-50',
                      'mt-8 block w-full rounded-md border border-transparent py-3 px-6 text-center font-medium'
                    )}
                  >
                    Trial Already Started
                  </div>
                ) : (
                  <Link
                    href="/register"
                    className={clsx(
                      tier.mostPopular
                        ? 'bg-primary-action text-white hover:bg-primary-action-hover'
                        : 'bg-blue-50 text-primary-action-hover hover:bg-blue-100',
                      'mt-8 block w-full rounded-md border border-transparent py-3 px-6 text-center font-medium'
                    )}
                  >
                    {tier.cta}
                  </Link>
                )}
              </>
            ) : (
              <>
                {user ? (
                  <form
                    action="/api/create-checkout-session"
                    method="POST"
                    className="flex w-full"
                  >
                    <input type="hidden" name="priceId" value={tier.priceId} />
                    <button
                      type="submit"
                      className={clsx(
                        tier.mostPopular
                          ? 'bg-primary-action text-white hover:bg-primary-action-hover'
                          : 'bg-blue-50 text-primary-action-hover hover:bg-blue-100',
                        'mt-8 block w-full rounded-md border border-transparent py-3 px-6 text-center font-medium'
                      )}
                    >
                      Upgrade
                    </button>
                  </form>
                ) : (
                  <Link
                    href="/register"
                    className={clsx(
                      tier.mostPopular
                        ? 'bg-primary-action text-white hover:bg-primary-action-hover'
                        : 'bg-blue-50 text-primary-action-hover hover:bg-blue-100',
                      'mt-8 block w-full rounded-md border border-transparent py-3 px-6 text-center font-medium'
                    )}
                  >
                    {tier.cta}
                  </Link>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
