import { ChangeEvent, useState } from 'react'
import Error from '@components/DesignSystem/Alerts/Error'
import PhoneNumber from '@components/DesignSystem/AutoPhoneNumberFormat'
import PrimaryButton from '@components/DesignSystem/Buttons/PrimaryButton'
import GradientText from '@components/DesignSystem/GradientText'
import LogoIconBlue from '@components/DesignSystem/Logo/LogoIconBlue'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import { InviteStatus } from '@pages/projects'

export default function SetupAccountFromInvite({
  inviteStatus,
}: {
  inviteStatus: InviteStatus
}) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [inputError, setInputError] = useState('')
  const [loading, setIsLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const router = useRouter()

  const supabaseClient = useSupabaseClient()

  const onSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    if (!e.target.checkValidity()) {
      setInputError('Phone is invalid, must be in the format xxx-xxx-xxxx')
      setIsLoading(false)
      return
    }
    if (!password || !confirmPassword || !lastName || !firstName || !phone) {
      setInputError('Please complete the form to continue.')
      setIsLoading(false)
      return
    }
    if (password !== confirmPassword) {
      setInputError('Passwords must match')
      setIsLoading(false)
      return
    }
    const {
      data: { user },
      error,
    } = await supabaseClient.auth.updateUser({ password })
    if (error) {
      setInputError(error.message)
      setIsLoading(false)
      return
    }
    try {
      const res = await fetch('/api/user/accept-invite', {
        method: 'PATCH',
        body: JSON.stringify({
          id: user?.id,
          firstName,
          lastName,
          inviteId: inviteStatus.inviteId,
          phone,
        }),
      })
      if (res.ok) {
        router.reload()
        return
      } else {
        setInputError(
          'Failed to update account. Please reload the page and try again.'
        )
        setIsLoading(false)
        return
      }
    } catch (error) {
      console.log(error)
      setInputError(
        'Failed to update account. Please reload the page and try again.'
      )
      setIsLoading(false)
      return
    }
  }

  return (
    <>
      <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className=" flex flex-col items-center justify-center sm:mx-auto sm:w-full sm:max-w-md">
          <div className="w-12">
            <LogoIconBlue />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Welcome to Service Geek
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You&apos;ve joined the {inviteStatus.organizationName} organization.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={onSubmit}>
              <div className="flex space-x-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="firstName"
                      name="firstName"
                      type="firstName"
                      autoComplete="given-name"
                      required
                      value={firstName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setFirstName(e.target.value)
                      }
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="lastName"
                      name="lastName"
                      type="lastName"
                      autoComplete="family-name"
                      required
                      value={lastName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setLastName(e.target.value)
                      }
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone number
                </label>
                <div className="mt-1">
                  <PhoneNumber
                    id="phone"
                    name="phone"
                    autoComplete="phone"
                    required
                    placeholder="XXX-XXX-XXXX"
                    onCustomChange={(s: string) => setPhone(s)}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Create Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setPassword(e.target.value)
                    }
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={confirmPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setConfirmPassword(e.target.value)
                    }
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              {inputError && (
                <Error title="There was a problem setting up your account.">
                  {inputError}
                </Error>
              )}
              <div>
                <PrimaryButton
                  type="submit"
                  disabled={loading}
                  loading={loading}
                  className="w-full"
                >
                  Complete Registration
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
