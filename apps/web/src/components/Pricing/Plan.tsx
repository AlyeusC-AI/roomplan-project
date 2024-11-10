import PrimaryLink from '@components/DesignSystem/Links/PrimaryLink'
import clsx from 'clsx'

import CheckIcon from './CheckIcon'

function Plan({
  name,
  price,
  description,
  href,
  features,
  featured = false,
  isAuthed = false,
  priceId,
  priceBillingRate = '',
}: {
  name: string
  price: string
  description: string
  href: string
  features: string[]
  featured?: boolean
  isAuthed?: boolean
  priceId?: string
  priceBillingRate?: string
}) {
  return (
    <section
      className={clsx(
        'flex flex-col rounded-3xl px-6 sm:px-8',
        // featured ? 'order-first bg-primary py-8 lg:order-none' : 'lg:py-8'
        featured
          ? 'order-first bg-white py-8 lg:order-none'
          : isAuthed
          ? 'order-first py-8 lg:order-none'
          : 'lg:py-8',
        featured && 'shadow-md'
      )}
    >
      <h3
        className={clsx(
          'mt-5 font-display text-lg',
          featured ? 'text-primary' : isAuthed ? 'text-black' : 'text-primary'
        )}
      >
        {name}
      </h3>
      <p
        className={clsx(
          'mt-2 text-base',
          featured
            ? 'text-primary'
            : isAuthed
            ? 'text-neutral-800'
            : 'text-neutral-800'
        )}
      >
        {description}
      </p>
      <p
        className={clsx(
          'order-first font-display text-5xl font-light tracking-tight',
          featured ? 'text-primary' : isAuthed ? 'text-black' : 'text-primary'
        )}
      >
        {price}
        {priceBillingRate && (
          <span className="text-2xl">{priceBillingRate}</span>
        )}
      </p>
      <ul
        className={clsx(
          'order-last mt-10 flex flex-col gap-y-3 text-sm',
          featured
            ? 'text-primary'
            : isAuthed
            ? 'text-neutral-800'
            : 'text-neutral-800'
        )}
      >
        {features.map((feature) => (
          <li key={feature} className="flex">
            <CheckIcon
              className={featured ? 'text-neutral-400' : 'text-neutral-400'}
            />
            <span className="ml-4">{feature}</span>
          </li>
        ))}
      </ul>
      {isAuthed && process.env.PRICING_ENABLED === "true" ? (
        <>
          {priceId ? (
            <form
              action="/api/create-checkout-session"
              method="POST"
              className="flex w-full"
            >
              <input type="hidden" name="priceId" value={priceId} />
              <PrimaryLink
                variant={featured ? 'swag' : 'base'}
                color={featured ? 'white' : isAuthed ? 'blue' : 'white'}
                className="mt-8 w-full"
                aria-label={`Get started with ${name} plan for ${price}`}
                type="submit"
              >
                Upgrade
              </PrimaryLink>
            </form>
          ) : (
            <>
              <PrimaryLink
                href="mailto:sales@servicegeek.app"
                variant={featured ? 'swag' : 'invert-swag'}
                className="mt-8"
                aria-label={`Get started with ${name} plan for ${price}`}
              >
                Contact Sales
              </PrimaryLink>
            </>
          )}
        </>
      ) : (
        <>
          <PrimaryLink
            href={href}
            variant={featured ? 'swag' : 'invert-swag'}
            className="mt-8"
            aria-label={`Get started with ${name} plan for ${price}`}
          >
            Get started
          </PrimaryLink>
        </>
      )}
    </section>
  )
}

export default Plan
