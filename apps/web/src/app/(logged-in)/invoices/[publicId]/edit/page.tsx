"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { LoadingPlaceholder } from "@components/ui/spinner";
import { Switch } from "@components/ui/switch";
import { DateTimePicker } from "@components/ui/date-time-picker";
import { projectsStore } from "@atoms/projects";
import { toast } from "sonner";
import { ArrowLeft, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchInvoiceById, updateInvoice } from "@/services/api/invoices";
import { invoicesStore, SavedLineItem } from "@atoms/invoices";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Textarea } from "@components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EditInvoice = () => {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.publicId as string;

  // We can use '_invoice' for future enhancements
  const [_invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [daysUntilDue, setDaysUntilDue] = useState("30");
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [invoiceItems, setInvoiceItems] = useState<
    {
      id: string;
      description: string;
      quantity: number;
      rate: number;
      amount: number;
      publicId?: string;
    }[]
  >([]);
  const [showMarkup, setShowMarkup] = useState(false);
  const [markupPercentage, setMarkupPercentage] = useState(0);
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [applyTax, setApplyTax] = useState(false);
  const [showSavedItemsDialog, setShowSavedItemsDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");

  const { projects } = projectsStore((state) => state);
  const { savedLineItems } = invoicesStore((state) => state);

  // Get unique categories from saved items
  const getCategories = () => {
    const categoriesSet = new Set<string>();
    savedLineItems.forEach((item) => {
      if (item.category) {
        categoriesSet.add(item.category);
      }
    });
    return Array.from(categoriesSet);
  };

  // Filter saved items by category
  const filteredSavedItems = () => {
    if (selectedCategory === "all") {
      return savedLineItems;
    }
    return savedLineItems.filter((item) => item.category === selectedCategory);
  };

  // Load invoice data
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const result = await fetchInvoiceById(invoiceId);
        if (result.error) {
          console.error(result.error);
          toast.error(result.error);
        } else if (result.data) {
          setInvoice(result.data);

          // Populate form fields
          setInvoiceNumber(result.data.number);
          setClientName(result.data.clientName);
          setClientEmail(result.data.clientEmail || "");
          setProjectName(result.data.projectName || "");
          setProjectId(result.data.projectPublicId || "");
          setPoNumber(result.data.poNumber || "");
          
          // Handle dates safely
          if (result.data.invoiceDate) {
            setInvoiceDate(new Date(result.data.invoiceDate));
          }
          
          if (result.data.dueDate) {
            setDueDate(new Date(result.data.dueDate));
          }

          // Calculate days until due
          if (result.data.invoiceDate && result.data.dueDate) {
            const invoiceDateObj = new Date(result.data.invoiceDate);
            const dueDateObj = new Date(result.data.dueDate);
            const diffTime = Math.abs(
              dueDateObj.getTime() - invoiceDateObj.getTime()
            );
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setDaysUntilDue(diffDays.toString());
          }

          // Set markup if available
          if (result.data.markupPercentage) {
            setShowMarkup(true);
            setMarkupPercentage(result.data.markupPercentage);
          }

          // Set discount if available
          if (result.data.discountAmount) {
            setShowDiscount(true);
            setDiscountAmount(result.data.discountAmount);
          }

          // Set tax if available
          if (result.data.taxRate) {
            setApplyTax(true);
            setTaxRate(result.data.taxRate);
          }

          // Set deposit if available
          if (result.data.depositAmount) {
            setShowDeposit(true);
            setDepositAmount(result.data.depositAmount);
          }

          // Set notes and terms
          setNotes(result.data.notes || "");
          // TypeScript might complain about 'terms' not being on Invoice type
          // but we handle it safely here
          setTerms(result.data.terms || "");

          // Set line items
          setInvoiceItems(
            result.data.InvoiceItems.map((item) => ({
              id: uuidv4(),
              publicId: item.publicId,
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              amount: item.amount,
            }))
          );
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load invoice details");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  // Calculate due date based on days until due
  useEffect(() => {
    if (invoiceDate && daysUntilDue) {
      const due = new Date(invoiceDate);
      due.setDate(due.getDate() + parseInt(daysUntilDue || "0"));
      setDueDate(due);
    }
  }, [invoiceDate, daysUntilDue]);

  // Update line item amounts when rate or quantity changes
  useEffect(() => {
    const updated = invoiceItems.map((item) => ({
      ...item,
      amount: item.rate * item.quantity,
    }));
    setInvoiceItems(updated);
  }, [invoiceItems.map((item) => item.rate + item.quantity).join(",")]);

  const addLineItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      { id: uuidv4(), description: "", quantity: 1, rate: 0, amount: 0 },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (
    id: string,
    field: string,
    value: string | number
  ) => {
    setInvoiceItems(
      invoiceItems.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
              amount:
                field === "rate"
                  ? (value as number) * item.quantity
                  : field === "quantity"
                    ? item.rate * (value as number)
                    : item.amount,
            }
          : item
      )
    );
  };

  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateMarkup = () => {
    return showMarkup ? calculateSubtotal() * (markupPercentage / 100) : 0;
  };

  const calculateDiscount = () => {
    return showDiscount ? discountAmount : 0;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const markup = calculateMarkup();
    const discount = calculateDiscount();
    return applyTax ? (subtotal + markup - discount) * (taxRate / 100) : 0;
  };

  const calculateDeposit = () => {
    return showDeposit ? depositAmount : 0;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const markup = calculateMarkup();
    const discount = calculateDiscount();
    const tax = calculateTax();
    return subtotal + markup - discount + tax;
  };

  const handleSelectProject = (projectId: string) => {
    if (projectId === 'none') {
      setProjectId("");
      setProjectName("");
      return;
    }
    
    const project = projects.find((p) => p.publicId === projectId);
    if (project) {
      setProjectId(project.publicId);
      setProjectName(project.name);
      setClientName(project.clientName || "");
      setClientEmail(project.clientEmail || "");
    }
  };

  const handleAddSavedLineItem = (item: SavedLineItem) => {
    setInvoiceItems([
      ...invoiceItems,
      {
        id: uuidv4(),
        description: item.description,
        quantity: 1,
        rate: item.rate,
        amount: item.rate,
      },
    ]);
  };

  const saveInvoice = async () => {
    if (invoiceItems.length === 0) {
      toast.error("Please add at least one line item");
      return;
    }

    if (!clientName) {
      toast.error("Please enter a client name");
      return;
    }

    setIsSaving(true);

    try {
      // Update the invoice with new data
      const updates = {
        number: invoiceNumber,
        clientName,
        clientEmail,
        projectName,
        projectPublicId: projectId,
        poNumber,
        invoiceDate: invoiceDate.toISOString(),
        dueDate: dueDate.toISOString(),
        subtotal: calculateSubtotal(),
        markupPercentage: showMarkup ? markupPercentage : undefined,
        markupAmount: calculateMarkup(),
        discountAmount: calculateDiscount(),
        taxRate: applyTax ? taxRate : undefined,
        taxAmount: calculateTax(),
        depositAmount: calculateDeposit(),
        amount: calculateTotal(),
        notes,
        terms,
      };

      const result = await updateInvoice(invoiceId, updates);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Invoice updated successfully");
        router.push(`/invoices/${invoiceId}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update invoice");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <LoadingPlaceholder />;
  }

  return (
    <div className='container mx-auto py-8'>
      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center'>
          <Button
            variant='outline'
            onClick={() => router.push(`/invoices/${invoiceId}`)}
            className='mr-4'
          >
            <ArrowLeft className='mr-2 size-4' /> Back
          </Button>
          <h1 className='text-2xl font-bold'>Edit Invoice</h1>
        </div>
        <Button onClick={saveInvoice} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='invoiceNumber'>Invoice Number</Label>
              <Input
                id='invoiceNumber'
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder='INV-0001'
              />
            </div>

            <div>
              <Label htmlFor='invoiceDate'>Invoice Date</Label>
              <DateTimePicker
                date={invoiceDate}
                setDate={(date: Date) => setInvoiceDate(date)}
              />
            </div>

            <div>
              <Label htmlFor='daysUntilDue'>Days Until Due</Label>
              <Input
                id='daysUntilDue'
                type='number'
                value={daysUntilDue}
                onChange={(e) => setDaysUntilDue(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor='dueDate'>Due Date</Label>
              <DateTimePicker
                date={dueDate}
                setDate={(date: Date) => setDueDate(date)}
              />
            </div>

            <div>
              <Label htmlFor='poNumber'>PO Number (Optional)</Label>
              <Input
                id='poNumber'
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder='PO-12345'
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='clientName'>Client Name</Label>
              <Input
                id='clientName'
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder='Client Name'
              />
            </div>

            <div>
              <Label htmlFor='clientEmail'>Client Email (Optional)</Label>
              <Input
                id='clientEmail'
                type='email'
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder='client@example.com'
              />
            </div>

            <div>
              <Label htmlFor='project'>Project</Label>
              <Select
                value={projectId || 'none'}
                onValueChange={handleSelectProject}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select a project' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='none'>None</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.publicId} value={project.publicId}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor='projectName'>Project Name</Label>
              <Input
                id='projectName'
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder='Project Name'
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Options</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Switch
                id='showMarkup'
                checked={showMarkup}
                onCheckedChange={setShowMarkup}
              />
              <Label htmlFor='showMarkup'>Add Markup</Label>
            </div>

            {showMarkup && (
              <div>
                <Label htmlFor='markupPercentage'>Markup (%)</Label>
                <Input
                  id='markupPercentage'
                  type='number'
                  value={markupPercentage}
                  onChange={(e) =>
                    setMarkupPercentage(parseFloat(e.target.value))
                  }
                />
              </div>
            )}

            <div className='flex items-center space-x-2'>
              <Switch
                id='showDiscount'
                checked={showDiscount}
                onCheckedChange={setShowDiscount}
              />
              <Label htmlFor='showDiscount'>Add Discount</Label>
            </div>

            {showDiscount && (
              <div>
                <Label htmlFor='discountAmount'>Discount Amount</Label>
                <Input
                  id='discountAmount'
                  type='number'
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value))}
                />
              </div>
            )}

            <div className='flex items-center space-x-2'>
              <Switch
                id='applyTax'
                checked={applyTax}
                onCheckedChange={setApplyTax}
              />
              <Label htmlFor='applyTax'>Apply Tax</Label>
            </div>

            {applyTax && (
              <div>
                <Label htmlFor='taxRate'>Tax Rate (%)</Label>
                <Input
                  id='taxRate'
                  type='number'
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                />
              </div>
            )}

            <div className='flex items-center space-x-2'>
              <Switch
                id='showDeposit'
                checked={showDeposit}
                onCheckedChange={setShowDeposit}
              />
              <Label htmlFor='showDeposit'>Add Deposit</Label>
            </div>

            {showDeposit && (
              <div>
                <Label htmlFor='depositAmount'>Deposit Amount</Label>
                <Input
                  id='depositAmount'
                  type='number'
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(parseFloat(e.target.value))}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className='mt-6'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Line Items</CardTitle>
          <div className='flex space-x-2'>
            <Dialog
              open={showSavedItemsDialog}
              onOpenChange={setShowSavedItemsDialog}
            >
              <DialogTrigger asChild>
                <Button variant='outline'>
                  <Plus className='mr-2 size-4' />
                  Add Saved Items
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-md md:max-w-2xl'>
                <DialogHeader>
                  <DialogTitle>Add Saved Items</DialogTitle>
                  <DialogDescription>
                    Select items to add to your invoice
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="w-full justify-start mb-4 overflow-x-auto">
                    <TabsTrigger 
                      value="all" 
                      onClick={() => setSelectedCategory("all")}
                    >
                      All Items
                    </TabsTrigger>
                    {getCategories().map(category => (
                      <TabsTrigger 
                        key={category} 
                        value={category}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {filteredSavedItems().map((item) => (
                        <Button
                          key={item.publicId}
                          variant='outline'
                          className='flex h-auto justify-between p-4'
                          onClick={() => {
                            handleAddSavedLineItem(item);
                            setShowSavedItemsDialog(false);
                          }}
                        >
                          <div className='truncate text-left'>
                            <div className='font-medium'>{item.description}</div>
                            <div className='text-sm text-muted-foreground'>
                              ${item.rate.toFixed(2)}
                              {item.category && (
                                <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded-sm">
                                  {item.category}
                                </span>
                              )}
                            </div>
                          </div>
                          <Plus className='ml-2 size-4 shrink-0' />
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </Tabs>
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant='outline'>Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button onClick={addLineItem}>
              <Plus className='mr-2 size-4' /> Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {invoiceItems.map((item) => (
              <div
                key={item.id}
                className='grid grid-cols-12 gap-4 rounded-md border p-4'
              >
                <div className='col-span-6'>
                  <Label htmlFor={`description-${item.id}`}>Description</Label>
                  <Input
                    id={`description-${item.id}`}
                    value={item.description}
                    onChange={(e) =>
                      updateLineItem(item.id, "description", e.target.value)
                    }
                    placeholder='Item description'
                  />
                </div>
                <div className='col-span-2'>
                  <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                  <Input
                    id={`quantity-${item.id}`}
                    type='number'
                    min='1'
                    value={item.quantity}
                    onChange={(e) =>
                      updateLineItem(
                        item.id,
                        "quantity",
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </div>
                <div className='col-span-2'>
                  <Label htmlFor={`rate-${item.id}`}>Rate</Label>
                  <Input
                    id={`rate-${item.id}`}
                    type='number'
                    min='0'
                    step='0.01'
                    value={item.rate}
                    onChange={(e) =>
                      updateLineItem(item.id, "rate", parseFloat(e.target.value))
                    }
                  />
                </div>
                <div className='col-span-1'>
                  <Label htmlFor={`amount-${item.id}`}>Amount</Label>
                  <div className='rounded-md border p-2'>
                    ${item.amount.toFixed(2)}
                  </div>
                </div>
                <div className='col-span-1 flex items-end justify-end'>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => removeLineItem(item.id)}
                    disabled={invoiceItems.length === 1}
                  >
                    <X className='size-4' />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className='mt-6'>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <Label htmlFor='notes'>Notes (Optional)</Label>
            <Textarea
              id='notes'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='Add any additional notes here...'
              className='min-h-[100px]'
            />
          </div>
          <div>
            <Label htmlFor='terms'>Terms (Optional)</Label>
            <Textarea
              id='terms'
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder='Add payment terms here...'
              className='min-h-[100px]'
            />
          </div>
        </CardContent>
      </Card>

      <div className='mt-6 flex justify-end'>
        <Card className='w-1/3'>
          <CardContent className='p-4'>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span>Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>

              {showMarkup && (
                <div className='flex justify-between'>
                  <span>Markup ({markupPercentage}%):</span>
                  <span>${calculateMarkup().toFixed(2)}</span>
                </div>
              )}

              {showDiscount && (
                <div className='flex justify-between'>
                  <span>Discount:</span>
                  <span>-${calculateDiscount().toFixed(2)}</span>
                </div>
              )}

              {applyTax && (
                <div className='flex justify-between'>
                  <span>Tax ({taxRate}%):</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
              )}

              <div className='flex justify-between border-t pt-2 font-bold'>
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>

              {showDeposit && (
                <>
                  <div className='flex justify-between'>
                    <span>Deposit:</span>
                    <span>${calculateDeposit().toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Balance Due:</span>
                    <span>
                      ${(calculateTotal() - calculateDeposit()).toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='mt-6 flex justify-between'>
        <Button
          variant='outline'
          onClick={() => router.push(`/invoices/${invoiceId}`)}
        >
          Cancel
        </Button>
        <Button onClick={saveInvoice} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default EditInvoice;
