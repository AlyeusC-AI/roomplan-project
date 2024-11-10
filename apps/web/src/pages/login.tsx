import { ChangeEvent, FormEvent, useState } from 'react'
import Success from '@components/DesignSystem/Alerts/Success'
import { AuthLayout } from '@components/LandingPage/AuthLayout'
import { TextField } from '@components/LandingPage/Fields'
import { GetServerSidePropsContext } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
const cookie = require('cookie')
import PrimaryButton from '@components/DesignSystem/Buttons/PrimaryButton'
import SecondaryButton from '@components/DesignSystem/Buttons/SecondaryButton'
import TertiaryLink from '@components/DesignSystem/Links/TertiaryLink'
import LogoTextBlue from '@components/DesignSystem/Logo/LogoTextBlue'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Image from 'next/image'
import { ClipLoader } from 'react-spinners'

export const BETA_COOKIE = 'servicegeek_beta_enabled'

export default function Login() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState((router.query.email as string) || '')
  const [password, setPassword] = useState('')

  const [magicLinkLoading, setMagicLinkLoading] = useState(false)
  const [sentMagicLink, setSentMagicLink] = useState(false)
  const [error, setError] = useState(false)
  const supabaseClient = useSupabaseClient()

  // Logging In The User With Supabase
  const handleLogin = async (e: FormEvent) => {
    // Preventing Reloading The Page
    e.preventDefault()

    try {
      // Setting Loading
      setLoading(true)

      // Logging In The User With Supabase
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      })

      // If There Is An Error, Throw It
      if (error) throw error

      // Otherwise, Route The User To "/projects"
      router.push('/projects')
    } catch (error) {
      // Logging The Error To The Console
      console.error(error)

      // Setting The Error Text
      setError(true)

      // Toggling Loading
      setLoading(false)
    }
  }

  const handleMagicLink = async (e: FormEvent) => {
    setMagicLinkLoading(true)
    const { error } = await supabaseClient.auth.signInWithOtp({
      email,
    })
    if (!error) {
      setSentMagicLink(true)
      setMagicLinkLoading(false)
    }
  }

  if (sentMagicLink) {
    return (
      <>
        <Head>
          <title>Sign In - ServiceGeek</title>
        </Head>
        <AuthLayout>
          <div className="mt-20">
            <h2 className="text-xl font-semibold text-gray-900">
              Magic link email sent
            </h2>
            <p className="mt-2 text-sm text-gray-700">
              Check your inbox to find your login link to ServiceGeek.
            </p>
            <p className="mt-2 text-sm text-gray-700">
              Didn&apos;t get an email?{' '}
              <Link
                prefetch={false}
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>{' '}
              with your password instead.
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
        </AuthLayout>
      </>
    )
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
          {router.query.reset_successful && (
            <Success>Password Successfully Reset</Success>
          )}
          <div className="mt-20">
            <h2 className="text-lg font-semibold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-700">
              Don’t have an account?{' '}
              <TertiaryLink href="/register">Sign up</TertiaryLink> for a free
              trial.
            </p>
          </div>
        </div>
        {loading ? (
          <div className="flex w-full flex-col items-center justify-center py-10">
            <ClipLoader color="#2563eb" />
            <p className="mt-6 text-gray-600">Securely logging in...</p>
          </div>
        ) : (
          <>
            <form
              action="#"
              className="mt-10 grid grid-cols-1 gap-y-8"
              onSubmit={handleLogin}
            >
              <TextField
                label="Email address"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                required
              />
              <TextField
                label="Password"
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                autoComplete="current-password"
                required
              />
              <div className="flex flex-col">
                <PrimaryButton
                  type="submit"
                  loading={loading}
                  className="mb-2 w-full"
                >
                  Sign in <span aria-hidden="true">&rarr;</span>
                </PrimaryButton>
                <SecondaryButton
                  onClick={handleMagicLink}
                  loading={magicLinkLoading}
                >
                  Email me a login link
                </SecondaryButton>
                <p className="mt-2 text-sm text-gray-700">
                  Forgot your password?
                  <Link
                    href="/forgot-password"
                    className="ml-2 font-medium text-primary hover:underline"
                  >
                    Reset password
                  </Link>
                </p>
              </div>
            </form>
            {error && (
              <>
                <p className="mt-4 text-sm text-red-700">
                  Invalid email or password{' '}
                </p>
                <Link
                  href="/forgot-password"
                  className="mt-2 text-sm text-primary"
                >
                  Forgot your password or email?
                </Link>
              </>
            )}
          </>
        )}
      </AuthLayout>
    </>
  )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  let isLoggedIn = false
  try {
    var CookieDate = new Date()
    CookieDate.setFullYear(CookieDate.getFullYear() + 1)
    ctx.res.setHeader(
      'set-cookie',
      cookie.serialize(BETA_COOKIE, 'true', {
        expires: CookieDate,
      })
    )
    // @ts-expect-error uhoh
    const supabaseServerClient = createServerSupabaseClient({
      req: ctx.req,
      res: ctx.res,
    })
    // const { user, accessToken } = await getUser(ctx)
    const {
      data: { user },
    } = await supabaseServerClient.auth.getUser()
    // const { user, error } = await supabase.auth.api.getUserByCookie(
    //   ctx.req,
    //   ctx.res
    // )

    isLoggedIn = !!user
  } catch (e) {
    console.log(e)
  }

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
