import '@/styles/tailwind.css'

import { Metadata, Viewport } from "next";
import clsx from "clsx";
import Providers from '@components/providers';

export const metadata: Metadata = {
  title: {
    default: "ServiceGeek",
    template: "ServiceGeek - %s",
  },
  keywords: [
    "servicegeek",
    "restorationx",
    "restoration",
    "servicegeek.app",
    "service geek",
  ],
  description: "Hono x Lucia",
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  userScalable: false
}

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang='en' dir='ltr' suppressHydrationWarning>
      <body
        className={clsx(
          "h-screen bg-gray-50",
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
