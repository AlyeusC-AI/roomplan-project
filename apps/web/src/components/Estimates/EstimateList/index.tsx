"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  CircleDashed,
  Copy,
  Edit,
  Eye,
  MoreHorizontal,
  SendHorizontal,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { estimatesStore } from "@atoms/estimates";
import {
  getEstimates,
  convertEstimateToInvoice,
  updateEstimateStatus,
  deleteEstimate,
} from "@/services/api/estimates";
import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@components/ui/alert-dialog";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import {
  useDeleteEstimate,
  useGetEstimates,
  useUpdateEstimate,
} from "@service-geek/api-client";

const statusDisplay = {
  draft: { label: "Draft", color: "bg-gray-400" },
  sent: { label: "Sent", color: "bg-blue-400" },
  approved: { label: "Approved", color: "bg-green-400" },
  rejected: { label: "Rejected", color: "bg-red-400" },
  cancelled: { label: "Cancelled", color: "bg-gray-600" },
  expired: { label: "Expired", color: "bg-orange-400" },
};

const EstimateList = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [estimateToDelete, setEstimateToDelete] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { data: estimates, isLoading } = useGetEstimates();
  const { mutate: deleteEstimateMutation } = useDeleteEstimate();
  const { mutate: updateEstimateMutation } = useUpdateEstimate();
  // const {
  //   estimates,
  //   setEstimates,
  //   deleteEstimate: removeEstimateFromStore,
  //   updateEstimate: updateEstimateInStore,
  //   setLoadingEstimates,
  // } = estimatesStore((state) => state);

  // Filtered estimates
  const filteredEstimates =
    estimates?.filter((estimate) => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        estimate.number.toLowerCase().includes(search) ||
        estimate.clientName.toLowerCase().includes(search) ||
        (estimate.project?.name &&
          estimate.project?.name.toLowerCase().includes(search))
      );
    }) ?? [];

  // Handle deleting an estimate
  const handleDeleteEstimate = async () => {
    if (!estimateToDelete) return;

    try {
      await deleteEstimateMutation(estimateToDelete);
      toast.success("Estimate deleted successfully");
    } catch (error) {
      console.error("Error deleting estimate:", error);
      toast.error("Failed to delete estimate");
    } finally {
      setEstimateToDelete(null);
      setShowDeleteAlert(false);
    }
  };

  // Handle updating estimate status
  const handleUpdateStatus = async (
    estimateId: string,
    newStatus: Estimate["status"]
  ) => {
    setIsUpdatingStatus(true);
    try {
      await updateEstimateMutation({
        id: estimateId,
        data: {
          status: newStatus,
        },
      });
      toast.success(`Estimate marked as ${newStatus}`);
    } catch (error) {
      console.error("Error updating estimate status:", error);
      toast.error("Failed to update estimate status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle converting estimate to invoice
  const handleConvertToInvoice = async (estimateId: string) => {
    setIsConverting(true);
    try {
      const result = await convertEstimateToInvoice(estimateId);

      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        toast.success("Estimate converted to invoice successfully");
        // Navigate to the new invoice
        router.push(`/invoices/${result.data.invoiceId}`);
      }
    } catch (error) {
      console.error("Error converting estimate to invoice:", error);
      toast.error("Failed to convert estimate to invoice");
    } finally {
      setIsConverting(false);
    }
  };

  // Placeholder for viewing estimate details
  const viewEstimate = (estimateId: string) => {
    router.push(`/estimates/${estimateId}`);
  };

  // Placeholder for editing estimate
  const editEstimate = (estimateId: string) => {
    router.push(`/estimates/${estimateId}/edit`);
  };

  return (
    <>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <div>
            <CardTitle>Estimates</CardTitle>
            <CardDescription>
              Manage your estimates and convert them to invoices.
            </CardDescription>
          </div>
          <Button onClick={() => router.push("/estimates/new")}>
            New Estimate
          </Button>
        </CardHeader>
        <CardContent>
          <div className='mb-4'>
            <Input
              placeholder='Search estimates...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='max-w-sm'
            />
          </div>

          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead className='text-right'>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEstimates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className='h-24 text-center'>
                      No estimates found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEstimates.map((estimate) => (
                    <TableRow
                      key={estimate.id}
                      className='cursor-pointer'
                      onClick={() => viewEstimate(estimate.id)}
                    >
                      <TableCell className='font-medium'>
                        <Link
                          href={`/estimates/${estimate.id}`}
                          className='text-blue-600 hover:underline'
                          onClick={(e) => e.stopPropagation()}
                        >
                          {estimate.number}
                        </Link>
                      </TableCell>
                      <TableCell>{estimate.clientName}</TableCell>
                      <TableCell>{estimate.project?.name || "-"}</TableCell>
                      <TableCell className='text-right'>
                        ${estimate.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${
                            statusDisplay[
                              estimate.status.toLowerCase() as keyof typeof statusDisplay
                            ].color
                          } text-white`}
                        >
                          {
                            statusDisplay[
                              estimate.status.toLowerCase() as keyof typeof statusDisplay
                            ].label
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          title={format(
                            new Date(estimate.estimateDate ?? new Date()),
                            "PPP"
                          )}
                        >
                          {formatDistanceToNow(
                            new Date(estimate.estimateDate ?? new Date()),
                            {
                              addSuffix: true,
                            }
                          )}
                        </span>
                      </TableCell>
                      <TableCell className='text-right'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              className='size-8 p-0'
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className='sr-only'>Open menu</span>
                              <MoreHorizontal className='size-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                viewEstimate(estimate.id);
                              }}
                            >
                              <Eye className='mr-2 size-4' />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                editEstimate(estimate.id);
                              }}
                            >
                              <Edit className='mr-2 size-4' />
                              Edit
                            </DropdownMenuItem>
                            {estimate.status === "DRAFT" && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(estimate.id, "SENT");
                                }}
                                disabled={isUpdatingStatus}
                              >
                                <SendHorizontal className='mr-2 size-4' />
                                Mark as Sent
                              </DropdownMenuItem>
                            )}
                            {(estimate.status === "DRAFT" ||
                              estimate.status === "SENT") && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(estimate.id, "APPROVED");
                                }}
                                disabled={isUpdatingStatus}
                              >
                                <CheckCircle2 className='mr-2 size-4' />
                                Mark as Approved
                              </DropdownMenuItem>
                            )}
                            {(estimate.status === "DRAFT" ||
                              estimate.status === "SENT") && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(estimate.id, "REJECTED");
                                }}
                                disabled={isUpdatingStatus}
                              >
                                <CircleDashed className='mr-2 size-4' />
                                Mark as Rejected
                              </DropdownMenuItem>
                            )}
                            {estimate.status === "APPROVED" && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConvertToInvoice(estimate.id);
                                }}
                                disabled={isConverting}
                              >
                                <Copy className='mr-2 size-4' />
                                Convert to Invoice
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setEstimateToDelete(estimate.id);
                                setShowDeleteAlert(true);
                              }}
                              className='text-red-600'
                            >
                              <Trash2 className='mr-2 size-4' />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              estimate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEstimate}
              className='bg-red-600 hover:bg-red-700'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EstimateList;
