import { Footer } from '@components/LandingPage/Footer'
import { Header } from '@components/LandingPage/Header'
import Terms from '@components/policies/Terms'
import Head from 'next/head'

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>ServiceGeek - Terms of Service</title>
        <meta
          name="description"
          content="A job management platform built for restoration"
        />
      </Head>
      <Header />
      <Terms />
      <Footer />
    </>
  )
}
