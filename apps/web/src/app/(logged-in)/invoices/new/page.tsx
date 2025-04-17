"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
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
import { createInvoice } from "@/services/api/invoices";
import { invoicesStore } from "@atoms/invoices";
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

const CreateInvoicePage = () => {
  const [invoiceNumber, setInvoiceNumber] = useState(
    `INV-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`
  );
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [daysToPay, setDaysToPay] = useState("30");
  const [isCreating, setIsCreating] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [lineItems, setLineItems] = useState<any[]>([
    { id: uuidv4(), description: "", quantity: 1, rate: 0, amount: 0 },
  ]);
  const [showMarkup, setShowMarkup] = useState(false);
  const [markupPercentage, setMarkupPercentage] = useState(0);
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositPercentage, setDepositPercentage] = useState(50);
  const [taxRate, setTaxRate] = useState(0);
  const [applyTax, setApplyTax] = useState(false);
  const [showSavedItems, setShowSavedItemsDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAdjuster, setShowAdjuster] = useState(false);
  const [adjusterName, setAdjusterName] = useState("");
  const [adjusterEmail, setAdjusterEmail] = useState("");
  const [adjusterPhone, setAdjusterPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");

  const router = useRouter();
  const { addInvoice } = invoicesStore((state) => state);
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

  useEffect(() => {
    // Calculate due date based on days to pay
    if (invoiceDate && daysToPay) {
      const due = new Date(invoiceDate);
      due.setDate(due.getDate() + parseInt(daysToPay || "0"));
      setDueDate(due);
    }
  }, [invoiceDate, daysToPay]);

  useEffect(() => {
    // Update line item amounts when rate or quantity changes
    const updated = lineItems.map((item) => ({
      ...item,
      amount: item.rate * item.quantity,
    }));
    setLineItems(updated);
  }, [lineItems.map((item) => item.rate + item.quantity).join(",")]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: uuidv4(), description: "", quantity: 1, rate: 0, amount: 0 },
    ]);
  };

  const handleAddSavedLineItem = (item: any) => {
    setLineItems([
      ...lineItems,
      {
        id: uuidv4(),
        description: item.description,
        quantity: 1,
        rate: item.rate,
        amount: item.rate,
      },
    ]);
    setShowSavedItemsDialog(false);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (
    id: string,
    field: string,
    value: string | number
  ) => {
    setLineItems(
      lineItems.map((item) =>
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
    return lineItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateMarkup = () => {
    return showMarkup ? calculateSubtotal() * (markupPercentage / 100) : 0;
  };

  const calculateDiscount = () => {
    return showDiscount ? discountAmount : 0;
  };

  const calculateTax = () => {
    const taxableAmount =
      calculateSubtotal() + calculateMarkup() - calculateDiscount();
    return applyTax ? taxableAmount * (taxRate / 100) : 0;
  };

  const calculateTotal = () => {
    return (
      calculateSubtotal() +
      calculateMarkup() -
      calculateDiscount() +
      calculateTax()
    );
  };

  const calculateDeposit = () => {
    return showDeposit ? calculateTotal() * (depositPercentage / 100) : 0;
  };

  const handleProjectSelect = (selectedProjectId: string) => {
    if (selectedProjectId === "none") {
      setProjectId("");
      setProjectName("");
      return;
    }

    const selectedProject = projects.find(
      (p) => p.publicId === selectedProjectId
    );
    if (selectedProject) {
      // Auto-fill project information
      setProjectId(selectedProject.publicId);
      setProjectName(selectedProject.name);

      // Auto-fill client information
      if (selectedProject.clientName) {
        setClientName(selectedProject.clientName);
      }

      if (selectedProject.clientEmail) {
        setClientEmail(selectedProject.clientEmail);
      }

      // Auto-fill adjuster information if available
      if (selectedProject.adjusterName) {
        setAdjusterName(selectedProject.adjusterName);
        setShowAdjuster(true);
      }

      if (selectedProject.adjusterEmail) {
        setAdjusterEmail(selectedProject.adjusterEmail);
      }

      if (selectedProject.adjusterPhoneNumber) {
        setAdjusterPhone(selectedProject.adjusterPhoneNumber);
      }

      // Attempt to auto-fill line items if this is a new invoice with empty descriptions
      if (lineItems.length === 1 && !lineItems[0].description) {
        // Check if the project has any default services or rates we can use
        // For now, we'll add a default item with the project name
        setLineItems([
          {
            id: lineItems[0].id,
            description: `${selectedProject.name} - Professional Services`,
            quantity: 1,
            rate: 0,
            amount: 0,
          },
        ]);
      }

      toast.success("Project details auto-filled successfully");
    }
  };

  const createNewInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !clientName ||
      !projectName ||
      lineItems.some((item) => !item.description)
    ) {
      return toast.error("Please fill in all required fields.");
    }

    setIsCreating(true);
    try {
      // Prepare the invoice data for API
      const invoiceData = {
        invoice: {
          number: invoiceNumber,
          clientName,
          clientEmail,
          projectPublicId: projectId,
          projectName,
          poNumber,
          invoiceDate: invoiceDate.toISOString(),
          dueDate: dueDate?.toISOString() || new Date().toISOString(),
          subtotal: calculateSubtotal(),
          markup: showMarkup ? markupPercentage : undefined,
          discount: showDiscount ? discountAmount : undefined,
          tax: applyTax ? taxRate : undefined,
          amount: calculateTotal(),
          deposit: showDeposit ? depositPercentage : undefined,
          adjusterName: showAdjuster ? adjusterName : undefined,
          adjusterEmail: showAdjuster ? adjusterEmail : undefined,
          adjusterPhone: showAdjuster ? adjusterPhone : undefined,
          notes,
          terms,
          status: "draft" as const,
        },
        invoiceItems: lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
        })),
      };

      // Call the API service
      const result = await createInvoice(invoiceData);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.data) {
        // Add to local store
        addInvoice(result.data);
        toast.success("Invoice created successfully!");
        router.push("/invoices");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className='container mx-auto space-y-6 py-6'>
      <div className='flex items-center justify-between'>
        <Button variant='outline' onClick={() => router.back()}>
          <ArrowLeft className='mr-2 h-4 w-4' /> Back
        </Button>

        <div className='flex gap-2'>
          <Button variant='outline' onClick={() => router.push("/invoices")}>
            Cancel
          </Button>
          <Button onClick={createNewInvoice} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Invoice"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Invoice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div className='space-y-4'>
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
                      onValueChange={handleProjectSelect}
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
                  <DateTimePicker
                    date={dueDate ?? new Date()}
                    setDate={setDueDate}
                  />
                </div>
              </div>

              {showAdjuster && (
                <>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='adjuster-name' className='text-right'>
                      Adjuster Name
                    </Label>
                    <Input
                      id='adjuster-name'
                      value={adjusterName}
                      onChange={(e) => setAdjusterName(e.target.value)}
                      className='col-span-3'
                    />
                  </div>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='adjuster-email' className='text-right'>
                      Adjuster Email
                    </Label>
                    <Input
                      id='adjuster-email'
                      type='email'
                      value={adjusterEmail}
                      onChange={(e) => setAdjusterEmail(e.target.value)}
                      className='col-span-3'
                    />
                  </div>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='adjuster-phone' className='text-right'>
                      Adjuster Phone
                    </Label>
                    <Input
                      id='adjuster-phone'
                      value={adjusterPhone}
                      onChange={(e) => setAdjusterPhone(e.target.value)}
                      className='col-span-3'
                    />
                  </div>
                </>
              )}
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
                  value={daysToPay}
                  onChange={(e) => setDaysToPay(e.target.value)}
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

              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='toggle-adjuster' className='text-right'>
                  Insurance Adjuster
                </Label>
                <div className='col-span-3 flex items-center'>
                  <Switch
                    id='toggle-adjuster'
                    checked={showAdjuster}
                    onCheckedChange={setShowAdjuster}
                  />
                  <Label htmlFor='toggle-adjuster' className='ml-2'>
                    {showAdjuster ? "Shown" : "Hidden"}
                  </Label>
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
                  <Plus className='mr-1 h-4 w-4' /> Add Line Item
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

              {lineItems.map((item) => (
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
                      <X className='h-4 w-4' />
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
                      value={depositPercentage}
                      onChange={(e) =>
                        setDepositPercentage(parseFloat(e.target.value) || 0)
                      }
                      className='h-8 w-16'
                    />
                    <span>%</span>
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
      <Dialog open={showSavedItems} onOpenChange={setShowSavedItemsDialog}>
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

export default CreateInvoicePage;
