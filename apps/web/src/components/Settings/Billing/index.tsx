import { useState } from 'react'
import Card from '@components/DesignSystem/Card'
import { Button } from '@components/LandingPage/Button'
import PricingOptions from '@components/Pricing/PricingOptions'
import Spinner from '@components/Spinner'

export default function Billing({
  status,
  planInfo,
  productInfo,
}: {
  status: string
  planInfo?: {
    unitAmount: string
    currency: string
    type: string
    interval: string
  }
  productInfo?: {
    name: string
  }
}) {
  const [isLoading, setLoading] = useState(false)

  const redirectToCustomerPortal = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/create-portal-link', {
        method: 'POST',
      })
      if (!response.ok) {
        setLoading(false)
        return
      }
      const json = await response.json()
      const { url } = json
      window.location.assign(url)
    } catch (error) {
      if (error) return alert((error as Error).message)
    }
    setLoading(false)
  }

  return (
    <>
      <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
        {planInfo && (
          <Card bg="" className="shadow-none">
            <h2 className="text-lg font-medium leading-6 text-gray-900">
              Billing Information
              {status === 'canceled' && (
                <span className=" ml-2 rounded-full bg-red-200 px-2 py-1 text-sm">
                  Cancelled
                </span>
              )}
              {status === 'active' && (
                <span className=" ml-2 rounded-full bg-green-200 px-2 py-1 text-sm">
                  active
                </span>
              )}
            </h2>
            {status === 'active' && (
              <>
                {productInfo && (
                  <h3 className="text-md mt-6 font-medium leading-6 text-gray-900">
                    Plan: {productInfo.name}
                  </h3>
                )}
                <div className="mt-6 flex items-baseline">
                  <p className="text-4xl">
                    $ {parseInt(planInfo.unitAmount) * 0.01}
                  </p>
                  <p className="ml-4 text-base">
                    {' '}
                    / user / {planInfo.interval}
                  </p>
                </div>
              </>
            )}
            {status === 'canceled' && (
              <>
                {/* @ts-expect-error */}
                <Button
                  color="blue"
                  href="/pricing"
                  className="mt-4 rounded-md"
                >
                  Reactivate Now
                </Button>
              </>
            )}
          </Card>
        )}
        {status !== 'never' ? (
          <Card bg="" className="shadow-none">
            <h2 className="text-lg font-medium leading-6 text-gray-900">
              Payment Portal
            </h2>
            <h3 className="text-md mt-6 font-medium leading-6 text-gray-900">
              We partnered with Stripe to simplify billing.
            </h3>
            <button
              type="button"
              className="mt-6 flex items-center justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-center text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={redirectToCustomerPortal}
            >
              {isLoading ? (
                <Spinner fill="fill-white" />
              ) : (
                <span>View Billing Portal</span>
              )}
            </button>
          </Card>
        ) : (
          <Card>
            <h2 className="text-2xl font-medium leading-6 text-gray-900">
              Upgrade Your Account
            </h2>
            <PricingOptions inProduct />
          </Card>
        )}
        <Card bg="" className="shadow-none">
          <h2 className="text-lg font-medium leading-6 text-gray-900">
            Support
          </h2>
          <h3 className="text-md mt-6 font-medium leading-6 text-gray-900">
            Need help with something?
          </h3>

          <p className="text-md mt-6 leading-6 text-gray-900">
            Contact{' '}
            <a href="mailto:support@servicegeek.app" className="underline">
              support@servicegeek.app
            </a>
          </p>
        </Card>
      </div>
    </>
  )
}
