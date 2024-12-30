import { Card } from '@components/components'

import DangerZone from './DangerZone'
import UpdateInfo from './UpdateInfo'

interface AccountProps {
  isAdmin: boolean
  emailConfirmed: boolean
}

const deletionEnabled = false
export default function Account({ isAdmin, emailConfirmed }: AccountProps) {
  return (
    <>
      {/* Payment details */}
      <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
        <UpdateInfo emailConfirmed={emailConfirmed} />
        {deletionEnabled && <DangerZone />}
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
