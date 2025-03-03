"use client";

import { ThemeProvider } from "next-themes";
import AnalyticsProvider from "./analytics-provider";
import { Toaster } from "@components/ui/sonner";

export default function Providers({ children }: React.PropsWithChildren) {
  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <AnalyticsProvider>
        {children}
        <Toaster />
      </AnalyticsProvider>
    </ThemeProvider>
  );
}
