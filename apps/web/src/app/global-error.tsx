"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang='en'>
      <head>
        <title>Error - RestoreGeek</title>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
      </head>
      <body className='bg-gradient-to-br from-gray-50 to-gray-100'>
        <div className='flex min-h-screen items-center justify-center p-4'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='w-full max-w-lg'
          >
            <div className='rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-200'>
              <div className='mb-6 flex items-center gap-4'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-red-100'>
                  <svg
                    className='h-6 w-6 text-red-600'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                    />
                  </svg>
                </div>
                <div>
                  <h2 className='text-2xl font-semibold text-gray-900'>
                    Oops! Something went wrong
                  </h2>
                  <p className='text-sm text-gray-500'>
                    We've been notified and are working on it
                  </p>
                </div>
              </div>

              <div className='mb-6 rounded-lg bg-gray-50 p-4'>
                <p className='break-all font-mono text-sm text-gray-800'>
                  {error.message}
                </p>
                {error.digest && (
                  <div className='mt-2 flex items-center gap-2 text-xs text-gray-500'>
                    <svg
                      className='h-4 w-4'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                    <span>Error ID: {error.digest}</span>
                  </div>
                )}
              </div>

              <div className='flex flex-col gap-3'>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={reset}
                  className='w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                >
                  Try again
                </motion.button>
                <button
                  onClick={() => (window.location.href = "/")}
                  className='w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                >
                  Return to home
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </body>
    </html>
  );
}
