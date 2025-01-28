"use client";

import { Button } from "@components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  return (
    <>
      <div className='min-h-screen bg-background px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8'>
        <div className='mx-auto max-w-max'>
          <main className='sm:flex'>
            <p className='text-4xl font-bold tracking-tight text-primary sm:text-5xl'>
              404
            </p>
            <div className='sm:ml-6'>
              <div className='sm:border-l sm:border-gray-200 sm:pl-6'>
                <h1 className='text-4xl font-bold tracking-tight text-foreground sm:text-5xl'>
                  Page not found
                </h1>
                <p className='mt-1 text-base text-gray-500'>
                  Please check the URL in the address bar and try again.
                </p>
              </div>
              <div className='mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6'>
                <Button onClick={() => router.push("/projects")}>
                  Go back home
                </Button>
                <Button
                  variant='link'
                  onClick={() => router.push("mailto:support@servicegeek.app")}
                >
                  Contact support
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
