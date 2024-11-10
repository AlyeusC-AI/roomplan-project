import { CallToAction } from '@components/LandingPage/CallToAction'
import FeaturedIn from '@components/LandingPage/FeaturedIn'
import { Footer } from '@components/LandingPage/Footer'
import { Header } from '@components/LandingPage/Header'
import { Hero } from '@components/LandingPage/Hero'
import Partners from '@components/LandingPage/Partners'
import PlatformFeatures from '@components/LandingPage/PlatformFeatures'
import { PrimaryFeatures } from '@components/LandingPage/PrimaryFeatures'
import { Testimonials } from '@components/LandingPage/Testimonials'
import PricingOptions from '@components/Pricing/PricingOptions'
import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <meta name="servicegeek" content="app-id=6444232239"></meta>
        <title>
          ServiceGeek - A job management platform built for restoration
        </title>
        <meta
          name="description"
          content="A job management platform built for restoration"
        />
      </Head>
      <Header />
      <main className="bg-gray-50">
        <Hero />
        <PrimaryFeatures />
        <PlatformFeatures />
        <PricingOptions />
        <FeaturedIn />
        <Testimonials />
        <Partners />

        <CallToAction />
        {/* <Faqs /> */}
      </main>
      <Footer />
    </>
  )
}
