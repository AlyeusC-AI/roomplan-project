import { FormEvent, useState } from 'react'
import Success from '@components/DesignSystem/Alerts/Success'
import PrimaryButton from '@components/DesignSystem/Buttons/PrimaryButton'
import PrimaryLink from '@components/DesignSystem/Links/PrimaryLink'
import LogoTextBlue from '@components/DesignSystem/Logo/LogoTextBlue'
import { AuthLayout } from '@components/LandingPage/AuthLayout'
import { TextField } from '@components/LandingPage/Fields'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function ResetPasswordRequest() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
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
      setError('Must provide email.')
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(
        // @ts-expect-error
        e.target.email.value,
        {
          redirectTo: `${window.location.origin}/update-password`,
        }
      )
      if (error) throw error
      setSuccess(true)
    } catch (error) {
      console.error(error)
      // @ts-expect-error
      if (error.status) {
        // @ts-expect-error
        if (error.status === 429) {
          setError(
            'For security purposes, you can only request this once every 60 seconds.'
          )
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
        <title>Sign In - ServiceGeek</title>
      </Head>
      <AuthLayout>
        <div className="flex flex-col">
          <Link href="/" aria-label="Home" className="h-10 w-auto">
            <LogoTextBlue />
          </Link>
          <div className="mt-20">
            <h2 className="text-lg font-semibold text-gray-900">
              Forgot password
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
        {success ? (
          <>
            <Success>Password reset email sent!</Success>
            <PrimaryLink className="mt-4 w-full" href="/login">
              Sign In
            </PrimaryLink>
          </>
        ) : (
          <form
            action="#"
            className="mt-10 grid grid-cols-1 gap-y-8"
            onSubmit={handlePasswordReset}
          >
            <TextField
              label="Email"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
            <div>
              <PrimaryButton loading={loading} type="submit" className="w-full">
                <span>
                  Send Password Reset Email{' '}
                  <span aria-hidden="true">&rarr;</span>
                </span>
              </PrimaryButton>
            </div>
          </form>
        )}
        {error && (
          <>
            <p className="mt-4 text-sm text-red-700">{error}</p>
          </>
        )}
      </AuthLayout>
    </>
  )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  let isLoggedIn = false
  try {
    const supabase = createServerSupabaseClient({
      req: ctx.req as NextApiRequest,
      res: ctx.res as NextApiResponse,
    })
    // const { user, accessToken } = await getUser(ctx)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    isLoggedIn = !!user
  } catch (e) {}

  if (isLoggedIn) {
    return {
      redirect: {
        destination: '/projects',
        permanent: false,
      },
    }
  }
  return {
    props: {}, // will be passed to the page component as props
  }
}
