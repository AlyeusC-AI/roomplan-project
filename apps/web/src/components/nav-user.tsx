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
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingPlaceholder } from "./ui/spinner";
import { useCurrentUser, useLogout } from "@service-geek/api-client";

export function NavUser() {
  const navigate = useRouter();

  const { data: user, isLoading } = useCurrentUser();
  const { mutate: logout } = useLogout();

  useEffect(() => {
    console.log("FETCHING USER FROM SIDEBAR");
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
                    className='data-[state=open]:bg-gray-800 data-[state=open]:text-gray-200'
                  >
                    <Avatar className='size-8 rounded-lg'>
                      <AvatarImage
                        src={user?.avatar || ""}
                        alt={`${user?.firstName} ${user?.lastName}`}
                      />
                      <AvatarFallback className='rounded-lg bg-gray-700 text-gray-200'>
                        {`${user.firstName} ${user.lastName}`
                          .split(" ")
                          .map((word) => word[0]?.toUpperCase())
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className='grid flex-1 text-left text-sm leading-tight'>
                      <span className='truncate font-semibold text-gray-200'>
                        {user.firstName} {user.lastName}
                      </span>
                      <span className='truncate text-xs text-gray-400'>
                        {user.email}
                      </span>
                    </div>
                    <ChevronsUpDown
                      size={16}
                      className='ml-auto text-gray-400'
                    />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg border-gray-700 bg-gray-800'
                  side='right'
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
                        <AvatarFallback className='rounded-lg bg-gray-700 text-gray-200'>
                          {`${user.firstName} ${user.lastName}`
                            .split(" ")
                            .map((word) => word[0]?.toUpperCase())
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className='grid flex-1 text-left text-sm leading-tight'>
                        <span className='truncate font-semibold text-gray-200'>
                          {user.firstName} {user.lastName}
                        </span>
                        <span className='truncate text-xs text-gray-400'>
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className='bg-gray-700' />

                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => navigate.push("/settings/account")}
                      className='text-gray-200 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white'
                    >
                      <BadgeCheck size={16} />
                      Account
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate.push("/settings/billing")}
                      className='text-gray-200 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white'
                    >
                      <CreditCard size={16} />
                      Billing
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className='bg-gray-700' />
                  <DropdownMenuItem className='text-gray-200 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white'>
                    <DialogTrigger asChild>
                      <div className='flex items-center gap-2'>
                        <LogOut size={16} />
                        Log out
                      </div>
                    </DialogTrigger>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DialogContent className='border-gray-700 bg-gray-800'>
                <DialogHeader>
                  <DialogTitle className='text-gray-200'>
                    Are you sure?
                  </DialogTitle>
                  <DialogDescription className='text-gray-400'>
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
