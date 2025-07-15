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
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SubscriptionAlert } from "@/components/subscription-alert";

export default function Layout({ children }: React.PropsWithChildren) {
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   client.auth
  //     .getUser()
  //     .then(async ({ data: { user }, error }) => {
  //       if (pathname.includes("acceptInvite")) {
  //         return;
  //       }
  //       if (error || !user) {
  //         router.replace("/login");
  //         return;
  //       } else if (
  //         user.user_metadata.inviteId &&
  //         !user.user_metadata.acceptedInvite
  //       ) {
  //         router.replace("/acceptInvite?token=" + user.user_metadata.inviteId);
  //       } else if (user.email_confirmed_at === null) {
  //         router.replace("/register?page=2");
  //       } else if (!user.user_metadata.organizationId) {
  //         router.replace("/register?page=3");
  //       } else {
  //         setOrganization().then((org) => {
  //           if (
  //             !org.subscriptionPlan &&
  //             !search.has("from_checkout") &&
  //             org.subscriptionPlan !== "early_bird"
  //           ) {
  //             router.replace("/register?page=4");
  //           } else if (search.has("from_checkout")) {
  //             const plan = search.get("plan");
  //             fetch("/api/check-session", {
  //               method: "POST",
  //               headers: {
  //                 "Content-Type": "application/json",
  //               },
  //               body: JSON.stringify({
  //                 sessionId: search.get("session_id"),
  //                 plan: plan?.toLowerCase(),
  //               }),
  //             })
  //               .then((res) => res.json())
  //               .then((data) => {
  //                 setOrganizationLocal(data.org);
  //               });
  //           }
  //         });
  //       }
  //     })
  //     .finally(() => {
  //       setTimeout(() => {
  //         setLoading(false);
  //       }, 2000);
  //     });
  // }, []);

  if (loading) {
    return (
      <div className='flex h-screen w-screen items-center justify-center'>
        <Loader2 className='h-10 w-10 animate-spin' />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        {/* <SidebarHeader /> */}
        <div className='flex flex-1 flex-col gap-4 p-2 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 pt-0'>
          {children}
        </div>
      </SidebarInset>
      {/* <SubscriptionAlert /> */}
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
