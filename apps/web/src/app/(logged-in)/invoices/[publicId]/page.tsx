"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
import { format } from "date-fns";
import {
  Invoice,
  InvoiceItem,
  useDeleteInvoice,
  useEmailInvoice,
  useGetInvoiceById,
  useUpdateInvoice,
  useUpdateInvoiceStatus,
} from "@service-geek/api-client";

export default function InvoicePage() {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();
  const params = useParams<{ publicId: string }>();
  const { mutateAsync: updateStatus } = useUpdateInvoiceStatus();
  const { data: invoiceData, isLoading } = useGetInvoiceById(params.publicId);
  const invoice = invoiceData?.data;
  const { mutateAsync: deleteInvoice } = useDeleteInvoice();
  const { mutateAsync: emailInvoice } = useEmailInvoice();
  const { mutateAsync: updateInvoice } = useUpdateInvoice();

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    setIsDeleteDialogOpen(false);
    setIsDeleting(true);
    try {
      await deleteInvoice(params.publicId);

      toast.success("Invoice deleted successfully");
      router.push("/invoices");
    } catch (err) {
      toast.error("Failed to delete invoice");
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusUpdate = async (newStatus: Invoice["status"]) => {
    await updateStatus({ id: invoice?.id ?? "", status: newStatus });
    toast.success("Invoice status updated successfully");
  };

  const printInvoice = () => {
    window.print();
  };

  const downloadAsPdf = async () => {
    setIsExporting(true);
    try {
      if (!invoice) {
        toast.error("No invoice data available");
        return;
      }

      // Generate HTML content for the PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice #${invoice?.number}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 30px;
              color: #0f172a;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 40px;
            }
            .company-name {
              font-size: 28px;
              font-weight: bold;
              color: #0a7ea4;
              margin: 0;
            }
            .company-tagline {
              font-size: 14px;
              color: #64748b;
              margin-top: 5px;
            }
            .invoice-info {
              text-align: right;
            }
            .invoice-title {
              font-size: 20px;
              font-weight: bold;
              margin: 0;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 4px;
              background-color: #eff6ff;
              color: #0a7ea4;
              font-size: 12px;
              font-weight: bold;
              margin-top: 8px;
            }
            .date-info {
              margin-top: 16px;
              font-size: 14px;
              color: #334155;
            }
            .date-info p {
              margin: 3px 0;
            }
            .section-title {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .client-info {
              margin-bottom: 30px;
            }
            .client-name {
              font-size: 16px;
              font-weight: bold;
              margin: 0 0 4px 0;
            }
            .project-info {
              margin-top: 8px;
              font-size: 14px;
              color: #334155;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              border-bottom: 1px solid #e2e8f0;
              text-align: left;
              padding: 10px 0;
              font-size: 14px;
              font-weight: 600;
              color: #334155;
            }
            td {
              padding: 12px 0;
              border-bottom: 1px solid #e2e8f0;
              font-size: 14px;
            }
            .amount-column {
              text-align: right;
            }
            .total-section {
              width: 300px;
              margin-left: auto;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
            }
            .total-row.final {
              border-top: 1px solid #e2e8f0;
              margin-top: 8px;
              padding-top: 12px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="company-info">
                <h1 class="company-name">ServiceGeek</h1>
                <p class="company-tagline">Professional Service Management</p>
              </div>
              <div class="invoice-info">
                <h2 class="invoice-title">Invoice #${invoice.number}</h2>
                <div class="status-badge">${invoice.status.toUpperCase()}</div>
                <div class="date-info">
                  <p>Date: ${format(new Date(invoice.createdAt || new Date()), "MMM d, yyyy")}</p>
                  <p>Due: ${format(new Date(invoice.dueDate || new Date()), "MMM d, yyyy")}</p>
                </div>
              </div>
            </div>
            
            <div class="client-info">
              <p class="section-title">For:</p>
              <p class="client-name">${invoice.clientName}</p>
              ${invoice.clientEmail ? `<p>${invoice.clientEmail}</p>` : ""}
              ${invoice.project?.name ? `<p class="project-info">Project: ${invoice.project.name}</p>` : ""}
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Rate</th>
                  <th class="amount-column">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.rate.toFixed(2)}</td>
                    <td class="amount-column">$${item.amount.toFixed(2)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            
            <div class="total-section">
              <div class="total-row">
                <span>Subtotal</span>
                <span>$${invoice.subtotal.toFixed(2)}</span>
              </div>
              
              ${
                invoice.tax && invoice.tax > 0
                  ? `
                <div class="total-row">
                  <span>Tax (${invoice.tax}%)</span>
                  <span>$${((invoice.tax / 100) * invoice.subtotal || 0).toFixed(2)}</span>
                </div>
              `
                  : ""
              }
              
              ${
                invoice.discount && invoice.discount > 0
                  ? `
                <div class="total-row">
                  <span>Discount</span>
                  <span>-$${invoice.discount.toFixed(2)}</span>
                </div>
              `
                  : ""
              }
              
              <div class="total-row final">
                <span>Total</span>
                <span>$${invoice.total.toFixed(2)}</span>
              </div>
              
              ${
                invoice.deposit && invoice.deposit > 0
                  ? `
                <div class="total-row">
                  <span>Deposit Paid</span>
                  <span>$${invoice.deposit.toFixed(2)}</span>
                </div>
                <div class="total-row">
                  <span>Balance Due</span>
                  <span>$${(invoice.total - invoice.deposit).toFixed(2)}</span>
                </div>
              `
                  : ""
              }
            </div>
          </div>
        </body>
        </html>
      `;

      // Create PDF from HTML
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // First render the HTML to a canvas using html2canvas
      const iframe = document.createElement("iframe");
      iframe.style.visibility = "hidden";
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.width = "800";
      document.body.appendChild(iframe);

      const iframeDocument =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDocument) {
        iframeDocument.open();
        iframeDocument.write(htmlContent);
        iframeDocument.close();

        // Wait a moment for the content to render
        setTimeout(async () => {
          try {
            const contentElement = iframeDocument.body;
            const canvas = await html2canvas(contentElement, {
              scale: 3,
              useCORS: true,
              allowTaint: false,
              backgroundColor: "#ffffff",
              logging: false,
              windowWidth: 800,
              imageTimeout: 15000,
              removeContainer: true,
            });

            // Remove the iframe
            document.body.removeChild(iframe);

            // Add the canvas to the PDF
            const imgData = canvas.toDataURL("image/png");
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
            pdf.save(`Invoice-${invoice.number}.pdf`);

            toast.success("PDF downloaded successfully");
            setIsExporting(false);
          } catch (error) {
            console.error("Error rendering HTML to canvas:", error);
            document.body.removeChild(iframe);
            throw error;
          }
        }, 1000);
      } else {
        throw new Error("Could not access iframe document");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
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
      const result = await emailInvoice({
        id: params.publicId as string,
        message: emailMessage,
      });

      toast.success(
        result.data?.message || `Invoice emailed to ${invoice?.clientEmail}`
      );
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

  if (isLoading) {
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
                  className={cn(
                    "ml-2 text-xs",
                    getStatusColor(invoice.status.toLowerCase())
                  )}
                >
                  {invoice.status.charAt(0).toUpperCase() +
                    invoice.status.slice(1)}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => handleStatusUpdate("DRAFT")}
                disabled={invoice.status === "DRAFT"}
              >
                Mark as Draft
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusUpdate("SENT")}
                disabled={invoice.status === "SENT"}
              >
                <Send className='mr-2 size-4' />
                Mark as Sent
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusUpdate("PAID")}
                disabled={invoice.status === "PAID"}
              >
                <CheckCircle className='mr-2 size-4' />
                Mark as Paid
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusUpdate("OVERDUE")}
                disabled={invoice.status === "OVERDUE"}
              >
                <AlertTriangle className='mr-2 size-4' />
                Mark as Overdue
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusUpdate("CANCELLED")}
                disabled={invoice.status === "CANCELLED"}
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
                {formatCurrency(invoice.total)}
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
                <p className='font-medium'>{invoice.project?.name}</p>
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

            {invoice.items.map((item: InvoiceItem) => (
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
                    invoice.items.reduce((sum, item) => sum + item.amount, 0)
                  )}
                </p>
              </div>
              <Separator />
              <div className='flex justify-between py-2'>
                <p className='font-semibold'>Total:</p>
                <p className='font-bold'>{formatCurrency(invoice.total)}</p>
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
