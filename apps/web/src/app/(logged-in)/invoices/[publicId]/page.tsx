"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  fetchInvoiceById,
  deleteInvoice,
  emailInvoice,
} from "@/services/api/invoices";
import { invoicesStore } from "@/atoms/invoices";
import { Button } from "@/components/ui/button";
import { LoadingPlaceholder } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Printer,
  Download,
  Send,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Ban,
  Mail,
  Edit,
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Database } from "@/types/database";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@components/ui/dialog";
import { Textarea } from "@components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

declare global {
  type Invoice = Database["public"]["Tables"]["Invoices"]["Row"] & {
    InvoiceItems: InvoiceItem[];
  };
  type InvoiceItem = Database["public"]["Tables"]["InvoiceItems"]["Row"];
}

export default function InvoicePage() {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();
  const { handleUpdateStatus } = invoicesStore();
  const params = useParams<{ publicId: string }>();

  useEffect(() => {
    async function loadInvoice() {
      setLoading(true);
      try {
        const result = await fetchInvoiceById(params.publicId);

        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          setInvoice(result.data);
        } else {
          setError("Invoice not found");
        }
      } catch (err) {
        setError("Failed to load invoice details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadInvoice();
  }, [params.publicId]);

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    setIsDeleteDialogOpen(false);
    setIsDeleting(true);
    try {
      const result = await deleteInvoice(params.publicId);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Invoice deleted successfully");
        router.push("/invoices");
      }
    } catch (err) {
      toast.error("Failed to delete invoice");
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusUpdate = async (
    newStatus: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  ) => {
    await handleUpdateStatus(params.publicId, newStatus);
    if (invoice) {
      setInvoice({
        ...invoice,
        status: newStatus,
      });
    }
  };

  const printInvoice = () => {
    window.print();
  };

  const downloadAsPdf = async () => {
    setIsExporting(true);
    try {
      const invoiceElement = document.getElementById("invoice-container");
      if (!invoiceElement) {
        toast.error("Could not find invoice content to export");
        return;
      }

      // Hide the buttons during capture
      const buttonsContainer = document.getElementById("buttons-container");
      const originalDisplay = buttonsContainer
        ? buttonsContainer.style.display
        : "";
      if (buttonsContainer) {
        buttonsContainer.style.display = "none";
      }

      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // Restore buttons display
      if (buttonsContainer) {
        buttonsContainer.style.display = originalDisplay;
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Calculate scaling to fit content on page
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        imgWidth,
        imgHeight
      );
      pdf.save(`Invoice-${invoice?.number || params.publicId}.pdf`);

      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const openEmailDialog = () => {
    if (!invoice?.clientEmail) {
      toast.error("No client email address available");
      return;
    }
    setEmailMessage("");
    setIsEmailDialogOpen(true);
  };
  
  const emailInvoiceHandler = async () => {
    setIsEmailDialogOpen(false);
    setIsEmailing(true);
    try {
      const result = await emailInvoice(
        params.publicId as string,
        emailMessage || undefined
      );

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          result.data?.message || `Invoice emailed to ${invoice!.clientEmail}`
        );

        // If the status was draft, refresh the data to get updated status
        if (invoice!.status === "draft") {
          const updatedData = await fetchInvoiceById(params.publicId as string);
          if (updatedData.data) {
            setInvoice(updatedData.data);
          }
        }
      }
    } catch (error) {
      console.error("Error emailing invoice:", error);
      toast.error("Failed to email invoice");
    } finally {
      setIsEmailing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return <LoadingPlaceholder />;
  }

  if (error) {
    return (
      <div className='flex h-full flex-col items-center justify-center'>
        <p className='mb-4 text-red-500'>{error}</p>
        <Button onClick={() => router.push("/invoices")}>
          <ArrowLeft className='mr-2 size-4' />
          Back to Invoices
        </Button>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className='flex h-full flex-col items-center justify-center'>
        <p className='mb-4 text-gray-500'>Invoice not found</p>
        <Button onClick={() => router.push("/invoices")}>
          <ArrowLeft className='mr-2 size-4' />
          Back to Invoices
        </Button>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-6 print:py-0'>
      <div
        id='buttons-container'
        className='mb-6 flex items-center justify-between print:hidden'
      >
        <Button variant='outline' onClick={() => router.push("/invoices")}>
          <ArrowLeft className='mr-2 size-4' />
          Back to Invoices
        </Button>

        <div className='flex space-x-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline'>
                Status:
                <Badge
                  variant='outline'
                  className={cn("ml-2 text-xs", getStatusColor(invoice.status))}
                >
                  {invoice.status.charAt(0).toUpperCase() +
                    invoice.status.slice(1)}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => handleStatusUpdate("draft")}
                disabled={invoice.status === "draft"}
              >
                Mark as Draft
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusUpdate("sent")}
                disabled={invoice.status === "sent"}
              >
                <Send className='mr-2 size-4' />
                Mark as Sent
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusUpdate("paid")}
                disabled={invoice.status === "paid"}
              >
                <CheckCircle className='mr-2 size-4' />
                Mark as Paid
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusUpdate("overdue")}
                disabled={invoice.status === "overdue"}
              >
                <AlertTriangle className='mr-2 size-4' />
                Mark as Overdue
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusUpdate("cancelled")}
                disabled={invoice.status === "cancelled"}
              >
                <Ban className='mr-2 size-4' />
                Mark as Cancelled
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant='outline' onClick={printInvoice}>
            <Printer className='mr-2 size-4' />
            Print
          </Button>
          <Button
            variant='outline'
            onClick={downloadAsPdf}
            disabled={isExporting}
          >
            <Download className='mr-2 size-4' />
            {isExporting ? "Exporting..." : "Download PDF"}
          </Button>
          <Button
            variant='outline'
            onClick={openEmailDialog}
            disabled={isEmailing || !invoice.clientEmail}
          >
            <Mail className='mr-2 size-4' />
            {isEmailing ? "Sending..." : "Email to Client"}
          </Button>
          
          <Link href={`/invoices/${params.publicId}/edit`} passHref>
            <Button variant='outline'>
              <Edit className='mr-2 size-4' /> Edit
            </Button>
          </Link>
          
          <Button
            variant='destructive'
            onClick={handleDeleteClick}
            disabled={isDeleting}
          >
            <Trash2 className='mr-2 size-4' />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <Card
        id='invoice-container'
        className='print:border-none print:shadow-none'
      >
        <CardHeader>
          <div className='flex justify-between'>
            <div>
              <CardTitle className='text-2xl font-bold'>
                {invoice.number}
              </CardTitle>
              <CardDescription>
                Created on{" "}
                {formatDate(new Date(invoice.createdAt ?? new Date()))}
              </CardDescription>
            </div>
            <div className='text-right'>
              <p className='text-lg font-semibold'>Total Amount</p>
              <p className='text-2xl font-bold'>
                {formatCurrency(invoice.amount)}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className='mb-8 grid grid-cols-2 gap-8'>
            <div>
              <h3 className='mb-2 font-semibold'>Bill To:</h3>
              <p className='font-medium'>{invoice.clientName}</p>
              {invoice.clientEmail && <p>{invoice.clientEmail}</p>}
            </div>
            <div>
              <h3 className='mb-2 font-semibold'>Details:</h3>
              <div className='flex justify-between'>
                <p>Invoice Number:</p>
                <p className='font-medium'>{invoice.number}</p>
              </div>
              <div className='flex justify-between'>
                <p>Project:</p>
                <p className='font-medium'>{invoice.projectName}</p>
              </div>
              <div className='flex justify-between'>
                <p>Issue Date:</p>
                <p className='font-medium'>
                  {formatDate(new Date(invoice.createdAt ?? new Date()))}
                </p>
              </div>
              <div className='flex justify-between'>
                <p>Due Date:</p>
                <p className='font-medium'>
                  {formatDate(new Date(invoice.dueDate ?? new Date()))}
                </p>
              </div>
            </div>
          </div>

          <div className='mb-8'>
            <h3 className='mb-4 font-semibold'>Line Items</h3>
            <div className='grid grid-cols-10 gap-4 border-b pb-2 font-medium'>
              <div className='col-span-5'>Description</div>
              <div className='col-span-1 text-right'>Quantity</div>
              <div className='col-span-2 text-right'>Rate</div>
              <div className='col-span-2 text-right'>Amount</div>
            </div>

            {invoice.InvoiceItems.map((item: InvoiceItem) => (
              <div
                key={item.id}
                className='grid grid-cols-10 gap-4 border-b py-3'
              >
                <div className='col-span-5'>{item.description}</div>
                <div className='col-span-1 text-right'>{item.quantity}</div>
                <div className='col-span-2 text-right'>
                  {formatCurrency(item.rate)}
                </div>
                <div className='col-span-2 text-right'>
                  {formatCurrency(item.amount)}
                </div>
              </div>
            ))}
          </div>

          <div className='flex justify-end'>
            <div className='w-1/3'>
              <div className='flex justify-between py-2'>
                <p>Subtotal:</p>
                <p className='font-medium'>
                  {formatCurrency(
                    invoice.InvoiceItems.reduce(
                      (sum, item) => sum + item.amount,
                      0
                    )
                  )}
                </p>
              </div>
              <Separator />
              <div className='flex justify-between py-2'>
                <p className='font-semibold'>Total:</p>
                <p className='font-bold'>{formatCurrency(invoice.amount)}</p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className='flex flex-col items-start'>
          <h3 className='mb-2 font-semibold'>Payment Information</h3>
          <p>Please make payment by the due date.</p>
        </CardFooter>
      </Card>

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Email Invoice</DialogTitle>
            <DialogDescription>
              Send this invoice to {invoice?.clientEmail}
            </DialogDescription>
          </DialogHeader>
          <div className='py-4'>
            <Textarea
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              placeholder='Add a custom message to your client (optional)'
              className='min-h-[120px]'
            />
          </div>
          <DialogFooter className='flex space-x-2 sm:justify-between'>
            <DialogClose asChild>
              <Button type='button' variant='outline'>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type='button'
              onClick={emailInvoiceHandler}
              disabled={isEmailing}
            >
              {isEmailing ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              invoice and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
