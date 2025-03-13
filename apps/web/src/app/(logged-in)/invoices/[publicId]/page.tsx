"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchInvoiceById, deleteInvoice } from "@/services/api/invoices";
import { Invoice, InvoiceItem, invoicesStore } from "@/atoms/invoices";
import { Button } from "@/components/ui/button";
import { LoadingPlaceholder } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Printer, Download, Send, Trash2, CheckCircle, AlertTriangle, Ban } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function InvoicePage({ params }: { params: { publicId: string } }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { handleUpdateStatus } = invoicesStore();

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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this invoice?")) {
      return;
    }
    
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

  const handleStatusUpdate = async (newStatus: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled') => {
    await handleUpdateStatus(params.publicId, newStatus);
    if (invoice) {
      setInvoice({
        ...invoice,
        status: newStatus
      });
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return <LoadingPlaceholder />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => router.push("/invoices")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Button>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-gray-500 mb-4">Invoice not found</p>
        <Button onClick={() => router.push("/invoices")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => router.push("/invoices")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Button>
        
        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Status: 
                <Badge
                  variant="outline"
                  className={cn(
                    "ml-2 text-xs",
                    getStatusColor(invoice.status)
                  )}
                >
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem 
                onClick={() => handleStatusUpdate('draft')}
                disabled={invoice.status === 'draft'}
              >
                Mark as Draft
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleStatusUpdate('sent')}
                disabled={invoice.status === 'sent'}
              >
                <Send className="mr-2 h-4 w-4" />
                Mark as Sent
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleStatusUpdate('paid')}
                disabled={invoice.status === 'paid'}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Paid
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleStatusUpdate('overdue')}
                disabled={invoice.status === 'overdue'}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Mark as Overdue
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleStatusUpdate('cancelled')}
                disabled={invoice.status === 'cancelled'}
              >
                <Ban className="mr-2 h-4 w-4" />
                Mark as Cancelled
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline">
            <Send className="mr-2 h-4 w-4" />
            Email to Client
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">{invoice.number}</CardTitle>
              <CardDescription>Created on {formatDate(new Date(invoice.createdAt))}</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">Total Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(invoice.amount)}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <p className="font-medium">{invoice.clientName}</p>
              {invoice.clientEmail && <p>{invoice.clientEmail}</p>}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Details:</h3>
              <div className="flex justify-between">
                <p>Invoice Number:</p>
                <p className="font-medium">{invoice.number}</p>
              </div>
              <div className="flex justify-between">
                <p>Project:</p>
                <p className="font-medium">{invoice.projectName}</p>
              </div>
              <div className="flex justify-between">
                <p>Issue Date:</p>
                <p className="font-medium">{formatDate(new Date(invoice.createdAt))}</p>
              </div>
              <div className="flex justify-between">
                <p>Due Date:</p>
                <p className="font-medium">{formatDate(new Date(invoice.dueDate))}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="font-semibold mb-4">Line Items</h3>
            <div className="grid grid-cols-10 gap-4 font-medium border-b pb-2">
              <div className="col-span-5">Description</div>
              <div className="col-span-1 text-right">Quantity</div>
              <div className="col-span-2 text-right">Rate</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            
            {invoice.items.map((item: InvoiceItem) => (
              <div key={item.id} className="grid grid-cols-10 gap-4 py-3 border-b">
                <div className="col-span-5">{item.description}</div>
                <div className="col-span-1 text-right">{item.quantity}</div>
                <div className="col-span-2 text-right">{formatCurrency(item.rate)}</div>
                <div className="col-span-2 text-right">{formatCurrency(item.amount)}</div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <div className="w-1/3">
              <div className="flex justify-between py-2">
                <p>Subtotal:</p>
                <p className="font-medium">{formatCurrency(invoice.items.reduce((sum, item) => sum + item.amount, 0))}</p>
              </div>
              <Separator />
              <div className="flex justify-between py-2">
                <p className="font-semibold">Total:</p>
                <p className="font-bold">{formatCurrency(invoice.amount)}</p>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col items-start">
          <h3 className="font-semibold mb-2">Payment Information</h3>
          <p>Please make payment by the due date.</p>
        </CardFooter>
      </Card>
    </div>
  );
} 