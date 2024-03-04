import { SpeakerWaveIcon, XMarkIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import Link from 'next/link'
import { ReactNode, useState } from 'react'

const Banner = ({
  isDismissable = false,
  onDismiss = () => null,
  title,
  children,
  cta,
  variant,
}: {
  isDismissable?: boolean
  onDismiss?: () => void
  title: string
  children: ReactNode
  cta?: {
    text: string
    href: string
  }
  variant: 'alert' | 'success'
}) => {
  const [isVisible, setIsVisible] = useState(true)

  const dismiss = () => {
    setIsVisible(false)
    onDismiss()
  }

  if (!isVisible) return null

  return (
    <div className="w-full pb-4">
      <div
        className={clsx(
          'rounded-md p-2 shadow-lg sm:p-3',
          variant === 'alert' && 'bg-orange-600',
          variant === 'success' && 'bg-green-600'
        )}
      >
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex flex-1 items-center">
            <span
              className={clsx(
                'flex rounded-lg p-2',
                variant === 'alert' && 'bg-orange-800',
                variant === 'success' && 'bg-green-800'
              )}
            >
              <SpeakerWaveIcon
                className="h-6 w-6 text-white"
                aria-hidden="true"
              />
            </span>
            <div className="ml-3 flex flex-col font-medium text-white">
              <span className="font-bold">{title}</span>
              <span className="mt-4 inline">{children}</span>
            </div>
          </div>
          {cta && (
            <div className="order-3 mt-2 w-full flex-shrink-0 sm:order-2 sm:mt-0 sm:w-auto">
              <Link
                href={cta.href}
                className={clsx(
                  'flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-blue-50',
                  variant === 'alert' && 'text-orange-600',
                  variant === 'success' && 'text-green-600'
                )}
              >
                {cta.text}
              </Link>
            </div>
          )}
          {isDismissable && (
            <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-2">
              <button
                type="button"
                className="-mr-1 flex rounded-md p-2 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-white"
                onClick={dismiss}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Banner
