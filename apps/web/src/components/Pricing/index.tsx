import { Container } from '@components/LandingPage/Container'
import clsx from 'clsx'

import Plan from './Plan'
import SwirlyDoodle from './SwirlyDoodle'

export default function Pricing({ isAuthed = false }: { isAuthed?: boolean }) {
  return (
    <section
      id="pricing"
      aria-label="Pricing"
      className={clsx(
        isAuthed
          ? 'bg-gray-50 pt-8 pb-32 sm:pb-40'
          : 'bg-gray-50 py-20 sm:py-32'
      )}
    >
      <Container>
        <div className="md:text-center">
          <h2
            className={clsx(
              'font-display text-3xl tracking-tight sm:text-4xl',
              isAuthed ? 'text-primary' : 'text-primary'
            )}
          >
            <span className="relative whitespace-nowrap">
              <SwirlyDoodle className="absolute top-1/2 left-0 h-[1em] w-full fill-swag-light/70" />
              <span className="relative">Simple pricing,</span>
            </span>{' '}
            for everyone.
          </h2>
          <p
            className={clsx(
              'mt-4 text-lg ',
              isAuthed ? 'text-neutral-870' : 'text-neutral-700'
            )}
          >
            Small business, enterprise, or just taking a look, we&lsquo;ve got
            the right plan for you.
          </p>
        </div>
        <div
          className={clsx(
            'mt-16 grid max-w-2xl grid-cols-1 gap-y-10 sm:mx-auto sm:px-10 md:px-20  lg:max-w-none lg:grid-cols-2 lg:px-32 xl:gap-x-8 xl:px-40'
          )}
        >
          <Plan
            featured
            name="Basic"
            price="$25"
            priceBillingRate="/ user / month"
            priceId="basic"
            description="Perfect for small / medium sized businesses. Billed monthy."
            href="/register"
            features={[
              'Create up to 100 projects a month',
              'Analyze up to 10000 images a month',
              'Supports up to 10 seats',
            ]}
            isAuthed={isAuthed}
          />
          <Plan
            name="Enterprise"
            price="Contact Us"
            description="For large enterprise companies requiring many seats and intensive image processing capabilities"
            href="https://calendly.com/identishot/30min"
            features={[
              'Create unlimited projects a month',
              'Analyze unlimited images a month',
              'Flexible seating',
            ]}
            isAuthed={isAuthed}
          />
        </div>
      </Container>
    </section>
  )
}
