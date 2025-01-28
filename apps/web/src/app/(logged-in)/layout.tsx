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

export default function Layout({ children }: React.PropsWithChildren) {
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
  const { open } = useSidebar();
  return (
    <header
      className={cn(
        "fixed z-20 flex h-16 w-full shrink-0 items-center gap-2 bg-background pr-[16rem] transition-[width,height] ease-linear",
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
