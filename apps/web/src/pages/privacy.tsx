import { Footer } from '@components/LandingPage/Footer'
import { Header } from '@components/LandingPage/Header'
import Privacy from '@components/policies/Privacy'
import Head from 'next/head'

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>RestorationX - Terms of Service</title>
        <meta
          name="description"
          content="A job management platform built for restoration"
        />
      </Head>
      <Header />
      <Privacy />
      <Footer />
    </>
  )
}
