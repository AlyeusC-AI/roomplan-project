"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@lib/utils";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface SidebarItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

export function NavMain({ items }: { items: SidebarItem[] }) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const pathname = usePathname();

  const handleOpenChange = (itemTitle: string, isOpen: boolean) => {
    setOpenItems((prev) => ({
      ...prev,
      [itemTitle]: isOpen,
    }));
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive || pathname.includes(item.url)}
            onOpenChange={(isOpen) => handleOpenChange(item.title, isOpen)}
            open={openItems[item.title] || pathname.includes(item.url)}
            className='group/collapsible'
          >
            <SidebarMenuItem>
              {item.items ? (
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    isActive={
                      openItems[item.title] || pathname.includes(item.url)
                    }
                  >
                    {item.icon && <item.icon size={16} />}
                    <span>{item.title}</span>
                    <ChevronRight
                      size={16}
                      className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90'
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              ) : (
                <Link href={item.url}>
                  <SidebarMenuButton isActive={pathname === item.url}>
                    {item.icon && <item.icon size={16} />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              )}

              <CollapsibleContent>
                {item.items?.map((subItem) => (
                  <SidebarMenuSub
                    key={subItem.url}
                    isActive={pathname.includes(subItem.url)}
                  >
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <Link href={subItem.url}>
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                ))}
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
