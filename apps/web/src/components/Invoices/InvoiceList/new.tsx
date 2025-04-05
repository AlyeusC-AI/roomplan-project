import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LoadingPlaceholder } from "@components/ui/spinner";
import { invoicesStore } from "@atoms/invoices";
import { projectsStore } from "@atoms/projects";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { Switch } from "@/components/ui/switch";
import { createInvoice } from "@/services/api/invoices";
import { Database } from "@/types/database";

const CreateNewInvoice = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
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
  const [lineItems, setLineItems] = useState<
    Database["public"]["Tables"]["InvoiceItems"]["Insert"][]
  >([{ id: uuidv4(), description: "", quantity: 1, rate: 0, amount: 0 }]);
  const [showMarkup, setShowMarkup] = useState(false);
  const [markupPercentage, setMarkupPercentage] = useState(0);
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositPercentage, setDepositPercentage] = useState(50);
  const [showPaymentSchedule, setShowPaymentSchedule] = useState(false);
  const [taxRate, setTaxRate] = useState(0);
  const [applyTax, setApplyTax] = useState(false);
  const [showSavedItems, setShowSavedItems] = useState(false);

  const router = useRouter();
  const { addInvoice } = invoicesStore((state) => state);
  const { projects } = projectsStore((state) => state);
  const { savedLineItems } = invoicesStore((state) => state);

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

  const addSavedLineItem = (item: any) => {
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
    setShowSavedItems(false);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (
    id: string,
    field: keyof InvoiceItem,
    value: number
  ) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
              amount:
                field === "rate"
                  ? value * item.quantity
                  : field === "quantity"
                    ? item.rate * value
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
        setOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create invoice"
      );
      console.error(error);
    }
    setIsCreating(false);
  };

  const handleAddSavedLineItem = (item: SavedLineItem) => {
    const newItem: InvoiceItem = {
      description: item.description,
      quantity: 1,
      rate: item.rate,
      amount: item.rate,
    };
    setLineItems([...lineItems, newItem]);
    setShowSavedItems(false);
  };

  const handleAddBulkSavedLineItems = (itemIds: string[]) => {
    const newItems: InvoiceItem[] = itemIds
      .map((id) => {
        const savedItem = savedLineItems.find((item) => item.publicId === id);
        if (!savedItem) return null;
        return {
          description: savedItem.description,
          quantity: 1,
          rate: savedItem.rate,
          amount: savedItem.rate,
        };
      })
      .filter(Boolean) as InvoiceItem[];

    setLineItems([...lineItems, ...newItems]);
    setShowSavedItems(false);
  };

  if (isCreating) {
    return <LoadingPlaceholder />;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
          {isCreating ? (
            <DialogDescription>Creating invoice...</DialogDescription>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>
                  Create a new invoice for your client.
                </DialogDescription>
              </DialogHeader>
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
                    <Label htmlFor='invoice-date' className='text-right'>
                      Invoice Date
                    </Label>
                    <div className='col-span-3'>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !invoiceDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className='mr-2 size-4' />
                            {invoiceDate ? (
                              formatDate(invoiceDate)
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0'>
                          <Calendar
                            mode='single'
                            selected={invoiceDate}
                            onSelect={(date) => date && setInvoiceDate(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='project' className='text-right'>
                      Project
                    </Label>
                    <div className='col-span-3'>
                      <Select
                        onValueChange={handleProjectSelect}
                        value={projectId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select a project' />
                        </SelectTrigger>
                        <SelectContent>
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
                      <p className='mt-1 text-sm text-muted-foreground'>
                        Selecting a project will auto-fill client information
                      </p>
                    </div>
                  </div>

                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='client-name' className='text-right'>
                      Client Name
                    </Label>
                    <div className='col-span-3'>
                      <Input
                        id='client-name'
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className={cn(
                          projectId && clientName
                            ? "border-green-500 focus-visible:ring-green-500"
                            : ""
                        )}
                        required
                      />
                      {projectId && clientName && (
                        <p className='mt-1 text-xs text-green-600'>
                          Auto-filled from project
                        </p>
                      )}
                    </div>
                  </div>

                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='client-email' className='text-right'>
                      Client Email
                    </Label>
                    <div className='col-span-3'>
                      <Input
                        id='client-email'
                        type='email'
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className={cn(
                          projectId && clientEmail
                            ? "border-green-500 focus-visible:ring-green-500"
                            : ""
                        )}
                      />
                      {projectId && clientEmail && (
                        <p className='mt-1 text-xs text-green-600'>
                          Auto-filled from project
                        </p>
                      )}
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
                    <Label htmlFor='days-to-pay' className='text-right'>
                      Days to pay
                    </Label>
                    <Input
                      id='days-to-pay'
                      type='number'
                      value={daysToPay}
                      onChange={(e) => setDaysToPay(e.target.value)}
                      className='col-span-3'
                    />
                  </div>

                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='due-date' className='text-right'>
                      Due Date
                    </Label>
                    <div className='col-span-3'>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dueDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className='mr-2 size-4' />
                            {dueDate ? (
                              formatDate(dueDate)
                            ) : (
                              <span>Auto-calculated</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0'>
                          <Calendar
                            mode='single'
                            selected={dueDate}
                            onSelect={setDueDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
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

              <div className='mt-4'>
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
                            updateLineItem(
                              item.id,
                              "description",
                              Number(e.target.value)
                            )
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
                          className='text-center'
                        />
                      </div>
                      <div className='col-span-2 pt-2 text-right'>
                        {item.amount.toFixed(2)}
                      </div>
                      <div className='col-span-1 flex justify-end'>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => removeLineItem(item.id)}
                          disabled={lineItems.length <= 1}
                        >
                          <Trash2 className='size-4' />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    type='button'
                    variant='outline'
                    onClick={addLineItem}
                    className='mt-2 w-full'
                  >
                    <Plus className='mr-2 size-4' /> Add Line Item
                  </Button>

                  <Button
                    type='button'
                    variant='ghost'
                    onClick={() => setShowSavedItems(true)}
                    className='mt-2 w-full'
                  >
                    Add from Saved Items
                  </Button>
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

                  {showDeposit && (
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <span>Deposit</span>
                        <Input
                          type='number'
                          value={depositPercentage}
                          onChange={(e) =>
                            setDepositPercentage(
                              parseFloat(e.target.value) || 0
                            )
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
                      {showDeposit ? "Remove Deposit" : "Request a Deposit"}
                    </Button>
                  </div>

                  <div className='flex justify-between'>
                    <Button
                      type='button'
                      variant='link'
                      onClick={() =>
                        setShowPaymentSchedule(!showPaymentSchedule)
                      }
                      className='h-auto p-0 text-blue-500'
                    >
                      {showPaymentSchedule
                        ? "Remove Payment Schedule"
                        : "Add Payment Schedule"}
                    </Button>
                  </div>

                  {applyTax && (
                    <div className='flex justify-between'>
                      <span>Tax ({taxRate}%)</span>
                      <span>${calculateTax().toFixed(2)}</span>
                    </div>
                  )}

                  <div className='flex justify-between border-t pt-2 text-lg font-bold'>
                    <span>Total (USD)</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <DialogFooter className='mt-6'>
                <Button
                  onClick={() => setOpen(false)}
                  variant='secondary'
                  className='mr-2'
                >
                  Cancel
                </Button>
                <Button onClick={createNewInvoice} disabled={isCreating}>
                  Create Invoice
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showSavedItems} onOpenChange={setShowSavedItems}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select from Saved Line Items</DialogTitle>
            <DialogDescription>
              Choose from your saved line items to add to this invoice.
            </DialogDescription>
          </DialogHeader>

          {savedLineItems && savedLineItems.length > 0 ? (
            <div className='overflow-y-auto' style={{ maxHeight: "400px" }}>
              {/* Category section for bulk adding */}
              <div className='mb-4 border-b pb-4'>
                <h3 className='mb-2 text-sm font-medium'>Add by Category</h3>
                <div className='grid grid-cols-2 gap-2'>
                  {Array.from(
                    new Set(
                      savedLineItems
                        .map((item) => item.category)
                        .filter(Boolean)
                    )
                  ).map((category) => (
                    <Button
                      key={category as string}
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        const itemsInCategory = savedLineItems
                          .filter((item) => item.category === category)
                          .map((item) => item.publicId);
                        handleAddBulkSavedLineItems(itemsInCategory);
                      }}
                      className='justify-start overflow-hidden'
                    >
                      <span className='truncate'>{category as string}</span>
                      <span className='ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-xs'>
                        {
                          savedLineItems.filter(
                            (item) => item.category === category
                          ).length
                        }
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Individual items */}
              <div className='space-y-2'>
                {savedLineItems.map((item) => (
                  <div
                    key={item.publicId}
                    className='flex items-center justify-between rounded-md border p-3 hover:bg-muted'
                  >
                    <div>
                      <p className='font-medium'>{item.description}</p>
                      <p className='text-sm text-muted-foreground'>
                        Rate: {formatCurrency(item.rate)}
                        {item.category && ` • Category: ${item.category}`}
                      </p>
                    </div>
                    <Button
                      size='sm'
                      onClick={() => handleAddSavedLineItem(item)}
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='py-6 text-center'>
              <p className='text-muted-foreground'>No saved items found.</p>
              <Button
                variant='link'
                className='mt-2'
                onClick={() => {
                  setShowSavedItems(false);
                  router.push("/invoices/saved-items");
                }}
              >
                Go to Saved Items
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowSavedItems(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateNewInvoice;
