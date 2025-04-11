"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { LoadingPlaceholder } from "@components/ui/spinner";
import { Switch } from "@components/ui/switch";
import { DateTimePicker } from "@components/ui/date-time-picker";
import { projectsStore } from "@atoms/projects";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createEstimate } from "@/services/api/estimates";
import { estimatesStore } from "@atoms/estimates";
import { invoicesStore, SavedLineItem } from "@atoms/invoices";
import { formatCurrency } from "@lib/utils";

interface EstimateItem {
  id: string;
  description: string;
  detailedDescription?: string;
  quantity: number;
  rate: number;
  amount: number;
}

const CreateNewEstimate = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [showAdjuster, setShowAdjuster] = useState(false);
  const [adjusterName, setAdjusterName] = useState("");
  const [adjusterEmail, setAdjusterEmail] = useState("");
  const [adjusterPhone, setAdjusterPhone] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [daysValid, setDaysValid] = useState("30");
  const [isCreating, setIsCreating] = useState(false);
  const [estimateDate, setEstimateDate] = useState<Date>(new Date());
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([
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
  const [showSavedItems, setShowSavedItems] = useState(false);
  const [notes, setNotes] = useState("");
  const [projectSearchQuery, setProjectSearchQuery] = useState("");

  const router = useRouter();
  const { addEstimate } = estimatesStore((state) => state);
  const { projects } = projectsStore((state) => state);
  const { savedLineItems } = invoicesStore((state) => state);

  const filteredProjects = projects.filter((project) => {
    if (!projectSearchQuery.trim()) return true;

    const searchLower = projectSearchQuery.toLowerCase();
    return (
      project.name?.toLowerCase().includes(searchLower) ||
      project.clientName?.toLowerCase().includes(searchLower) ||
      project.location?.toLowerCase().includes(searchLower) ||
      project.clientPhoneNumber?.includes(searchLower)
    );
  });

  useEffect(() => {
    // Calculate expiry date based on days valid
    if (estimateDate && daysValid) {
      const expire = new Date(estimateDate);
      expire.setDate(expire.getDate() + parseInt(daysValid || "0"));
      setExpiryDate(expire);
    }
  }, [estimateDate, daysValid]);

  useEffect(() => {
    // Update line item amounts when rate or quantity changes
    const updated = estimateItems.map((item) => ({
      ...item,
      amount: item.rate * item.quantity,
    }));
    setEstimateItems(updated);
  }, [estimateItems.map((item) => item.rate + item.quantity).join(",")]);

  const addLineItem = () => {
    setEstimateItems([
      ...estimateItems,
      {
        id: uuidv4(),
        description: "",
        detailedDescription: "",
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ]);
  };

  const addSavedLineItem = (item: SavedLineItem) => {
    const newItem: EstimateItem = {
      id: uuidv4(),
      description: item.description,
      detailedDescription: "",
      quantity: 1,
      rate: item.rate,
      amount: item.rate,
    };
    setEstimateItems([...estimateItems, newItem]);
    setShowSavedItems(false);
  };

  const removeLineItem = (id: string) => {
    if (estimateItems.length > 1) {
      setEstimateItems(estimateItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (
    id: string,
    field: keyof EstimateItem,
    value: string | number
  ) => {
    setEstimateItems(
      estimateItems.map((item) =>
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
    return estimateItems.reduce((sum, item) => sum + item.amount, 0);
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

  const calculateDeposit = () => {
    return showDeposit ? calculateTotal() * (depositPercentage / 100) : 0;
  };

  const calculateTotal = () => {
    return (
      calculateSubtotal() +
      calculateMarkup() -
      calculateDiscount() +
      calculateTax()
    );
  };

  const handleSelectProject = (projectId: string) => {
    const selectedProject = projects.find((p) => p.publicId === projectId);
    if (selectedProject) {
      setProjectId(selectedProject.publicId);
      setProjectName(selectedProject.name);
      setClientName(selectedProject.clientName || "");
      setClientEmail(selectedProject.clientEmail || "");
      setClientAddress(selectedProject.location || "");
      setClientPhone(selectedProject.clientPhoneNumber || "");
    }
  };

  const createNewEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !clientName ||
      !projectName ||
      estimateItems.some((item) => !item.description)
    ) {
      return toast.error("Please fill in all required fields.");
    }

    setIsCreating(true);
    try {
      // Prepare the estimate data for API
      const estimateData = {
        estimate: {
          number: `EST-${Math.floor(Math.random() * 10000)}`,
          clientName,
          clientEmail,
          projectName,
          projectPublicId: projectId,
          estimateDate: estimateDate.toISOString(),
          expiryDate: expiryDate?.toISOString() || new Date().toISOString(),
          subtotal: calculateSubtotal(),
          markup: showMarkup ? markupPercentage : undefined,
          discount: showDiscount ? discountAmount : undefined,
          tax: applyTax ? taxRate : undefined,
          amount: calculateTotal(),
          deposit: showDeposit ? depositPercentage : undefined,
          status: "draft" as const,
          notes,
          adjusterName: showAdjuster ? adjusterName : undefined,
          adjusterEmail: showAdjuster ? adjusterEmail : undefined,
          adjusterPhone: showAdjuster ? adjusterPhone : undefined,
        },
        estimateItems: estimateItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          notes: item.detailedDescription,
        })),
      };

      // Call the API service
      const result = await createEstimate(estimateData);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.data) {
        // Add to local store
        addEstimate(result.data);
        toast.success("Estimate created successfully!");
        setOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create estimate"
      );
      console.error(error);
    }
    setIsCreating(false);
  };

  const handleAddSavedLineItem = (item: SavedLineItem) => {
    const newItem: EstimateItem = {
      id: uuidv4(),
      description: item.description,
      detailedDescription: "",
      quantity: 1,
      rate: item.rate,
      amount: item.rate,
    };
    setEstimateItems([...estimateItems, newItem]);
    setShowSavedItems(false);
  };

  const handleAddBulkSavedLineItems = (itemIds: string[]) => {
    const newItems: EstimateItem[] = itemIds
      .map((id) => {
        const savedItem = savedLineItems.find((item) => item.publicId === id);
        if (!savedItem) return null;
        return {
          id: uuidv4(),
          description: savedItem.description,
          detailedDescription: "",
          quantity: 1,
          rate: savedItem.rate,
          amount: savedItem.rate,
        };
      })
      .filter(Boolean) as EstimateItem[];

    setEstimateItems([...estimateItems, ...newItems]);
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
            <DialogDescription>Creating estimate...</DialogDescription>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Create New Estimate</DialogTitle>
                <DialogDescription>
                  Create a new estimate for your client.
                </DialogDescription>
              </DialogHeader>
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
                    <Label htmlFor='client-address' className='text-right'>
                      Client Address
                    </Label>
                    <Input
                      id='client-address'
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      className='col-span-3'
                    />
                  </div>

                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='client-phone' className='text-right'>
                      Client Phone
                    </Label>
                    <Input
                      id='client-phone'
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className='col-span-3'
                    />
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

                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='project-name' className='text-right'>
                      Project Name
                    </Label>
                    <div className='col-span-3'>
                      {projects.length > 0 ? (
                        <div className='space-y-2'>
                          <Input
                            placeholder='Search projects...'
                            value={projectSearchQuery}
                            onChange={(e) =>
                              setProjectSearchQuery(e.target.value)
                            }
                            className='mb-2'
                          />
                          <Select onValueChange={handleSelectProject}>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  projectName ||
                                  "Select a project or type manually"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent className='max-h-80'>
                              {filteredProjects.length === 0 ? (
                                <div className='px-2 py-1 text-sm text-muted-foreground'>
                                  No projects match your search
                                </div>
                              ) : (
                                filteredProjects.map((project) => (
                                  <SelectItem
                                    key={project.publicId}
                                    value={project.publicId}
                                  >
                                    <div>
                                      <div>{project.name}</div>
                                      {project.location && (
                                        <div className='text-xs text-muted-foreground'>
                                          {project.location}
                                        </div>
                                      )}
                                      {project.clientName && (
                                        <div className='text-xs text-muted-foreground'>
                                          {project.clientName}
                                        </div>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
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
                    <Label htmlFor='estimate-date' className='text-right'>
                      Estimate Date
                    </Label>
                    <div className='col-span-3'>
                      <DateTimePicker
                        date={estimateDate}
                        setDate={setEstimateDate}
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='expiry-date' className='text-right'>
                      Expiry Date
                    </Label>
                    <div className='col-span-3'>
                      <DateTimePicker
                        date={expiryDate || new Date()}
                        setDate={setExpiryDate}
                      />
                    </div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='days-valid' className='text-right'>
                      Days Valid
                    </Label>
                    <Input
                      id='days-valid'
                      type='number'
                      value={daysValid}
                      onChange={(e) => setDaysValid(e.target.value)}
                      className='col-span-3'
                    />
                  </div>

                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='notes' className='text-right'>
                      Notes
                    </Label>
                    <Input
                      id='notes'
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
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

              <div className='mt-4'>
                <div className='mb-2 flex justify-between'>
                  <h3 className='text-lg font-semibold'>Line Items</h3>
                  <div className='flex space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      type='button'
                      onClick={() => setShowSavedItems(true)}
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

                  {estimateItems.map((item) => (
                    <div
                      key={item.id}
                      className='mb-6 grid grid-cols-12 items-start gap-2'
                    >
                      <div className='col-span-6 space-y-2'>
                        <Input
                          value={item.description}
                          onChange={(e) =>
                            updateLineItem(
                              item.id,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder='Description'
                        />
                        <textarea
                          value={item.detailedDescription || ""}
                          onChange={(e) =>
                            updateLineItem(
                              item.id,
                              "detailedDescription",
                              e.target.value
                            )
                          }
                          className='min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                          placeholder='Additional details or notes for this item...'
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

              {/* Summary Section */}
              <div className='mt-6 space-y-4'>
                <h3 className='text-lg font-semibold'>Summary</h3>

                <div className='space-y-4 rounded-md border p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='font-medium'>Subtotal</div>
                    <div>{formatCurrency(calculateSubtotal())}</div>
                  </div>

                  {/* Markup Section */}
                  <div className='border-t pt-3'>
                    <div className='flex items-center justify-between'>
                      <div className='font-medium'>Markup</div>
                      {!showMarkup ? (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setShowMarkup(true)}
                        >
                          Add Markup
                        </Button>
                      ) : (
                        <div className='flex items-center gap-2'>
                          <div>{formatCurrency(calculateMarkup())}</div>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => setShowMarkup(false)}
                          >
                            <X className='size-4' />
                          </Button>
                        </div>
                      )}
                    </div>

                    {showMarkup && (
                      <div className='mt-2 grid grid-cols-2 items-center gap-4'>
                        <div className='flex items-center gap-2'>
                          <Input
                            type='number'
                            value={markupPercentage}
                            onChange={(e) =>
                              setMarkupPercentage(
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className='w-24'
                          />
                          <span>%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Discount Section */}
                  <div className='border-t pt-3'>
                    <div className='flex items-center justify-between'>
                      <div className='font-medium'>Discount</div>
                      {!showDiscount ? (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setShowDiscount(true)}
                        >
                          Add Discount
                        </Button>
                      ) : (
                        <div className='flex items-center gap-2'>
                          <div>-{formatCurrency(calculateDiscount())}</div>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => setShowDiscount(false)}
                          >
                            <X className='size-4' />
                          </Button>
                        </div>
                      )}
                    </div>

                    {showDiscount && (
                      <div className='mt-2 grid grid-cols-2 items-center gap-4'>
                        <div className='flex items-center gap-2'>
                          <span>$</span>
                          <Input
                            type='number'
                            value={discountAmount}
                            onChange={(e) =>
                              setDiscountAmount(parseFloat(e.target.value) || 0)
                            }
                            className='w-24'
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tax Section */}
                  <div className='border-t pt-3'>
                    <div className='flex items-center justify-between'>
                      <div className='font-medium'>Tax</div>
                      {!applyTax ? (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setApplyTax(true)}
                        >
                          Add Tax
                        </Button>
                      ) : (
                        <div className='flex items-center gap-2'>
                          <div>{formatCurrency(calculateTax())}</div>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => setApplyTax(false)}
                          >
                            <X className='size-4' />
                          </Button>
                        </div>
                      )}
                    </div>

                    {applyTax && (
                      <div className='mt-2 grid grid-cols-2 items-center gap-4'>
                        <div className='flex items-center gap-2'>
                          <Input
                            type='number'
                            value={taxRate}
                            onChange={(e) =>
                              setTaxRate(parseFloat(e.target.value) || 0)
                            }
                            className='w-24'
                          />
                          <span>%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Deposit Section */}
                  <div className='border-t pt-3'>
                    <div className='flex items-center justify-between'>
                      <div className='font-medium'>Request a Deposit</div>
                      {!showDeposit ? (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setShowDeposit(true)}
                        >
                          Add Deposit
                        </Button>
                      ) : (
                        <div className='flex items-center gap-2'>
                          <div>{formatCurrency(calculateDeposit())}</div>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => setShowDeposit(false)}
                          >
                            <X className='size-4' />
                          </Button>
                        </div>
                      )}
                    </div>

                    {showDeposit && (
                      <div className='mt-2 grid grid-cols-2 items-center gap-4'>
                        <div className='flex items-center gap-2'>
                          <Input
                            type='number'
                            value={depositPercentage}
                            onChange={(e) =>
                              setDepositPercentage(
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className='w-24'
                          />
                          <span>%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Schedule Section */}
                  <div className='border-t pt-3'>
                    <div className='flex items-center justify-between'>
                      <div className='font-medium'>Payment Schedule</div>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          toast.info("Payment schedule feature coming soon")
                        }
                      >
                        Add Schedule
                      </Button>
                    </div>
                  </div>

                  {/* Total Section */}
                  <div className='border-t pt-3'>
                    <div className='flex items-center justify-between'>
                      <div className='text-lg font-semibold'>Total (USD)</div>
                      <div className='text-lg font-semibold'>
                        {formatCurrency(calculateTotal())}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setOpen(false)}
                  type='button'
                >
                  Cancel
                </Button>
                <Button type='button' onClick={createNewEstimate}>
                  Create Estimate
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showSavedItems} onOpenChange={setShowSavedItems}>
        <DialogContent className='max-h-[80vh] max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Select from Saved Line Items</DialogTitle>
            <DialogDescription>
              Choose from your saved line items to add to this estimate.
            </DialogDescription>
          </DialogHeader>

          {savedLineItems && savedLineItems.length > 0 ? (
            <div className='overflow-y-auto' style={{ maxHeight: "600px" }}>
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

export default CreateNewEstimate;
