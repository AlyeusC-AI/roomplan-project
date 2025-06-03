import "@/styles/tailwind.css";

import { Metadata, Viewport } from "next";
import clsx from "clsx";
import Providers from "@components/providers";
import { Suspense } from "react";
import AuthRedirect from "@/components/auth-redirect";

export const metadata: Metadata = {
  title: {
    default: "RestoreGeek",
    template: "RestoreGeek - %s",
  },
  keywords: [
    "servicegeek",
    "restorationx",
    "restoration",
    "restoregeek.app",
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
  userScalable: false,
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <html lang='en' dir='ltr' suppressHydrationWarning>
        <body className={clsx("h-screen bg-background")}>
          <Providers>
            <AuthRedirect>{children}</AuthRedirect>
          </Providers>
        </body>
      </html>
    </Suspense>
  );
}
