import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import NextBreadcrumb from "./breadcrumb"
import { Search } from "./performance/components/search"
import { UserNav } from "./user-nav"

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <SidebarProvider >
      <AppSidebar collapsible="none" />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex w-full border-b mx-4 p-2 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-3" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <NextBreadcrumb />
            <div className="ml-auto flex items-center space-x-4">
              <Search />
              <UserNav />
            </div>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
