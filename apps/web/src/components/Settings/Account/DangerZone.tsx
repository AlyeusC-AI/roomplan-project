import { useState } from 'react'
import Card from '@components/DesignSystem/Card'

import ConfirmAccountDeletion from './ConfirmAccountDeletion'

const DangerZone = () => {
  const [open, setOpen] = useState(false)
  return (
    <Card bg="" className="shadow-none">
      <h2 className="text-lg font-medium leading-6 text-gray-900">
        Delete Account
      </h2>
      <p className="text-dm mt-6 max-w-2xl text-gray-500">
        Permanently deletes account. If you are the account administrator this
        will cancel any active subscription you have. Team members will lose
        access to the organization.
      </p>
      <button
        type="button"
        className="mt-6 inline-flex items-center justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:text-sm"
        onClick={() => setOpen(true)}
      >
        Delete account
      </button>
      <ConfirmAccountDeletion open={open} setOpen={setOpen} />
    </Card>
  )
}

export default DangerZone
