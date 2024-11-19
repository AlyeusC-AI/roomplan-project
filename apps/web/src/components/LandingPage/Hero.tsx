import { useEffect, useState } from 'react'
import PrimaryLink from '@components/DesignSystem/Links/PrimaryLink'
import { Container } from '@components/LandingPage/Container'
import { useUser } from '@supabase/auth-helpers-react'
import router from 'next/router'
import { event } from 'nextjs-google-analytics'
import type { ReactNode } from 'react'

const RestorationDescription = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <span className="ml-1 bg-gradient-to-br from-swag-dark  to-swag-light bg-clip-text text-transparent">
    {children}
  </span>
)

export function Hero() {
  const onClick = () => {
    event('start_trial', {
      category: 'Hero',
    })
  }
  const user = useUser()

  useEffect(() => {
    if (user) {
      router.push(`/projects`)
    }
  }, [user])

  return (
    <Container className="pb-16 pt-3 text-center">
      <h1 className="mx-auto max-w-full font-display text-5xl font-medium tracking-tight text-slate-900 sm:text-7xl">
        Service Geek
      </h1>
      <h2 className="mx-auto my-4 max-w-4xl font-display text-4xl font-medium tracking-tight text-slate-900">
        The value we provide{' '}
        <RestorationDescription>
          will always be greater than the price we charge{' '}
        </RestorationDescription>
      </h2>
      {/* youtube video */}
      <div
        className="relative"
        style={{
          paddingTop: '56.25%',
        }}
      >
        <iframe
          className="absolute inset-0 h-full w-full"
          src="https://www.youtube.com/embed?v=5NQXaLtI-6M"
          frameBorder="0"
        ></iframe>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-xl tracking-tight text-slate-700">
        Take <strong>unlimited photos</strong>, schedule reminders, track leads,
        search and view storm data, all the tools you need - all in one app.
      </p>
      <div className="mt-6 flex justify-center gap-x-6">
        {user ? (
          <>
            <PrimaryLink href="/projects" onClick={onClick}>
              View Projects
            </PrimaryLink>
          </>
        ) : (
          <>
            <PrimaryLink variant="swag" href="/demo" onClick={onClick}>
              Get Started
            </PrimaryLink>
            <PrimaryLink variant="invert-swag" href="/demo" onClick={onClick}>
              Book a Demo
            </PrimaryLink>
          </>
        )}
      </div>
    </Container>
  )
}
