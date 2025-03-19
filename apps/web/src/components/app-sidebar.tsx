"use client";

import * as React from "react";
import {
  AudioWaveform,
  CalendarDays,
  ChartLine,
  ChevronLeft,
  ChevronRight,
  Command,
  FileUser,
  FolderKanban,
  GalleryVerticalEnd,
  Map,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";

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
      icon: FolderKanban,
    },
    {
      title: "Map",
      url: "/map",
      icon: Map,
    },
    {
      title: "Calendar",
      url: "/calendar",
      icon: CalendarDays,
    },
    {
      title: "Performance",
      url: "/performance",
      icon: ChartLine,
    },
    {
      title: "Invoices",
      url: "/invoices",
      icon: FileUser,
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
          title: "Organization",
          url: "/settings/organization",
        },
        {
          title: "Forms",
          url: "/forms",
        },
        {
          title: "Billing",
          url: "/settings/billing",
        },
        {
          title: "Appearance",
          url: "/settings/appearance",
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
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar, state } = useSidebar();
  return (
    <Sidebar
      collapsible='icon'
      variant='floating'
      className='h-screen'
      {...props}
    >
      <SidebarHeader className='flex items-center'>
        <div
          className={`flex ${state === "collapsed" ? "flex-col" : "items-center gap-2"}`}
        >
          <Image
            src={
              state === "collapsed"
                ? "/images/brand/servicegeek-no-bg-icon.png"
                : "/images/brand/servicegeek-no-bg.png"
            }
            alt='logo'
            className='my-4'
            width={state === "collapsed" ? 40 : 140}
            height={state === "collapsed" ? 40 : 30}
          />
          <button
            onClick={toggleSidebar}
            className='mt-3 rounded-lg p-2 transition-colors duration-200 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800'
            title={
              state === "collapsed" ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {state === "collapsed" ? (
              <PanelLeftOpen className='h-5 w-5 text-gray-600 dark:text-gray-400' />
            ) : (
              <PanelLeftClose className='h-5 w-5 text-gray-600 dark:text-gray-400' />
            )}
          </button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
