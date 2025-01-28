"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Database } from "@types/database";
import { projectStore } from "@atoms/project";

type Status = Database["public"]["Tables"]["ProjectStatusValue"]["Row"];

export function StatusPicker() {
  const { project } = projectStore((state) => state);
  const [open, setOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<Status | null>(
    null
  );

  const [statuses, setStatuses] = React.useState<Status[]>([]);

  React.useEffect(() => {
    fetch("/api/v1/organization/status")
      .then((res) => res.json())
      .then((data: { data: Status[] }) => {
        setStatuses(data.data);
        setSelectedStatus(
          data.data.find((status) => status.publicId === project.status) ||
            null
        );
      });
  }, []);

  return (
    <div className='flex items-center space-x-4'>
      <p className='text-sm text-muted-foreground'>Status</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            className='w-[150px] justify-start'
          >
            {selectedStatus ? <>{selectedStatus.label}</> : <>+ Set status</>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='p-0' side='right' align='start'>
          <Command>
            <CommandInput placeholder='Change status...' />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {statuses.map((status) => (
                  <CommandItem
                    key={status.publicId}
                    value={status.publicId}
                    onSelect={(value) => {
                      setSelectedStatus(
                        statuses.find(
                          (priority) => priority.publicId === value
                        ) || null
                      );
                      setOpen(false);
                    }}
                  >
                    <span>{status.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
