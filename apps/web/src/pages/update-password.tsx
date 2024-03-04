import { FormEvent, useEffect, useState } from 'react'
import LogoTextBlue from '@components/DesignSystem/Logo/LogoTextBlue'
import { AuthLayout } from '@components/LandingPage/AuthLayout'
import { Button } from '@components/LandingPage/Button'
import { TextField } from '@components/LandingPage/Fields'
import Spinner from '@components/Spinner'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import queryString from 'query-string'

export default function UpdatePassword() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [refreshToken, setRefreshToken] = useState('')

  const router = useRouter()
  const supabase = useSupabaseClient()

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(event)
      if (event == 'PASSWORD_RECOVERY') {
        // const newPassword = prompt("What would you like your new password to be?");
        // const { data, error } = await supabase.auth
        //   .updateUser({ password: newPassword })
        // if (data) alert("Password updated successfully!")
        // if (error) alert("There was an error updating your password.")
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePasswordReset = async (e: FormEvent) => {
    e.preventDefault()
    // @ts-expect-error
    if (!e.target.password || !e.target.confirmPassword) {
      setError('Invalid form state. Please refresh the page.')
      return
    }
    // @ts-expect-error
    if (e.target.password.value !== e.target.confirmPassword.value) {
      setError('Passwords do not match.')
      return
    }
    try {
      setLoading(true)
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      const { data, error } = await supabase.auth.updateUser({
        // @ts-expect-error
        password: e.target.password.value,
      })
      if (error) throw error
      router.push('/login?reset_successful=1')
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

  useEffect(() => {
    const query = queryString.parse(router.asPath.split('#')[1])
    if (query.access_token && !Array.isArray(query.access_token)) {
      setAccessToken(query.access_token)
    }
    if (query.refresh_token && !Array.isArray(query.refresh_token)) {
      setRefreshToken(query.refresh_token)
    }
    if (query.error_description && typeof query.error_description === 'string')
      setError(query.error_description)
  }, [router])

  return (
    <>
      <Head>
        <title>Update Password - RestorationX</title>
      </Head>
      <AuthLayout>
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
            label="Password"
            id="password"
            name="Password"
            type="password"
            autoComplete="password"
            required
          />
          <TextField
            label="Confirm Password"
            id="confirmPassword"
            name="confirm-password"
            type="password"
            autoComplete="password"
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
                  Reset Password <span aria-hidden="true">&rarr;</span>
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
      </AuthLayout>
    </>
  )
}
