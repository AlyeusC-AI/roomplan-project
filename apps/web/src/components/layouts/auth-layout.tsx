import backgroundImage from '@images/background-auth.jpg'
import Image from 'next/image'

export function AuthLayout({ children }: React.PropsWithChildren<{}>) {
  return (
    <>
      <div className="relative flex justify-center md:px-12 lg:px-0">
        <div className="relative z-10 flex flex-1 flex-col bg-white py-10 px-4 min-h-screen shadow-2xl sm:justify-center md:flex-none md:px-28">
          <div className="mx-auto min-h-screen w-full max-w-md sm:px-4 md:w-96 md:max-w-sm md:px-0">
            {children}
          </div>
        </div>
        <div className="min-h-screen inset-0 hidden w-full flex-1 sm:block lg:w-0">
          <Image
            src={backgroundImage}
            alt=""
            fill
            unoptimized
          />
        </div>
      </div>
    </>
  )
}
