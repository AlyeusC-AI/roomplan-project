"use client"

import * as React from "react"
import {
  AudioWaveform,
  CalendarDays,
  ChartLine,
  Command,
  FileUser,
  FolderKanban,
  GalleryVerticalEnd,
  Map,
  Settings,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import Image from "next/image"
import { url } from "inspector"

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Projects",
      url: "/projects",
      icon: FolderKanban
    },
    {
      title: "Map",
      url: "/map",
      icon: Map
    },
    {
      title: "Calendar",
      url: "/calendar",
      icon: CalendarDays
    },
    {
      title: "Performance",
      url: "/performance",
      icon: ChartLine
    },
    {
      title: "Invoices",
      url: "/invoices",
      icon: FileUser
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      items: [
        {
          title: "Account",
          url: "/settings/account",
        },
        {
          title: "Billing",
          url: "/settings/billing",
        },
        {
          title: "Workflows",
          url: "/settings/workflows",
        },
        {
          title: "Equipment",
          url: "/settings/equipment",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" className="h-screen" {...props}>
      <SidebarHeader className="items-center flex">
        {/* <TeamSwitcher teams={data.teams} /> */}
        <Image src="/images/brand/servicegeek-no-bg.png" alt="logo" className="my-4" width={140} height={30} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
