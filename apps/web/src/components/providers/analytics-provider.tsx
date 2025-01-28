"use client";

import { GoogleAnalytics } from "nextjs-google-analytics";
import { Analytics } from "@vercel/analytics/react";
import { init } from "@amplitude/analytics-browser";
import { useEffect } from "react";

export default function AnalyticsProvider({
  children,
}: React.PropsWithChildren) {
  useEffect(() => {
    init(process.env.AMPLITUDE_API_KEY!);
  }, []);

  return (
    <>
      {children}
      <Analytics />
      <GoogleAnalytics trackPageViews />
    </>
  );
}
