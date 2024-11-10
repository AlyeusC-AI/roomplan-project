import Image from 'next/image'

export default function ConfirmEmail() {
  return (
    <>
      <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center sm:mx-auto sm:w-full sm:max-w-md">
          <Image
            className="mx-auto w-auto"
            src="/images/brand/servicegeek.svg"
            alt="Your Company"
            height={60}
            width={60}
          />
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Confirm your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please check your inbox for an email confirmation
          </p>
        </div>
        <div className="mt-8 flex items-center justify-center">
          <Image
            src="/images/mail-sent.svg"
            width={647.63626 / 3}
            height={632.17383 / 3}
            alt="Email Sent"
          />
        </div>
      </div>
    </>
  )
}
