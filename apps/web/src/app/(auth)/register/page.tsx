import { Metadata } from 'next'
import Register from './main'
import { verifyUserLoggedOut } from '@lib/server-side-fetching/verify-user-logged-out'
import { RegisterForm } from '@components/auth/register-form'

export const metadata: Metadata = {
  title: 'Sign Up',
}

export default async function Component() {
  // await verifyUserLoggedOut()
  return <RegisterForm />
}
