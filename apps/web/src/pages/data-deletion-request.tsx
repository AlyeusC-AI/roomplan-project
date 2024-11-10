import DataDeletionRequest from '@components/DataDeletionRequest/DataDeletionRequest'
import { Footer } from '@components/LandingPage/Footer'
import { Header } from '@components/LandingPage/Header'
import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>ServiceGeek - Request Account Deletion</title>
        <meta
          name="description"
          content="A job management platform built for restoration"
        />
      </Head>
      <Header />
      <main>
        <DataDeletionRequest />
      </main>
      <Footer />
    </>
  )
}
