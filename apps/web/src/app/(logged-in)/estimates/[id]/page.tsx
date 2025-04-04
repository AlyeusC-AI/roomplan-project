"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import {
  getEstimateById,
  updateEstimateStatus,
  convertEstimateToInvoice,
  deleteEstimate,
  emailEstimate,
} from "@/services/api/estimates";
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

const statusDisplay: Record<
  Estimate["status"],
  { label: string; color: string }
> = {
  draft: { label: "Draft", color: "bg-gray-400" },
  sent: { label: "Sent", color: "bg-blue-400" },
  approved: { label: "Approved", color: "bg-green-400" },
  rejected: { label: "Rejected", color: "bg-red-400" },
  cancelled: { label: "Cancelled", color: "bg-gray-400" },
  expired: { label: "Expired", color: "bg-gray-400" },
};

declare global {
  type Estimate = Database["public"]["Tables"]["Estimates"]["Row"] & {
    EstimateItems: EstimateItem[];
  };
  type EstimateItem = Database["public"]["Tables"]["EstimateItems"]["Row"];
}

export default function EstimateDetails() {
  const router = useRouter();
  const params = useParams();
  const { updateEstimate: updateEstimateInStore } = estimatesStore(
    (state) => state
  );

  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const estimateId = params.id as string;

  useEffect(() => {
    const fetchEstimate = async () => {
      try {
        const result = await getEstimateById(estimateId);
        if (result.error) {
          toast.error(result.error);
        } else if (result.data) {
          setEstimate(result.data);
        }
      } catch (error) {
        console.error("Error fetching estimate:", error);
        toast.error("Failed to load estimate details");
      } finally {
        setLoading(false);
      }
    };

    fetchEstimate();
  }, [estimateId]);

  const handleUpdateStatus = async (newStatus: Estimate["status"]) => {
    setIsUpdatingStatus(true);
    try {
      const result = await updateEstimateStatus(estimateId, newStatus);

      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        setEstimate({ ...estimate!, status: newStatus });
        updateEstimateInStore(estimateId, { status: newStatus });
        toast.success(`Estimate marked as ${newStatus}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update estimate status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleConvertToInvoice = async () => {
    if (!estimate || estimate.status !== "approved") return;

    setIsConverting(true);
    try {
      const result = await convertEstimateToInvoice(estimateId);

      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        toast.success("Estimate converted to invoice successfully");
        router.push(`/invoices/${result.data.invoiceId}`);
      }
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
      const estimateElement = document.getElementById("estimate-container");
      if (!estimateElement) {
        toast.error("Could not find estimate content to export");
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

      const canvas = await html2canvas(estimateElement, {
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
      pdf.save(`Estimate-${estimate?.number || estimateId}.pdf`);

      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const openEmailDialog = () => {
    if (!estimate?.clientEmail) {
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
      const result = await emailEstimate(estimateId, emailMessage || undefined);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          result.message || `Estimate emailed to ${estimate!.clientEmail}`
        );

        // If the status was draft, refresh the data to get updated status
        if (estimate!.status === "draft") {
          const updatedData = await getEstimateById(estimateId);
          if (updatedData.data) {
            setEstimate(updatedData.data);
          }
        }
      }
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
      const result = await deleteEstimate(estimateId);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Estimate deleted successfully");
        router.push("/estimates");
      }
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
            disabled={isEmailing || !estimate?.clientEmail}
          >
            <Mail className='mr-2 size-4' />
            {isEmailing ? "Sending..." : "Email to Client"}
          </Button>

          <Link href={`/estimates/${estimateId}/edit`} passHref>
            <Button variant='outline'>
              <Edit className='mr-2 size-4' /> Edit
            </Button>
          </Link>

          {estimate.status === "draft" && (
            <Button
              onClick={() => handleUpdateStatus("sent")}
              disabled={isUpdatingStatus}
            >
              <SendHorizontal className='mr-2 size-4' /> Mark as Sent
            </Button>
          )}

          {(estimate.status === "draft" || estimate.status === "sent") && (
            <Button
              onClick={() => handleUpdateStatus("approved")}
              disabled={isUpdatingStatus}
              variant='outline'
            >
              <CheckCircle2 className='mr-2 size-4' /> Approve
            </Button>
          )}

          {(estimate.status === "draft" || estimate.status === "sent") && (
            <Button
              onClick={() => handleUpdateStatus("rejected")}
              disabled={isUpdatingStatus}
              variant='outline'
            >
              <CircleDashed className='mr-2 size-4' /> Reject
            </Button>
          )}

          {estimate.status === "approved" && (
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
              Estimate {estimate.number}
            </CardTitle>
            <Badge className={`text-white`}>
              {statusDisplay[estimate.status]?.label ?? "Draft"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className='mb-6 grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div>
              <h3 className='mb-2 text-lg font-semibold'>Client Information</h3>
              <div className='space-y-1'>
                <p className='font-medium'>{estimate.clientName}</p>
                {estimate.clientEmail && <p>{estimate.clientEmail}</p>}
              </div>
            </div>

            <div>
              <h3 className='mb-2 text-lg font-semibold'>Estimate Details</h3>
              <div className='space-y-1'>
                <div className='flex justify-between'>
                  <span>Estimate Date:</span>
                  <span>
                    {format(
                      new Date(estimate.estimateDate ?? new Date()),
                      "PPP"
                    )}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Expiry Date:</span>
                  <span>
                    {format(new Date(estimate.expiryDate ?? new Date()), "PPP")}
                  </span>
                </div>
                {estimate.poNumber && (
                  <div className='flex justify-between'>
                    <span>PO Number:</span>
                    <span>{estimate.poNumber}</span>
                  </div>
                )}
                <div className='flex justify-between'>
                  <span>Project:</span>
                  <span>{estimate.projectName || "Not specified"}</span>
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
                {estimate.EstimateItems.map((item) => (
                  <TableRow key={item.publicId}>
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
              {estimate.notes && (
                <div className='mb-4'>
                  <h3 className='mb-2 text-lg font-semibold'>Notes</h3>
                  <p className='text-sm text-muted-foreground'>
                    {estimate.notes}
                  </p>
                </div>
              )}
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span>Subtotal</span>
                <span>${estimate.subtotal.toFixed(2)}</span>
              </div>

              {estimate.markupAmount && (
                <div className='flex justify-between'>
                  <span>Markup ({estimate.markupAmount}%)</span>
                  <span>
                    $
                    {(
                      estimate.subtotal *
                      (estimate.markupAmount / 100)
                    ).toFixed(2)}
                  </span>
                </div>
              )}

              {estimate.discountAmount && (
                <div className='flex justify-between'>
                  <span>Discount</span>
                  <span>-${estimate.discountAmount.toFixed(2)}</span>
                </div>
              )}

              {estimate.taxAmount && (
                <div className='flex justify-between'>
                  <span>Tax ({estimate.taxAmount}%)</span>
                  <span>
                    $
                    {(
                      estimate.amount -
                      estimate.subtotal +
                      (estimate.discountAmount || 0) -
                      estimate.subtotal * ((estimate.markupAmount || 0) / 100)
                    ).toFixed(2)}
                  </span>
                </div>
              )}

              <div className='border-t pt-2'>
                <div className='flex justify-between font-bold'>
                  <span>Total</span>
                  <span>${estimate.amount.toFixed(2)}</span>
                </div>

                {estimate.depositAmount && (
                  <>
                    <div className='mt-2 flex justify-between'>
                      <span>Deposit ({estimate.depositPercentage}%)</span>
                      <span>
                        $
                        {(
                          estimate.amount *
                          (estimate.depositPercentage ?? 0 / 100)
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Balance Due (if approved)</span>
                      <span>
                        $
                        {(
                          estimate.amount -
                          estimate.amount *
                            (estimate.depositPercentage ?? 0 / 100)
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
              Send this estimate to {estimate?.clientEmail}
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
