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
  MapPin,
  CirclePlus,
  Bell,
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
import { Input } from "./ui/input";
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
      icon: MapPin,
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
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter navigation items based on search query
  const filteredNavItems = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return data.navMain;
    }

    return data.navMain.filter((item) => {
      // Check if main item title matches
      const titleMatch = item.title.toLowerCase().includes(searchQuery.toLowerCase());

      // Check if any sub-items match
      const subItemsMatch = item.items?.some((subItem) =>
        subItem.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

      return titleMatch || subItemsMatch;
    });
  }, [searchQuery]);

  return (
    <Sidebar className='w-56 border-r border-gray-800 bg-[#192d43]' {...props}>
      <div className='flex h-full flex-col'>
        <div className='flex-1'>
        <SidebarHeader className='flex items-center justify-center border-b border-gray-100 bg-white py-4'>
            <Image
              src='/images/brand/servicegeek-no-bg.png'
              alt='logo'
              width={180}
              height={40}
              className='h-12 w-auto'
            />
            
            {/* <div className="flex items-center gap-2">
              <CirclePlus size={30} />
              <Bell size={30} />
              <NavUser withAvatar={false} />
            </div> */}

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
            <Input
              placeholder='Search'
              className='bg-muted mt-2 border text-foreground'
              style={{
                border: "1px solid rgba(255, 255, 255, .22)",
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <NavMain items={filteredNavItems} />
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
