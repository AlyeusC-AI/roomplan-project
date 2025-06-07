"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { createClient } from "@lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingPlaceholder } from "./ui/spinner";
import { useCurrentUser, useLogout } from "@service-geek/api-client";

export function NavUser() {
  const { isMobile } = useSidebar();
  const client = createClient();
  const navigate = useRouter();

  const { data: user, isLoading } = useCurrentUser();
  const { mutate: logout } = useLogout();

  // const logout = () => {
  //   client.auth.signOut();
  //   navigate.push("/login");
  // };

  useEffect(() => {
    console.log("FETCHING USER FROM SIDEBAR");
    // fetch("/api/v1/user")
    //   .then((res) => res.json())
    //   .then((data) => {
    //     console.log("FETCHED USER FROM SIDEBAR");
    //     console.log(data);
    //     setUser(data);
    //   });
  }, []);

  return (
    <>
      {user ? (
        <SidebarMenu>
          <SidebarMenuItem>
            <Dialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size='lg'
                    className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                  >
                    <Avatar className='size-8 rounded-lg'>
                      <AvatarImage
                        src={user?.avatar || ""}
                        alt={`${user?.firstName} ${user?.lastName}`}
                      />
                      <AvatarFallback className='rounded-lg'>
                        {`${user.firstName} ${user.lastName}`
                          .split(" ")
                          .map((word) => word[0]?.toUpperCase())
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className='grid flex-1 text-left text-sm leading-tight'>
                      <span className='truncate font-semibold'>
                        {user.firstName} {user.lastName}
                      </span>
                      <span className='truncate text-xs'>{user.email}</span>
                    </div>
                    <ChevronsUpDown size={16} className='ml-auto' />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
                  side={isMobile ? "bottom" : "right"}
                  align='end'
                  sideOffset={4}
                >
                  <DropdownMenuLabel className='p-0 font-normal'>
                    <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                      <Avatar className='size-8 rounded-lg'>
                        <AvatarImage
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-pictures/${user.id}/avatar.png`}
                          alt={`${user.firstName} ${user.lastName}`}
                        />
                        <AvatarFallback className='rounded-lg'>
                          {`${user.firstName} ${user.lastName}`
                            .split(" ")
                            .map((word) => word[0]?.toUpperCase())
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className='grid flex-1 text-left text-sm leading-tight'>
                        <span className='truncate font-semibold'>
                          {user.firstName} {user.lastName}
                        </span>
                        <span className='truncate text-xs'>{user.email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => navigate.push("/settings/account")}
                    >
                      <BadgeCheck size={16} />
                      Account
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CreditCard
                        size={16}
                        onClick={() => navigate.push("/settings/billing")}
                      />
                      Billing
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem>
                      <Bell size={16} />
                      Notifications
                    </DropdownMenuItem> */}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <DialogTrigger asChild>
                      <div className='flex items-center gap-2'>
                        <LogOut size={16} />
                        Log out
                      </div>
                    </DialogTrigger>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to log out of your account?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant='destructive' onClick={() => logout()}>
                    Log out
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </SidebarMenuItem>
        </SidebarMenu>
      ) : (
        <LoadingPlaceholder className='w-56' />
      )}
    </>
  );
}
