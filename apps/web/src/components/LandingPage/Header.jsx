import { Fragment } from 'react'
import PrimaryLink from '@components/DesignSystem/Links/PrimaryLink'
import LogoIconBlue from '@components/DesignSystem/Logo/LogoIconBlue'
import { Container } from '@components/LandingPage/Container'
import { NavLink } from '@components/LandingPage/NavLink'
import { Popover, Transition } from '@headlessui/react'
import { useUser } from '@supabase/auth-helpers-react'
import clsx from 'clsx'
import Link from 'next/link'
import { event } from 'nextjs-google-analytics'

function MobileNavLink({ href, children }) {
  return (
    <Popover.Button as={Link} href={href} className="block w-full p-2">
      {children}
    </Popover.Button>
  )
}

function MobileNavIcon({ open }) {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5 overflow-visible stroke-slate-700"
      fill="none"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path
        d="M0 1H14M0 7H14M0 13H14"
        className={clsx(
          'origin-center transition',
          open && 'scale-90 opacity-0'
        )}
      />
      <path
        d="M2 2L12 12M12 2L2 12"
        className={clsx(
          'origin-center transition',
          !open && 'scale-90 opacity-0'
        )}
      />
    </svg>
  )
}

function MobileNavigation() {
  return (
    <Popover>
      <Popover.Button
        className="relative z-10 flex h-8 w-8 items-center justify-center [&:not(:focus-visible)]:focus:outline-none"
        aria-label="Toggle Navigation"
      >
        {({ open }) => <MobileNavIcon open={open} />}
      </Popover.Button>
      <Transition.Root>
        <Transition.Child
          as={Fragment}
          enter="duration-150 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="duration-150 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Popover.Overlay className="fixed inset-0 bg-slate-300/50" />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="duration-150 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="duration-100 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Popover.Panel
            as="div"
            className="absolute inset-x-0 top-full mt-4 flex origin-top flex-col rounded-2xl bg-white p-4 text-lg tracking-tight text-slate-900 shadow-xl ring-1 ring-slate-900/5"
          >
            <MobileNavLink href="/#features">Features</MobileNavLink>
            <MobileNavLink href="/#pricing">Pricing</MobileNavLink>
            <MobileNavLink href="/about-us">About Us</MobileNavLink>
            <MobileNavLink href="https://blog.restorationx.app">
              Blog
            </MobileNavLink>
            <MobileNavLink href="https://knowledge.restorationx.app/">
              Learn
            </MobileNavLink>
            <MobileNavLink href="/demo">Book a Demo</MobileNavLink>
          </Popover.Panel>
        </Transition.Child>
      </Transition.Root>
    </Popover>
  )
}

export function Header() {
  const onClick = () => {
    event('start_trial', {
      category: 'Header',
    })
  }

  const onViewProjects = () => {
    event('view_projects', {
      category: 'Header',
    })
  }
  const user = useUser()
  return (
    <header className="bg-gray-50 py-10">
      <Container>
        <nav className="relative z-50 flex justify-between">
          <div className="flex items-center md:gap-x-12">
            <Link href="/" aria-label="Home" className="w-10">
              <LogoIconBlue />
            </Link>
            <div className="hidden md:flex md:gap-x-4">
              <NavLink href="/#features">Features</NavLink>
              <NavLink href="/#pricing">Pricing</NavLink>
              <NavLink className="hidden lg:block" href="/about-us">
                About Us
              </NavLink>
              <NavLink
                className="hidden lg:block"
                href="https://blog.restorationx.app"
              >
                Blog
              </NavLink>
              <NavLink
                className="hidden xl:block"
                href="https://knowledge.restorationx.app/"
              >
                Learn
              </NavLink>
              <NavLink href="/demo">Book a Demo</NavLink>
              <NavLink className="hidden xl:block" href="/careers">
                Careers
                <span className="ml-1 inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800">
                  Were hiring!
                </span>
              </NavLink>
            </div>
          </div>
          <div className="flex items-center gap-x-5 md:gap-x-8">
            {!user ? (
              <>
                <div className="hidden md:block">
                  <NavLink href="/login">Sign in</NavLink>
                </div>
                <PrimaryLink href="/register" color="blue" onClick={onClick}>
                  Get Started&nbsp;
                  <span className="hidden sm:inline">Today</span>
                </PrimaryLink>
              </>
            ) : (
              <PrimaryLink
                href="/projects"
                color="blue"
                onClick={onViewProjects}
              >
                View Projects
              </PrimaryLink>
            )}
            <div className="-mr-1 md:hidden">
              <MobileNavigation />
            </div>
          </div>
        </nav>
      </Container>
    </header>
  )
}
