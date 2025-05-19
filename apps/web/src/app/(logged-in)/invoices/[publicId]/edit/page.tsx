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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EditInvoice = () => {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.publicId as string;

  // We can use '_invoice' for future enhancements
  const [, setInvoice] = useState<Invoice | null>(null);
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
    if (projectId === "none") {
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
    <div className='container mx-auto space-y-6 py-6'>
      <div className='flex items-center justify-between'>
        <Button variant='outline' onClick={() => router.back()}>
          <ArrowLeft className='mr-2 size-4' /> Back
        </Button>

        <div className='flex gap-2'>
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

      <Card>
        <CardHeader>
          <CardTitle>Edit Invoice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div className='space-y-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='invoice-number' className='text-right'>
                  Invoice #
                </Label>
                <Input
                  id='invoice-number'
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className='col-span-3'
                  required
                />
              </div>

              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='client-name' className='text-right'>
                  Client Name
                </Label>
                <Input
                  id='client-name'
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className='col-span-3'
                  required
                />
              </div>

              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='client-email' className='text-right'>
                  Client Email
                </Label>
                <Input
                  id='client-email'
                  type='email'
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className='col-span-3'
                />
              </div>

              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='project-name' className='text-right'>
                  Project Name
                </Label>
                <div className='col-span-3'>
                  {projects.length > 0 ? (
                    <Select
                      value={projectId || "none"}
                      onValueChange={handleSelectProject}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            projectName || "Select a project or type manually"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='none'>None</SelectItem>
                        {projects.map((project) => (
                          <SelectItem
                            key={project.publicId}
                            value={project.publicId}
                          >
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id='project-name'
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      required
                    />
                  )}
                </div>
              </div>

              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='invoice-date' className='text-right'>
                  Invoice Date
                </Label>
                <div className='col-span-3'>
                  <DateTimePicker date={invoiceDate} setDate={setInvoiceDate} />
                </div>
              </div>

              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='due-date' className='text-right'>
                  Due Date
                </Label>
                <div className='col-span-3'>
                  <DateTimePicker date={dueDate} setDate={setDueDate} />
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='po-number' className='text-right'>
                  PO Number
                </Label>
                <Input
                  id='po-number'
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className='col-span-3'
                />
              </div>

              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='days-until-due' className='text-right'>
                  Days Until Due
                </Label>
                <Input
                  id='days-until-due'
                  type='number'
                  value={daysUntilDue}
                  onChange={(e) => setDaysUntilDue(e.target.value)}
                  className='col-span-3'
                />
              </div>

              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='tax-rate' className='text-right'>
                  Tax Rate (%)
                </Label>
                <div className='col-span-2'>
                  <Input
                    id='tax-rate'
                    type='number'
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                    disabled={!applyTax}
                  />
                </div>
                <div className='flex items-center space-x-2'>
                  <Switch
                    id='apply-tax'
                    checked={applyTax}
                    onCheckedChange={setApplyTax}
                  />
                  <Label htmlFor='apply-tax'>Apply</Label>
                </div>
              </div>
            </div>
          </div>

          <div className='mt-6 space-y-4 rounded-md border p-4'>
            <h3 className='text-lg font-medium'>Additional Information</h3>
            <div className='grid grid-cols-1 gap-4'>
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
            </div>
          </div>

          <div className='mt-4'>
            <div className='mb-2 flex justify-between'>
              <h3 className='text-lg font-semibold'>Line Items</h3>
              <div className='flex space-x-2'>
                <Button
                  variant='outline'
                  size='sm'
                  type='button'
                  onClick={() => setShowSavedItemsDialog(true)}
                >
                  Add from Saved Items
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  type='button'
                  onClick={addLineItem}
                >
                  <Plus className='mr-1 size-4' /> Add Line Item
                </Button>
              </div>
            </div>

            <div className='rounded-md border p-4'>
              <div className='mb-2 grid grid-cols-12 gap-2 text-sm font-semibold'>
                <div className='col-span-6'>Description</div>
                <div className='col-span-2'>Rate</div>
                <div className='col-span-1 text-center'>Quantity</div>
                <div className='col-span-2 text-right'>Amount</div>
                <div className='col-span-1'></div>
              </div>

              {invoiceItems.map((item) => (
                <div
                  key={item.id}
                  className='mb-2 grid grid-cols-12 items-center gap-2'
                >
                  <div className='col-span-6'>
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        updateLineItem(item.id, "description", e.target.value)
                      }
                      placeholder='Description'
                    />
                  </div>
                  <div className='col-span-2'>
                    <Input
                      type='number'
                      value={item.rate || ""}
                      onChange={(e) =>
                        updateLineItem(
                          item.id,
                          "rate",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder='0.00'
                    />
                  </div>
                  <div className='col-span-1'>
                    <Input
                      type='number'
                      value={item.quantity || ""}
                      onChange={(e) =>
                        updateLineItem(
                          item.id,
                          "quantity",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder='1'
                      className='text-center'
                    />
                  </div>
                  <div className='col-span-2 text-right'>
                    ${item.amount.toFixed(2)}
                  </div>
                  <div className='col-span-1 text-right'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => removeLineItem(item.id)}
                    >
                      <X className='size-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='mt-4 grid grid-cols-2 gap-4'>
            <div></div>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span>Subtotal</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>

              {showMarkup && (
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <span>Markup</span>
                    <Input
                      type='number'
                      value={markupPercentage}
                      onChange={(e) =>
                        setMarkupPercentage(parseFloat(e.target.value) || 0)
                      }
                      className='h-8 w-16'
                    />
                    <span>%</span>
                  </div>
                  <span>${calculateMarkup().toFixed(2)}</span>
                </div>
              )}
              <div className='flex justify-between'>
                <Button
                  type='button'
                  variant='link'
                  onClick={() => setShowMarkup(!showMarkup)}
                  className='h-auto p-0 text-blue-500'
                >
                  {showMarkup ? "Remove Markup" : "Add Markup"}
                </Button>
              </div>

              {showDiscount && (
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <span>Discount</span>
                    <Input
                      type='number'
                      value={discountAmount}
                      onChange={(e) =>
                        setDiscountAmount(parseFloat(e.target.value) || 0)
                      }
                      className='h-8 w-20'
                    />
                  </div>
                  <span>-${calculateDiscount().toFixed(2)}</span>
                </div>
              )}
              <div className='flex justify-between'>
                <Button
                  type='button'
                  variant='link'
                  onClick={() => setShowDiscount(!showDiscount)}
                  className='h-auto p-0 text-blue-500'
                >
                  {showDiscount ? "Remove Discount" : "Add Discount"}
                </Button>
              </div>

              {applyTax && (
                <div className='flex justify-between'>
                  <span>Tax ({taxRate}%)</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
              )}

              {showDeposit && (
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <span>Deposit</span>
                    <Input
                      type='number'
                      value={depositAmount}
                      onChange={(e) =>
                        setDepositAmount(parseFloat(e.target.value) || 0)
                      }
                      className='h-8 w-20'
                    />
                  </div>
                  <span>${calculateDeposit().toFixed(2)}</span>
                </div>
              )}
              <div className='flex justify-between'>
                <Button
                  type='button'
                  variant='link'
                  onClick={() => setShowDeposit(!showDeposit)}
                  className='h-auto p-0 text-blue-500'
                >
                  {showDeposit ? "Remove Deposit" : "Add Deposit"}
                </Button>
              </div>

              <div className='border-t pt-2'>
                <div className='flex justify-between font-bold'>
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>

                {showDeposit && (
                  <div className='mt-1 flex justify-between'>
                    <span>Balance Due</span>
                    <span>
                      ${(calculateTotal() - calculateDeposit()).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saved Items Dialog */}
      <Dialog
        open={showSavedItemsDialog}
        onOpenChange={setShowSavedItemsDialog}
      >
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Add from Saved Items</DialogTitle>
          </DialogHeader>
          <Tabs
            defaultValue='all'
            className='w-full'
            onValueChange={setSelectedCategory}
          >
            <TabsList className='mb-4 grid grid-cols-4'>
              <TabsTrigger value='all'>All</TabsTrigger>
              {getCategories()
                .slice(0, 3)
                .map((category) => (
                  <TabsTrigger key={category} value={category}>
                    {category}
                  </TabsTrigger>
                ))}
            </TabsList>
          </Tabs>
          <ScrollArea className='max-h-[400px]'>
            <div className='space-y-2 p-1'>
              {filteredSavedItems().map((item) => (
                <Card key={item.publicId} className='hover:bg-gray-50'>
                  <CardContent className='flex items-center justify-between p-4'>
                    <div>
                      <h4 className='font-medium'>
                        {item.name || item.description}
                      </h4>
                      {item.name && (
                        <p className='text-sm text-gray-500'>
                          {item.description}
                        </p>
                      )}
                      {item.category && (
                        <div className='mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800'>
                          {item.category}
                        </div>
                      )}
                    </div>
                    <div className='text-right'>
                      <div className='font-medium'>${item.rate.toFixed(2)}</div>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleAddSavedLineItem(item)}
                      >
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredSavedItems().length === 0 && (
                <div className='py-4 text-center text-gray-500'>
                  No saved items found in this category.
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditInvoice;
