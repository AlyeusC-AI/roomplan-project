import { Metadata } from 'next'
import AccountSettings from './main'
import { Suspense } from 'react'
import { createClient } from '@lib/supabase/server'

export const metadata: Metadata = {
  title: 'Account Settings',
  description: 'ServiceGeek account settings',
  icons: ['/favicon.ico'],
}

export default async function Component() {
  const client = await createClient()
  const user = await client.auth.getUser()

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AccountSettings user={user} />
    </Suspense>
  )
}
