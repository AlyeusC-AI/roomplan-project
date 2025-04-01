"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs";

import CreateNewInvoice from "./new";

import { useDebouncedCallback } from "use-debounce";
import { userInfoStore } from "@atoms/user-info";
import { invoicesStore } from "@atoms/invoices";
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
import { fetchInvoices } from "@/lib/invoices";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function InvoiceList() {
  const { totalInvoices, setInvoices } = invoicesStore((state) => state);
  const { user } = userInfoStore((state) => state);
  const [isCreatingNewInvoice, setIsCreatingNewInvoice] = useState(false);
  const [loading, setLoading] = useState(true);
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Fetch invoices from the API
    const status = search.get("status") || undefined;
    const fetchData = async () => {
      setLoading(true);

      try {
        const result = await fetchInvoices(status);

        setInvoices(result, result.length);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        toast.error("Failed to load invoices. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [search.get("query"), search.get("page"), search.get("status")]);

  const handleSearch = useDebouncedCallback((term) => {
    console.log(`Searching... ${term}`);
    const params = new URLSearchParams(search);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  const page = parseInt(search.get("page") || "1");

  // Add a function to handle invoice row clicks
  const handleViewInvoice = (invoiceId: string) => {
    router.push(`/invoices/${invoiceId}`);
  };

  return (
    <>
      <div
        className={cn(
          "fixed z-10 bg-background lg:pr-10",
          "lg:w-[calc(100vw-var(--sidebar-width))]"
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
            <Button onClick={() => setIsCreatingNewInvoice((i) => !i)}>
              New Invoice
            </Button>
          </div>
        </div>
        <div className='mt-5 flex justify-between'>
          <Input
            placeholder='Search invoices...'
            onChange={(e) => handleSearch(e.target.value)}
            className='w-full lg:max-w-96'
            defaultValue={search.get("query") ?? ""}
          />
          <Tabs
            defaultValue={user?.savedDashboardView || "listView"}
            className='hidden lg:block'
          >
            <TabsList>
              <TabsTrigger value={"listView"}>List View</TabsTrigger>
              <TabsTrigger value={"boardView"}>Board View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className='mt-40'>
        {loading ? (
          <LoadingPlaceholder />
        ) : (
          <div className='flex flex-col justify-start'>
            <Card>
              <Table onRowClick={handleViewInvoice} />
            </Card>
            <Pagination className='mt-5'>
              <PaginationContent>
                <PaginationItem>
                  {page !== 1 && (
                    <PaginationPrevious href={`/invoices?page=${page - 1}`} />
                  )}
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink isActive>{page}</PaginationLink>
                </PaginationItem>
                {totalInvoices > 10 * page && (
                  <PaginationItem>
                    <PaginationLink
                      href={`/invoices?page=${page + 1}`}
                      isActive
                    >
                      {page + 1}
                    </PaginationLink>
                  </PaginationItem>
                )}
                {totalInvoices > 10 * page && (
                  <PaginationItem>
                    <PaginationNext href={`/invoices?page=${page + 1}`} />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
      <CreateNewInvoice
        open={isCreatingNewInvoice}
        setOpen={setIsCreatingNewInvoice}
      />
    </>
  );
}

export const Table = ({
  onRowClick,
}: {
  onRowClick?: (invoiceId: string) => void;
}) => {
  const { invoices } = invoicesStore((state) => state);

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
              <span>{row.original.projectName}</span>
              <ChevronRightIcon size={12} />
              <span>{row.original.clientName}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Amount' />
      ),
      cell: ({ row }) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(row.original.amount),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Created Date' />
      ),
      cell: ({ row }) =>
        new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
        }).format(new Date(row.original.createdAt ?? new Date())),
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Due Date' />
      ),
      cell: ({ row }) =>
        new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
        }).format(new Date(row.original.dueDate ?? new Date())),
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
                getStatusColor(invoice.status)
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
                  onClick={() =>
                    invoicesStore
                      .getState()
                      .handleUpdateStatus(invoice.publicId, "draft")
                  }
                  disabled={invoice.status === "draft"}
                >
                  Mark as Draft
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    invoicesStore
                      .getState()
                      .handleUpdateStatus(invoice.publicId, "sent")
                  }
                  disabled={invoice.status === "sent"}
                >
                  <Send className='mr-2 size-4' />
                  Mark as Sent
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    invoicesStore
                      .getState()
                      .handleUpdateStatus(invoice.publicId, "paid")
                  }
                  disabled={invoice.status === "paid"}
                >
                  <CheckCircle className='mr-2 size-4' />
                  Mark as Paid
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    invoicesStore
                      .getState()
                      .handleUpdateStatus(invoice.publicId, "overdue")
                  }
                  disabled={invoice.status === "overdue"}
                >
                  <AlertTriangle className='mr-2 size-4' />
                  Mark as Overdue
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    invoicesStore
                      .getState()
                      .handleUpdateStatus(invoice.publicId, "cancelled")
                  }
                  disabled={invoice.status === "cancelled"}
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
                onRowClick && onRowClick(invoice.publicId);
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
    <TableProvider columns={columns} data={invoices}>
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
            onClick={() => onRowClick && onRowClick(row.original.publicId)}
          >
            {({ cell }) => <TableCell key={cell.id} cell={cell} />}
          </TableRow>
        )}
      </TableBody>
    </TableProvider>
  );
};
