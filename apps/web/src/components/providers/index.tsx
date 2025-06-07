"use client";

import { ThemeProvider } from "next-themes";
import AnalyticsProvider from "./analytics-provider";
import { Toaster } from "@components/ui/sonner";
import { ReactQueryProvider } from "@/api/reactQuery";

export default function Providers({ children }: React.PropsWithChildren) {
  return (
    <ReactQueryProvider>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
        <AnalyticsProvider>
          {children}
          <Toaster />
        </AnalyticsProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  );
}
