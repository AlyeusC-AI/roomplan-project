import { FormEvent, useState } from 'react'
import LogoTextBlue from '@components/DesignSystem/Logo/LogoTextBlue'
import { AuthLayout } from '@components/LandingPage/AuthLayout'
import { Button } from '@components/LandingPage/Button'
import { TextField } from '@components/LandingPage/Fields'
import Spinner from '@components/Spinner'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import getURL from '@utils/getURL'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function UpdatePassword() {
  const [emailSent, setEmailSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = useSupabaseClient()

  const handlePasswordReset = async (e: FormEvent) => {
    e.preventDefault()
    // @ts-expect-error
    if (!e.target.email) {
      setError('Invalid form state. Please refresh the page.')
      return
    }
    // @ts-expect-error
    if (!e.target.email.value) {
      setError('Missing Email.')
      return
    }
    try {
      setLoading(true)
      console.log(getURL() + '/update-password')
      const { error } = await supabase.auth.resetPasswordForEmail(
        // @ts-expect-error
        e.target.email.value,
        {
          redirectTo: `${window.location.origin}/update-password`,
        }
      )
      if (error) {
        setError('Password resets can only be requested once every 60 seconds.')
      }
      await supabase.auth.signOut()

      setEmailSent(true)
    } catch (error) {
      console.log(error)
      // @ts-expect-error
      if (error.status) {
        // @ts-expect-error
        if (error.status === 422) {
          // @ts-expect-error
          setError(error.message as string)
        } else {
          setError(
            'Session Expired. Please request another password reset email.'
          )
        }
      } else {
        setError(
          'Session Expired. Please request another password reset email.'
        )
      }
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Reset Password - RestorationX</title>
      </Head>
      <AuthLayout>
        {emailSent ? (
          <div className="mt-20">
            <h2 className="text-xl font-semibold text-gray-900">
              Password Reset Email Sent
            </h2>
            <p className="mt-2 text-sm text-gray-700">
              Check your inbox to find your password reset link to RestorationX.
            </p>
            <p className="mt-2 text-sm text-gray-700">
              Remembered your password?{' '}
              <Link
                prefetch={false}
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>{' '}
              with your current password instead.
            </p>
            <div className="mt-4">
              <Image
                src="/images/email-sent.svg"
                width={647.63626 / 3}
                height={632.17383 / 3}
                alt="Email Sent"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col">
              <Link href="/" aria-label="Home" className="h-10 w-auto">
                <LogoTextBlue />
              </Link>
              <div className="mt-20">
                <h2 className="text-lg font-semibold text-gray-900">
                  Reset password
                </h2>
                <p className="mt-2 text-sm text-gray-700">
                  Remembered your password?
                  <Link
                    href="/login"
                    className="ml-2 font-medium text-primary hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
            <form
              action="#"
              className="mt-10 grid grid-cols-1 gap-y-8"
              onSubmit={handlePasswordReset}
            >
              <TextField
                label="Email"
                id="email"
                name="Email"
                type="email"
                autoComplete="email"
                required
              />
              <div>
                {/* @ts-expect-error */}
                <Button
                  type="submit"
                  variant="solid"
                  color="blue"
                  className="w-full"
                >
                  {loading ? (
                    <Spinner fill="fill-white" bg="text-black" />
                  ) : (
                    <span>
                      Send Reset Password Email{' '}
                      <span aria-hidden="true">&rarr;</span>
                    </span>
                  )}
                </Button>
              </div>
            </form>
            {error && (
              <>
                <p className="mt-4 text-sm text-red-700">{error}</p>
              </>
            )}
          </>
        )}
      </AuthLayout>
    </>
  )
}
