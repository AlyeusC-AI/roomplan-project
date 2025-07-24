"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  ChevronRightIcon,
  CheckCircle,
  Send,
  AlertTriangle,
  Ban,
  Ellipsis,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@components/ui/badge";
import { LoadingPlaceholder } from "@components/ui/spinner";
import { Input } from "@components/ui/input";
import { cn } from "@lib/utils";
import { toast } from "sonner";
import {
  useGetInvoices,
  useUpdateInvoiceStatus,
} from "@service-geek/api-client";
import { Invoice } from "@service-geek/api-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function InvoiceList() {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const page = parseInt(search.get("page") || "1");
  const searchQuery = search.get("query") || undefined;

  const { data, isLoading } = useGetInvoices(page, 10, searchQuery);
  const updateStatus = useUpdateInvoiceStatus();

  const handleSearch = useDebouncedCallback((term) => {
    const params = new URLSearchParams(search);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    params.set("page", "1"); // Reset to first page on search
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  const totalPages = data?.total ? Math.ceil(data.total / 10) : 0;

  // Add a function to handle invoice row clicks
  const handleViewInvoice = (invoiceId: string) => {
    router.push(`/invoices/${invoiceId}`);
  };

  const handleUpdateStatus = async (
    invoiceId: string,
    status: Invoice["status"]
  ) => {
    try {
      await updateStatus.mutateAsync({ id: invoiceId, status: status });
      toast.success("Invoice status updated successfully");
    } catch (error) {
      console.error("Error updating invoice status:", error);
      toast.error("Failed to update invoice status");
    }
  };

  return (
    <>
      <div
        className={cn(
          "z-10 lg:pr-6",
          "md:w-[calc(100vw-var(--sidebar-width)-48px)]"
        )}
      >
        <div className='mt-3 flex w-full justify-between space-x-6'>
          <div className='z-10 w-11/12 space-y-0.5'>
            <h2 className='mt-4 text-2xl font-bold tracking-tight'>Invoices</h2>
            <p className='hidden text-muted-foreground lg:block'>
              Manage your invoices and billing information.
            </p>
          </div>
          <div className='ml-auto flex min-w-[100px] flex-col space-y-4'>
            <Button onClick={() => router.push("/invoices/new")}>
              New Invoice
            </Button>
          </div>
        </div>
        <div className='mt-5 flex justify-between'>
          <Input
            placeholder='Search invoices...'
            onChange={(e) => handleSearch(e.target.value)}
            className='w-full lg:max-w-96'
            defaultValue={searchQuery ?? ""}
          />
          {/* <Tabs defaultValue='listView' className='hidden lg:block'>
            <TabsList>
              <TabsTrigger value='listView'>List View</TabsTrigger>
              <TabsTrigger value='boardView'>Board View</TabsTrigger>
            </TabsList>
          </Tabs> */}
        </div>
      </div>

      <div className='mt-10'>
        {isLoading ? (
          <LoadingPlaceholder />
        ) : (
          <div className='flex flex-col justify-start'>
            <Card>
              <Table
                data={data?.data || []}
                onRowClick={handleViewInvoice}
                onStatusUpdate={handleUpdateStatus}
              />
            </Card>
            <Pagination className='mt-5'>
              <PaginationContent>
                <PaginationItem>
                  {page > 1 && (
                    <PaginationPrevious href={`/invoices?page=${page - 1}`} />
                  )}
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href={`/invoices?page=${pageNum}`}
                        isActive={pageNum === page}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                {page < totalPages && (
                  <PaginationItem>
                    <PaginationNext href={`/invoices?page=${page + 1}`} />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </>
  );
}

export const Table = ({
  data,
  onRowClick,
  onStatusUpdate,
}: {
  data: Invoice[];
  onRowClick?: (invoiceId: string) => void;
  onStatusUpdate?: (invoiceId: string, status: Invoice["status"]) => void;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-200 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "";
    }
  };

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "number",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Invoice #' />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <div>
            <span className='font-medium'>{row.original.number}</span>
            <div className='hidden items-center gap-1 text-xs text-muted-foreground lg:flex'>
              <span>{row.original.project?.name}</span>
              <ChevronRightIcon size={12} />
              <span>{row.original.clientName}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Amount' />
      ),
      cell: ({ row }) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(row.original.total),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Created Date' />
      ),
      cell: ({ row }) =>
        new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
        }).format(new Date(row.original.createdAt)),
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Due Date' />
      ),
      cell: ({ row }) =>
        new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
        }).format(new Date(row.original.dueDate)),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <div className='flex items-center'>
            <Badge
              variant='outline'
              className={cn(
                "px-2 py-1 text-xs",
                getStatusColor(invoice.status.toLowerCase())
              )}
            >
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' className='ml-2 size-8'>
                  <Ellipsis className='size-4' />
                  <span className='sr-only'>Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem
                  onClick={() => onStatusUpdate?.(invoice.id, "DRAFT")}
                  disabled={invoice.status === "DRAFT"}
                >
                  Mark as Draft
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onStatusUpdate?.(invoice.id, "SENT")}
                  disabled={invoice.status === "SENT"}
                >
                  <Send className='mr-2 size-4' />
                  Mark as Sent
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onStatusUpdate?.(invoice.id, "PAID")}
                  disabled={invoice.status === "PAID"}
                >
                  <CheckCircle className='mr-2 size-4' />
                  Mark as Paid
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onStatusUpdate?.(invoice.id, "OVERDUE")}
                  disabled={invoice.status === "OVERDUE"}
                >
                  <AlertTriangle className='mr-2 size-4' />
                  Mark as Overdue
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onStatusUpdate?.(invoice.id, "CANCELLED")}
                  disabled={invoice.status === "CANCELLED"}
                >
                  <Ban className='mr-2 size-4' />
                  Mark as Cancelled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: ({ column }) => <TableColumnHeader column={column} title='' />,
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <div className='text-right'>
            <Button
              variant='ghost'
              size='icon'
              onClick={(e) => {
                e.stopPropagation(); // Prevent row click
                onRowClick && onRowClick(invoice.id);
              }}
            >
              <ChevronRightIcon className='size-4' />
              <span className='sr-only'>View details</span>
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <TableProvider columns={columns} data={data}>
      <TableHeader>
        {({ headerGroup }) => (
          <TableHeaderGroup key={headerGroup.id} headerGroup={headerGroup}>
            {({ header }) => <TableHead key={header.id} header={header} />}
          </TableHeaderGroup>
        )}
      </TableHeader>
      <TableBody>
        {({ row }) => (
          <TableRow
            key={row.id}
            row={row}
            className='cursor-pointer hover:bg-muted'
          >
            {({ cell }) => (
              <TableCell
                key={cell.id}
                cell={cell}
                onClick={() =>
                  onRowClick && onRowClick((row.original as Invoice).id)
                }
              />
            )}
          </TableRow>
        )}
      </TableBody>
    </TableProvider>
  );
};
