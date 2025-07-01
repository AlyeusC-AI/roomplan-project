"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";

import { estimatesStore } from "@atoms/estimates";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { LoadingPlaceholder } from "@components/ui/spinner";
import { Badge } from "@components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit,
  SendHorizontal,
  CheckCircle2,
  CircleDashed,
  Printer,
  Copy,
  Download,
  Mail,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
import Link from "next/link";
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
import {
  Estimate,
  useGetEstimateById,
  useUpdateEstimate,
  useConvertEstimateToInvoice,
  useDeleteEstimate,
  useEmailEstimate,
} from "@service-geek/api-client";

const statusDisplay: Record<
  Estimate["status"],
  { label: string; color: string }
> = {
  DRAFT: { label: "Draft", color: "bg-gray-400" },
  SENT: { label: "Sent", color: "bg-blue-400" },
  APPROVED: { label: "Approved", color: "bg-green-400" },
  REJECTED: { label: "Rejected", color: "bg-red-400" },
  // CANCELLED: { label: "Cancelled", color: "bg-gray-400" },
  // EXPIRED: { label: "Expired", color: "bg-gray-400" },
};

export default function EstimateDetails() {
  const router = useRouter();
  const params = useParams();
  const estimateId = params.id as string;

  const { data: estimate, isLoading: loading } = useGetEstimateById(estimateId);
  const { mutate: updateEstimate } = useUpdateEstimate();
  const { mutateAsync: convertEstimateToInvoice } =
    useConvertEstimateToInvoice();
  const { mutate: deleteEstimate } = useDeleteEstimate();
  const { mutateAsync: emailEstimate } = useEmailEstimate();
  // const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleUpdateStatus = async (newStatus: Estimate["status"]) => {
    setIsUpdatingStatus(true);
    try {
      await updateEstimate({
        id: estimateId,
        data: {
          status: newStatus,
        },
      });

      toast.success(`Estimate marked as ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update estimate status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleConvertToInvoice = async () => {
    if (!estimate || estimate.data.status !== "APPROVED") return;

    setIsConverting(true);
    try {
      const result = await convertEstimateToInvoice(estimateId);

      toast.success("Estimate converted to invoice successfully");
      router.push(`/invoices/${result.data.invoiceId}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to convert estimate to invoice");
    } finally {
      setIsConverting(false);
    }
  };

  const printEstimate = () => {
    window.print();
  };

  const downloadAsPdf = async () => {
    setIsExporting(true);
    try {
      if (!estimate) {
        toast.error("No estimate data available");
        return;
      }

      // Generate HTML content for the PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Estimate #${estimate.data.number}</title>
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
            .estimate-info {
              text-align: right;
            }
            .estimate-title {
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
              <div class="estimate-info">
                <h2 class="estimate-title">Estimate #${estimate.data.number}</h2>
                <div class="status-badge">${estimate.data.status.toUpperCase()}</div>
                <div class="date-info">
                  <p>Date: ${format(new Date(estimate.data.estimateDate || new Date()), "MMM d, yyyy")}</p>
                  <p>Valid Until: ${format(new Date(estimate.data.expiryDate || new Date()), "MMM d, yyyy")}</p>
                </div>
              </div>
            </div>
            
            <div class="client-info">
              <p class="section-title">For:</p>
              <p class="client-name">${estimate.data.clientName}</p>
              ${estimate.data.clientEmail ? `<p>${estimate.data.clientEmail}</p>` : ""}
              ${estimate.data.project ? `<p class="project-info">Project: ${estimate.data.project.name}</p>` : ""}
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
                ${estimate.data.items
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
              <div class="total-row final">
                <span>Total</span>
                <span>$${estimate.data.total.toFixed(2)}</span>
              </div>
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
            pdf.save(`Estimate-${estimate.data.number}.pdf`);

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
    if (!estimate?.data.clientEmail) {
      toast.error("No client email address available");
      return;
    }
    setEmailMessage("");
    setIsEmailDialogOpen(true);
  };

  const handleEmailEstimate = async () => {
    setIsEmailDialogOpen(false);
    setIsEmailing(true);
    try {
      const result = await emailEstimate({
        id: estimateId,
        message: emailMessage || undefined,
      });

      toast.success(`Estimate emailed to ${estimate!.data.clientEmail}`);
    } catch (error) {
      console.error("Error emailing estimate:", error);
      toast.error("Failed to email estimate");
    } finally {
      setIsEmailing(false);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    setIsDeleteDialogOpen(false);
    setIsDeleting(true);
    try {
      await deleteEstimate(estimateId);

      toast.success("Estimate deleted successfully");
      router.push("/estimates");
    } catch (error) {
      console.error("Error deleting estimate:", error);
      toast.error("Failed to delete estimate");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <LoadingPlaceholder />;
  }

  if (!estimate) {
    return (
      <div className='flex h-[60vh] flex-col items-center justify-center'>
        <h1 className='mb-4 text-2xl font-semibold'>Estimate Not Found</h1>
        <Button onClick={() => router.back()}>
          <ArrowLeft className='mr-2 size-4' /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className='container mx-auto space-y-6 py-6 print:space-y-2 print:py-2'>
      <div
        id='buttons-container'
        className='flex items-center justify-between print:hidden'
      >
        <Button variant='outline' onClick={() => router.back()}>
          <ArrowLeft className='mr-2 size-4' /> Back
        </Button>

        <div className='flex gap-2'>
          <Button variant='outline' onClick={printEstimate}>
            <Printer className='mr-2 size-4' /> Print
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
            disabled={isEmailing || !estimate?.data.clientEmail}
          >
            <Mail className='mr-2 size-4' />
            {isEmailing ? "Sending..." : "Email to Client"}
          </Button>

          <Link href={`/estimates/${estimateId}/edit`} passHref>
            <Button variant='outline'>
              <Edit className='mr-2 size-4' /> Edit
            </Button>
          </Link>

          {estimate.data.status === "DRAFT" && (
            <Button
              onClick={() => handleUpdateStatus("SENT")}
              disabled={isUpdatingStatus}
            >
              <SendHorizontal className='mr-2 size-4' /> Mark as Sent
            </Button>
          )}

          {(estimate.data.status === "DRAFT" ||
            estimate.data.status === "SENT") && (
            <Button
              onClick={() => handleUpdateStatus("APPROVED")}
              disabled={isUpdatingStatus}
              variant='outline'
            >
              <CheckCircle2 className='mr-2 size-4' /> Approve
            </Button>
          )}

          {(estimate.data.status === "DRAFT" ||
            estimate.data.status === "SENT") && (
            <Button
              onClick={() => handleUpdateStatus("REJECTED")}
              disabled={isUpdatingStatus}
              variant='outline'
            >
              <CircleDashed className='mr-2 size-4' /> Reject
            </Button>
          )}

          {estimate.data.status === "APPROVED" && (
            <Button onClick={handleConvertToInvoice} disabled={isConverting}>
              <Copy className='mr-2 size-4' /> Convert to Invoice
            </Button>
          )}

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
        id='estimate-container'
        className='print:border-none print:shadow-none'
      >
        <CardHeader className='pb-2'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-2xl'>
              Estimate {estimate.data.number}
            </CardTitle>
            <Badge className={`text-white`}>
              {statusDisplay[estimate.data.status]?.label ?? "Draft"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className='mb-6 grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div>
              <h3 className='mb-2 text-lg font-semibold'>Client Information</h3>
              <div className='space-y-1'>
                <p className='font-medium'>{estimate.data.clientName}</p>
                {estimate.data.clientEmail && (
                  <p>{estimate.data.clientEmail}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className='mb-2 text-lg font-semibold'>Estimate Details</h3>
              <div className='space-y-1'>
                <div className='flex justify-between'>
                  <span>Estimate Date:</span>
                  <span>
                    {format(
                      new Date(estimate.data.estimateDate ?? new Date()),
                      "PPP"
                    )}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Expiry Date:</span>
                  <span>
                    {format(
                      new Date(estimate.data.expiryDate ?? new Date()),
                      "PPP"
                    )}
                  </span>
                </div>
                {estimate.data.poNumber && (
                  <div className='flex justify-between'>
                    <span>PO Number:</span>
                    <span>{estimate.data.poNumber}</span>
                  </div>
                )}
                <div className='flex justify-between'>
                  <span>Project:</span>
                  <span>{estimate.data.project?.name || "Not specified"}</span>
                </div>
              </div>
            </div>
          </div>

          <h3 className='mb-2 text-lg font-semibold'>Line Items</h3>
          <div className='mb-6 overflow-hidden rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[50%]'>Description</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead className='text-center'>Quantity</TableHead>
                  <TableHead className='text-right'>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estimate.data.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>${item.rate.toFixed(2)}</TableCell>
                    <TableCell className='text-center'>
                      {item.quantity}
                    </TableCell>
                    <TableCell className='text-right'>
                      ${item.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              {estimate.data.notes && (
                <div className='mb-4'>
                  <h3 className='mb-2 text-lg font-semibold'>Notes</h3>
                  <p className='text-sm text-muted-foreground'>
                    {estimate.data.notes}
                  </p>
                </div>
              )}
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span>Subtotal</span>
                <span>${estimate.data.subtotal.toFixed(2)}</span>
              </div>

              {estimate.data.markup && (
                <div className='flex justify-between'>
                  <span>Markup ({estimate.data.markup}%)</span>
                  <span>
                    $
                    {(
                      estimate.data.subtotal *
                      (estimate.data.markup / 100)
                    ).toFixed(2)}
                  </span>
                </div>
              )}

              {estimate.data.discount && (
                <div className='flex justify-between'>
                  <span>Discount</span>
                  <span>-${estimate.data.discount.toFixed(2)}</span>
                </div>
              )}

              {estimate.data.tax && (
                <div className='flex justify-between'>
                  <span>Tax ({estimate.data.tax}%)</span>
                  <span>
                    $
                    {(
                      estimate.data.total -
                      estimate.data.subtotal +
                      (estimate.data.discount || 0) -
                      estimate.data.subtotal *
                        ((estimate.data.markup || 0) / 100)
                    ).toFixed(2)}
                  </span>
                </div>
              )}

              <div className='border-t pt-2'>
                <div className='flex justify-between font-bold'>
                  <span>Total</span>
                  <span>${estimate.data.total.toFixed(2)}</span>
                </div>

                {estimate.data.deposit && (
                  <>
                    <div className='mt-2 flex justify-between'>
                      <span>Deposit ({estimate.data.deposit}%)</span>
                      <span>
                        $
                        {(
                          estimate.data.total *
                          (estimate.data.deposit ?? 0 / 100)
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Balance Due (if approved)</span>
                      <span>
                        $
                        {(
                          estimate.data.total -
                          estimate.data.total *
                            (estimate.data.deposit ?? 0 / 100)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Email Estimate</DialogTitle>
            <DialogDescription>
              Send this estimate to {estimate?.data?.clientEmail}
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
              onClick={handleEmailEstimate}
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
              estimate and remove it from our servers.
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
