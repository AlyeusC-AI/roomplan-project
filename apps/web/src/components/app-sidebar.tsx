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
  Receipt,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { SidebarSubscriptionStatus } from "./sidebar-subscription-status";
// import { OrganizationSelector } from "./organization-selector";

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
          title: "Tags",
          url: "/settings/tags",
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
  return (
    <Sidebar className='w-56 border-r border-gray-800 bg-[#192d43]' {...props}>
      <div className='flex h-full flex-col'>
        <div className='flex-1'>
          <SidebarHeader className='flex items-center justify-center border-b border-gray-100 bg-gray-200 py-4'>
            <Image
              src='/images/brand/servicegeek-no-bg.png'
              alt='logo'
              width={180}
              height={40}
              className='h-12 w-auto'
            />
          </SidebarHeader>

          {/* {state === "expanded" && (
            <div className='px-4 py-2'>
              <OrganizationSelector
                showLabel={false}
                buttonClassName='w-full'
                dropdownClassName='w-56'
              />
            </div>
          )} */}

          <SidebarContent className='px-3'>
            <NavMain items={data.navMain} />
          </SidebarContent>
        </div>

        <SidebarSubscriptionStatus />

        <SidebarFooter className='border-t border-gray-700 bg-[#192d43]/50 px-3 pb-4'>
          <NavUser />
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
