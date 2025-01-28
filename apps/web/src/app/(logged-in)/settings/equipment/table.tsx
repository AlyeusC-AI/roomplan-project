"use client";

import {
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableHeader,
  TableHeaderGroup,
  TableProvider,
  TableRow,
} from "@/components/roadmap-ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import {
  addMonths,
  endOfMonth,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import tailwindConfig from "../../../../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";

const tailwind = resolveConfig(tailwindConfig);

export default tailwind;

const today = new Date();

export const exampleStatuses = [
  { id: "1", name: "Planned", color: tailwind.theme.colors.gray[500] },
  { id: "2", name: "In Progress", color: tailwind.theme.colors.amber[500] },
  { id: "3", name: "Done", color: tailwind.theme.colors.emerald[500] },
];

export const exampleFeatures = [
  {
    id: "1",
    name: "AI Scene Analysis",
    startAt: startOfMonth(subMonths(today, 6)),
    endAt: subDays(endOfMonth(today), 5),
    status: exampleStatuses[0],
    group: { id: "1", name: "Core AI Features" },
    product: { id: "1", name: "Video Editor Pro" },
    owner: {
      id: "1",
      image: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=1",
      name: "Alice Johnson",
    },
    initiative: { id: "1", name: "AI Integration" },
    release: { id: "1", name: "v1.0" },
  },
];

export const Table = () => {
  const columns: ColumnDef<(typeof exampleFeatures)[number]>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Name' />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <div className='relative'>
            <Image
              src={row.original.owner.image}
              alt={row.original.owner.name}
              width={24}
              height={24}
              unoptimized
              className='size-6 rounded-full'
            />
            <div
              className='absolute bottom-0 right-0 size-2 rounded-full ring-2 ring-background'
              style={{
                backgroundColor: row.original.status.color,
              }}
            />
          </div>
          <div>
            <span className='font-medium'>{row.original.name}</span>
            <div className='flex items-center gap-1 text-xs text-muted-foreground'>
              <span>{row.original.product.name}</span>
              <ChevronRightIcon size={12} />
              <span>{row.original.group.name}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "startAt",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Start At' />
      ),
      cell: ({ row }) =>
        new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
        }).format(row.original.startAt),
    },
    {
      accessorKey: "endAt",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='End At' />
      ),
      cell: ({ row }) =>
        new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
        }).format(row.original.endAt),
    },
    {
      id: "release",
      accessorFn: (row) => row.release.id,
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Release' />
      ),
      cell: ({ row }) => row.original.release.name,
    },
  ];

  return (
    <TableProvider columns={columns} data={exampleFeatures}>
      <TableHeader>
        {({ headerGroup }) => (
          <TableHeaderGroup key={headerGroup.id} headerGroup={headerGroup}>
            {({ header }) => <TableHead key={header.id} header={header} />}
          </TableHeaderGroup>
        )}
      </TableHeader>
      <TableBody>
        {({ row }) => (
          <TableRow key={row.id} row={row}>
            {({ cell }) => <TableCell key={cell.id} cell={cell} />}
          </TableRow>
        )}
      </TableBody>
    </TableProvider>
  );
};
