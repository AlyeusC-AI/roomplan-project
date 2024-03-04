import { Header } from '@components/LandingPage/Header'
import PlatformFeatures from '@components/LandingPage/PlatformFeatures'
import PageContainer from '@components/PageContainer'
import PricingOptions from '@components/Pricing/PricingOptions'
import type { NextPage } from 'next'
import Head from 'next/head'

interface PricingPageProps {
  error?: string
  isAdmin?: boolean
}

const PricingPage: NextPage<PricingPageProps> = () => {
  return (
    <PageContainer>
      <Head>
        <title>RestorationX - Pricing</title>
        <meta name="description" content="RestorationX pricing" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <PricingOptions />
      <PlatformFeatures />
    </PageContainer>
  )
}

export default PricingPage
