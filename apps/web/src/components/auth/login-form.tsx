'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/spinner'
import { toast } from 'sonner'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useSearchParams()
  const navigate = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState((router?.get('email') as string) ?? '')
  const [password, setPassword] = useState('')

  const [sentMagicLink, setSentMagicLink] = useState(false)
  const supabaseClient = createClient()

  // Logging In The User With Supabase
  const handleLogin = async (e: React.FormEvent) => {
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
      navigate.push('/projects')
    } catch (error) {
      // Logging The Error To The Console
      console.error(error)

      // Setting The Error Text
      toast.error('An Error Occured', {
        description:
          'The credentials you entered are invalid. Please check your email and password and try again.',
      })

      // Toggling Loading
      setLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabaseClient.auth.signInWithOtp({
      email,
    })

    setLoading(false)

    if (!error) {
      setSentMagicLink(true)
      return
    }

    toast.error('An Error Occured', {
      description:
        'The credentials you entered are invalid. Please check your email and password and try again.',
    })
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner className="w-full" />
      </div>
    )
  }

  if (sentMagicLink) {
    return (
      <div className="mt-20 flex flex-col items-center justify-center px-4">
        <div className="my-auto">
          <h1 className="text-center text-2xl font-bold">
            Magic link email sent
          </h1>
          <p className="text-balance text-center text-muted-foreground">
            Check your inbox to find your login link to ServiceGeek.
          </p>
        </div>
        <div className="mt-4">
          <img
            src="/images/email-sent.svg"
            width={647.63626 / 3}
            height={632.17383 / 3}
            alt="Email Sent"
            className="my-10"
          />
        </div>
        <Button
          onClick={() => setSentMagicLink(false)}
          variant="default"
          className="mb-10 w-11/12"
        >
          Continue With Password
        </Button>
      </div>
    )
  }

  return (
    <form className="p-6 md:p-8" onSubmit={handleLogin}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-balance text-muted-foreground">
            Login to your ServiceGeek account
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="johndoe@company.com"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="/reset-password"
              className="ml-auto text-sm underline-offset-2 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
        <div className="text-center text-sm">
          Don&apos;t have an account?{' '}
          <a href="/register" className="underline underline-offset-4">
            Sign up
          </a>
        </div>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        <Button onClick={handleMagicLink} variant="outline" className="w-full">
          Magic Link
        </Button>
      </div>
    </form>
  )
}
