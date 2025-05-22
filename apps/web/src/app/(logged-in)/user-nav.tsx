"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingSpinner } from "@components/ui/spinner";
import { useCurrentUser } from "@service-geek/api-client";
export function UserNav() {
  // const { user } = userInfoStore((state) => state);
  const { data: user } = useCurrentUser();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative size-8 rounded-full'>
          {user ? (
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
          ) : (
            <LoadingSpinner />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          {user && (
            <div className='flex flex-col space-y-1'>
              <p className='text-sm font-medium leading-none'>{`${user.firstName} ${user.lastName}`}</p>
              <p className='text-xs leading-none text-muted-foreground'>
                {user.email}
              </p>
            </div>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>New Team</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
