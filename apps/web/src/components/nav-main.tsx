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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSidebar } from "@/components/ui/sidebar";

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
  const { state } = useSidebar();

  const handleOpenChange = (itemTitle: string, isOpen: boolean) => {
    setOpenItems(prev => ({
      ...prev,
      [itemTitle]: isOpen
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
                state === "collapsed" ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <SidebarMenuButton
                        isActive={openItems[item.title] || pathname.includes(item.url)}
                        tooltip={item.title}
                      >
                        {item.icon && <item.icon size={16} />}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </PopoverTrigger>
                    <PopoverContent
                      side="right"
                      align="start"
                      className="w-56 p-0"
                    >
                      <div className="flex flex-col gap-1 p-2">
                        {item.items.map((subItem) => (
                          <Link
                            key={subItem.url}
                            href={subItem.url}
                            className={cn(
                              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
                              pathname === subItem.url && "bg-accent text-accent-foreground"
                            )}
                          >
                            <span>{subItem.title}</span>
                          </Link>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      isActive={openItems[item.title] || pathname.includes(item.url)}
                      tooltip={item.title}
                    >
                      {item.icon && <item.icon size={16} />}
                      <span>{item.title}</span>
                      <ChevronRight
                        size={16}
                        className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90'
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                )
              ) : (
                <Link href={item.url}>
                  <div
                    data-active={pathname == item.url}
                    className={cn(
                      "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    {item.icon && <item.icon size={16} />}
                    <span>{item.title}</span>
                    {item.items && (
                      <ChevronRight
                        size={16}
                        className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90'
                      />
                    )}
                  </div>
                </Link>
              )}
              {state !== "collapsed" && (
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
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
