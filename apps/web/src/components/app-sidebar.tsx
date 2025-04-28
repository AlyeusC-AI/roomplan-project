"use client";

import * as React from "react";
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
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
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
import { SidebarSubscriptionStatus } from "./sidebar-subscription-status";

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
      title: "Estimates",
      url: "/estimates",
      icon: Receipt,
      items: [
        {
          title: "All Estimates",
          url: "/estimates",
        },
      ],
    },
    {
      title: "Invoices",
      url: "/invoices",
      icon: FileUser,
      items: [
        {
          title: "All Invoices",
          url: "/invoices",
        },
        {
          title: "Saved Line Items",
          url: "/invoices/saved-items",
        },
      ],
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
          title: "Documents",
          url: "/documents",
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
          url: "/settings/workflow",
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
      // variant='floating'
      className='overflow-y-auto border-r'
      {...props}
    >
      <div className='flex h-full flex-col'>
        <div className='flex-1'>
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
                  <PanelLeftOpen className='size-5 text-gray-600 dark:text-gray-400' />
                ) : (
                  <PanelLeftClose className='size-5 text-gray-600 dark:text-gray-400' />
                )}
              </button>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <NavMain items={data.navMain} />
          </SidebarContent>
        
          <SidebarRail />
       
        </div>
        <SidebarSubscriptionStatus />
        <SidebarFooter>
            <NavUser />
          </SidebarFooter>
      </div>
    </Sidebar>
  );
}
