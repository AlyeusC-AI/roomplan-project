import PrimaryLink from '@components/DesignSystem/Links/PrimaryLink'
import { Container } from '@components/LandingPage/Container'

export function CallToAction() {
  return (
    <section
      id="get-started-today"
      // className="relative overflow-hidden bg-primary py-32"
      className="relative overflow-hidden bg-slate-50 py-32"
    >
      {/* <div className="absolute top-1/2 left-1/2 -translate-x-[50%] -translate-y-[50%]">
        <Image
          src={backgroundImage}
          alt=""
          width={2347}
          height={1244}
          layout="fixed"
          unoptimized
        />
      </div> */}
      <Container className="relative">
        <div className="mx-auto max-w-lg text-center">
          {/* <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl"> */}
          <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
            Want to learn more?
          </h2>
          {/* <p className="mt-4 text-lg tracking-tight text-white"> */}
          <p className="mt-4 text-lg tracking-tight text-slate-900">
            Book a demo with one of our experts to learn more about how we can
            help your restoration business.
          </p>
          <PrimaryLink
            href="/demo"
            className="mt-10"
            variant='swag'
          >
            Book a Demo Today
          </PrimaryLink>
        </div>
      </Container>
    </section>
  )
}
