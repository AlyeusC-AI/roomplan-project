"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import NextBreadcrumb from "./breadcrumb";
import { Search } from "./performance/components/search";
import { UserNav } from "./user-nav";
import { cn } from "@lib/utils";
import { createClient } from "@lib/supabase/client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { orgStore } from "@atoms/organization";

export default function Layout({ children }: React.PropsWithChildren) {
  const { setOrganization, setOrganizationLocal } = orgStore((state) => state);
  const client = createClient();
  const search = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    client.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        router.replace("/login");
        return;
      } else if (user.email_confirmed_at === null) {
        router.replace("/register?page=2");
      } else if (!user.user_metadata.organizationId) {
        router.replace("/register?page=3");
      } else {
        setOrganization().then((org) => {
          if (
            !org.subscriptionPlan &&
            !search.has("from_checkout") &&
            org.subscriptionPlan !== "early_bird"
          ) {
            router.replace("/register?page=4");
          } else if (search.has("from_checkout")) {
            const plan = search.get("plan");
            fetch("/api/check-session", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                sessionId: search.get("session_id"),
                plan: plan?.toLowerCase(),
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                setOrganizationLocal(data.org);
              });
          }
        });
      }
    });
  }, []);

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <SidebarHeader />
        <div className='mt-16 flex flex-1 flex-col gap-4 p-4 pt-0'>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function SidebarHeader() {
  const { open, isMobile } = useSidebar();
  return (
    <header
      className={cn(
        "fixed z-20 flex h-16 w-full shrink-0 items-center gap-2 bg-background transition-[width,height] ease-linear",
        !isMobile && "pr-[16rem]",
        !open && "pr-[3rem] transition-all"
      )}
    >
      <div className='mx-4 flex w-full items-center gap-2 border-b p-2 px-4'>
        <SidebarTrigger className='-ml-3' />
        <Separator orientation='vertical' className='mr-2 h-4' />
        <NextBreadcrumb />
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
