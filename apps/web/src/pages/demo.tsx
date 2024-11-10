import { Calender } from '@components/Demo'
import { Footer } from '@components/LandingPage/Footer'
import { Header } from '@components/LandingPage/Header'
import Head from 'next/head'

export default function Demo() {
  return (
    <>
      <Head>
        <title>
          ServiceGeek - A job management platform built for restoration
        </title>
        <meta
          name="description"
          content="A job management platform built for restoration"
        />
      </Head>
      <Header />
      <main>
        <Calender />
      </main>
      <Footer />
    </>
  )
}
