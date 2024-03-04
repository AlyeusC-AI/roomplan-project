import AppHeader from '@components/AppHeader'
import AccessRevoked from '@components/OffBoarding/AccessRevoked'
import PageContainer from '@components/PageContainer'
import type { NextPage } from 'next'
import Head from 'next/head'

const AccessRevokedPage: NextPage<{}> = () => {
  console.log(process.env.VERCEL_ENV)
  return (
    <PageContainer>
      <Head>
        <title>RestorationX - Dashboard</title>
        <meta name="description" content="Access Denied" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AppHeader skeleton={true} />
      <AccessRevoked />
    </PageContainer>
  )
}

export default AccessRevokedPage
