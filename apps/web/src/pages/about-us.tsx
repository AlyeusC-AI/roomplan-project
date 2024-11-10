import { Hero } from '@components/AboutUs/Hero'
import Mission from '@components/AboutUs/Mission'
import TheTeam from '@components/AboutUs/TheTeam'
import { Footer } from '@components/LandingPage/Footer'
import { Header } from '@components/LandingPage/Header'
import Head from 'next/head'

export default function AboutUs() {
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
        <Hero />
        <Mission />
        <TheTeam />
      </main>
      <Footer />
    </>
  )
}
