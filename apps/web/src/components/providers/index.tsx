"use client";

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'

import { ThemeProvider } from "next-themes"
import AnalyticsProvider from './analytics-provider'
import TRPCProvider from './trpc-provider'
import ErrorHandler from './error-handler'
import { Toaster } from '@components/ui/sonner';

export default function Providers({ children }: React.PropsWithChildren) {
  return (
    <ThemeProvider>
    <ErrorHandler>
      <AnalyticsProvider>
        <TRPCProvider>
          {children}
          <Toaster />
          {/* <ProgressBar /> */}
        </TRPCProvider>
      </AnalyticsProvider>
    </ErrorHandler>
    </ThemeProvider>
  )
}
