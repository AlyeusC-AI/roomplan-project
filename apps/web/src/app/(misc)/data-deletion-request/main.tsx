'use client'

import { useState } from 'react'
import { Footer } from '@components/layouts/footer'
import { Alert, PrimaryButton } from '@components/components'
import { EnvelopeIcon } from '@heroicons/react/24/outline'

export default function DataDeletionRequest() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (process.env.NODE_ENV === 'production') {
        await fetch(
          'https://hooks.slack.com/services/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',
          {
            method: 'POST',
            body: JSON.stringify({
              blocks: [
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: 'New user data deletion request',
                  },
                },
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: `• email: ${email} \n • full name: ${name} \n`,
                  },
                },
              ],
            }),
          }
        )
      }
    } catch (error) {
      console.error('Could not send slack message', error)
    }
    try {
      await fetch('/api/compliance/data-deletion-request', {
        method: 'POST',
        body: JSON.stringify({
          email,
          fullName: name,
        }),
      })
    } catch (error) {
      console.error('Could not save request', error)
    }
    setSuccess(true)
    setIsLoading(false)
  }

  return (
    <>
      <main>
        <div className="relative bg-white">
          <div className="absolute inset-0">
            <div className="absolute inset-y-0 left-0 w-1/2 bg-gray-50" />
          </div>
          <div className="relative mx-auto max-w-7xl lg:grid lg:grid-cols-5">
            <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:col-span-2 lg:px-8 lg:py-24 xl:pr-12">
              <div className="mx-auto max-w-lg">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  Request Data Deletion
                </h2>
                <p className="mt-3 text-lg leading-6 text-gray-500">
                  If you would like all data related to your account to be
                  permantely deleted, you may submit a request to us directly.
                  Once deleted the data will be permanently gone forever.
                </p>
                <p className="mt-3 text-lg leading-6 text-gray-500">
                  Please note that only <strong>Account Admins</strong> may
                  request deletion of an entire organizations data. If you are
                  not an account admin, only personally identifiable information
                  will be wiped from our servers.
                </p>
                <p className="mt-3 text-lg leading-6 text-gray-500">
                  Alternatively, you may contact us directly.
                </p>
                <dl className="mt-8 text-base text-gray-500">
                  <div className="mt-3">
                    <dt className="sr-only">Email</dt>
                    <dd className="flex">
                      <EnvelopeIcon
                        className="h-6 w-6 flex-shrink-0 text-gray-400"
                        aria-hidden="true"
                      />
                      <span className="ml-3">support@servicegeek.app</span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="bg-white py-16 px-4 sm:px-6 lg:col-span-3 lg:py-24 lg:px-8 xl:pl-12">
              <div className="mx-auto max-w-lg lg:max-w-none">
                {success && (
                  <Alert title="Data Deletion Request Submitted" type="success">
                    <div>
                      <p>
                        Your request has been submitted. It may take up to 30
                        days to fully remove all data from our servers. Once
                        we&apos;ve begun processing your request, you will
                        receive an email.
                      </p>
                      <p className="mt-4">
                        <strong>Name:</strong> {name}
                      </p>
                      <p>
                        <strong>Email:</strong> {email}
                      </p>
                    </div>
                  </Alert>
                )}
                <form onSubmit={onSubmit} className="grid grid-cols-1 gap-y-6">
                  <div>
                    <label htmlFor="full-name" className="sr-only">
                      Full name
                    </label>
                    <input
                      type="text"
                      name="full-name"
                      id="full-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      className="block w-full rounded-md border-gray-300 py-3 px-4 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="sr-only">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="block w-full rounded-md border-gray-300 py-3 px-4 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Email"
                    />
                  </div>
                  <div>
                    <PrimaryButton
                      type="submit"
                      loading={loading}
                      disabled={success || loading}
                    >
                      Submit
                    </PrimaryButton>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
