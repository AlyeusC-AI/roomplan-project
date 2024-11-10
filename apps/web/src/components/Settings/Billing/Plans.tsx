import Plan from '@components/Pricing/Plan'
import clsx from 'clsx'

const Plans = () => (
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
      isAuthed
    />
    <Plan
      name="Pro"
      price="Contact Us"
      description="For large businesses requiring many seats and large amount of photo storage"
      href="https://calendly.com/servicegeek/30min"
      features={[
        'Create unlimited projects a month',
        'Analyze unlimited images a month',
        'Flexible seating',
      ]}
      isAuthed
    />
  </div>
)

export default Plans
