"use client";

import { LogoIconBlue } from '@components/components'
import Image from 'next/image'

export default function AccessRevokedPage() {
  return (
    <div className='flex min-h-screen flex-col bg-gray-50'>
      <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center sm:mx-auto sm:w-full sm:max-w-md">
          <div className="h-auto w-16">
            <LogoIconBlue />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            You&apos;ve been removed from this organization
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your organization administrator has removed your access. If you feel
            as if this was a mistake, please contact your organization
            administrator to restore access.
          </p>
        </div>
        <div className="mt-8 flex items-center justify-center">
          <Image
            src="/images/access-denied.svg"
            width={647.63626 / 3}
            height={632.17383 / 3}
            alt="Access denied"
          />
        </div>
      </div>
    </div>
  )
}
