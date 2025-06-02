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
import { toast } from "sonner";
import { ArrowLeft, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Textarea } from "@components/ui/textarea";
import {
  Estimate,
  EstimateItem,
  useGetEstimateById,
  useGetProjects,
  useUpdateEstimate,
} from "@service-geek/api-client";
import { getEstimateById } from "@services/api/estimates";

const EditEstimate = () => {
  const router = useRouter();
  const params = useParams();
  const estimateId = params.id as string;

  const [isSaving, setIsSaving] = useState(false);

  const [estimateNumber, setEstimateNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [daysValid, setDaysValid] = useState("30");
  const [estimateDate, setEstimateDate] = useState<Date>(new Date());
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [estimateItems, setEstimateItems] = useState<
    {
      // id: string;
      description: string;
      quantity: number;
      rate: number;
      amount: number;
    }[]
  >([]);
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
  const [terms, setTerms] = useState("");

  const { data: estimate, isLoading: loading } = useGetEstimateById(estimateId);
  const { data: projects } = useGetProjects();
  const { mutateAsync: updateEstimate } = useUpdateEstimate();
  useEffect(() => {
    if (estimate) {
      // Populate form fields
      setEstimateNumber(estimate.data.number);
      setClientName(estimate.data.clientName);
      setClientEmail(estimate.data.clientEmail || "");
      setProjectName(estimate.data.project?.name || "");
      setProjectId(estimate.data.project?.id || "");
      setPoNumber(estimate.data.poNumber || "");
      setEstimateDate(new Date(estimate.data.estimateDate));
      setExpiryDate(new Date(estimate.data.expiryDate));

      // Calculate days valid
      const estimateDateObj = new Date(estimate.data.estimateDate);
      const expiryDateObj = new Date(estimate.data.expiryDate);
      const diffTime = Math.abs(
        expiryDateObj.getTime() - estimateDateObj.getTime()
      );
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysValid(diffDays.toString());

      // Set markup if available
      if (estimate.data.markup) {
        setShowMarkup(true);
        setMarkupPercentage(estimate.data.markup);
      }

      // Set discount if available
      if (estimate.data.discount) {
        setShowDiscount(true);
        setDiscountAmount(estimate.data.discount);
      }

      // Set tax if available
      if (estimate.data.tax) {
        setApplyTax(true);
        setTaxRate(estimate.data.tax);
      }

      // Set deposit if available
      if (estimate.data.deposit) {
        setShowDeposit(true);
        setDepositPercentage(estimate.data.deposit);
      }

      // Set notes and terms
      setNotes(estimate.data.notes || "");
      setTerms(estimate.data.terms || "");

      // Set line items
      setEstimateItems(
        estimate.data.items.map((item) => ({
          // id: item.id,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
        }))
      );
    }
  }, [estimate]);

  // Calculate expiry date based on days valid
  useEffect(() => {
    if (estimateDate && daysValid) {
      const expire = new Date(estimateDate);
      expire.setDate(expire.getDate() + parseInt(daysValid || "0"));
      setExpiryDate(expire);
    }
  }, [estimateDate, daysValid]);

  // Update line item amounts when rate or quantity changes
  useEffect(() => {
    const updated = estimateItems.map((item) => ({
      ...item,
      amount: item.rate * item.quantity,
    }));
    setEstimateItems(updated);
  }, [estimateItems.map((item) => item.rate + item.quantity).join(",")]);

  const addLineItem = () => {
    setEstimateItems([
      ...estimateItems,
      { description: "", quantity: 1, rate: 0, amount: 0 },
    ]);
  };

  const removeLineItem = (index: number) => {
    // if (estimateItems.length > 1) {
    setEstimateItems(estimateItems.filter((item, i) => i !== index));
    // }
  };

  const updateLineItem = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setEstimateItems(
      estimateItems.map((item, i) =>
        i === index
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
    const selectedProject = projects?.data?.find((p) => p.id === projectId);
    if (selectedProject) {
      setProjectId(selectedProject.id);
      setProjectName(selectedProject.name);
      setClientName(selectedProject.clientName || "");
      setClientEmail(selectedProject.clientEmail || "");
    }
  };

  const handleAddSavedLineItem = (item: EstimateItem) => {
    const newItem = {
      // id: uuidv4(),
      description: item.description,
      quantity: 1,
      rate: item.rate,
      amount: item.rate,
    };
    setEstimateItems([...estimateItems, newItem]);
    setShowSavedItems(false);
  };

  const handleAddBulkSavedLineItems = (itemIds: string[]) => {
    const newItems = itemIds
      .map((id) => {
        const savedItem = estimate?.data.items.find((item) => item.id === id);
        if (!savedItem) return null;
        return {
          id: uuidv4(),
          description: savedItem.description,
          quantity: 1,
          rate: savedItem.rate,
          amount: savedItem.rate,
        };
      })
      .filter(Boolean) as {
      id: string;
      description: string;
      quantity: number;
      rate: number;
      amount: number;
    }[];

    setEstimateItems([...estimateItems, ...newItems]);
    setShowSavedItems(false);
  };

  const saveEstimate = async () => {
    if (
      !clientName ||
      // !projectName ||
      estimateItems.some((item) => !item.description)
    ) {
      return toast.error("Please fill in all required fields.");
    }

    setIsSaving(true);
    try {
      // Call the API service
      const result = await updateEstimate({
        id: estimateId,
        data: {
          number: estimateNumber,
          clientName,
          clientEmail,
          projectId,
          poNumber,
          estimateDate: estimateDate.toISOString(),
          expiryDate: expiryDate?.toISOString() || new Date().toISOString(),
          subtotal: calculateSubtotal(),
          markup: showMarkup ? markupPercentage : undefined,
          discount: showDiscount ? discountAmount : undefined,
          tax: applyTax ? taxRate : undefined,
          total: calculateTotal(),
          deposit: showDeposit ? depositPercentage : undefined,
          notes,
          terms,

          items: estimateItems.map((item) => ({
            // id: item.id,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
          })),
        },
      });

      toast.success("Estimate updated successfully!");
      router.push(`/estimates/${estimateId}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update estimate"
      );
      console.error(error);
    }
    setIsSaving(false);
  };

  if (loading) {
    return <LoadingPlaceholder />;
  }

  return (
    <div className='container mx-auto space-y-6 py-6'>
      <div className='flex items-center justify-between'>
        <Button variant='outline' onClick={() => router.back()}>
          <ArrowLeft className='mr-2 h-4 w-4' /> Back
        </Button>

        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={() => router.push(`/estimates/${estimateId}`)}
          >
            Cancel
          </Button>
          <Button onClick={saveEstimate} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Estimate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div className='space-y-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='estimate-number' className='text-right'>
                  Estimate #
                </Label>
                <Input
                  id='estimate-number'
                  value={estimateNumber}
                  onChange={(e) => setEstimateNumber(e.target.value)}
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
                  {projects?.data?.length && projects?.data?.length > 0 ? (
                    <Select
                      value={projectId}
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
                        {projects?.data?.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
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

          <div className='space-y-4 rounded-md border p-4'>
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

              {estimateItems.map((item, index) => (
                <div
                  key={index}
                  className='mb-2 grid grid-cols-12 items-center gap-2'
                >
                  <div className='col-span-6'>
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        updateLineItem(index, "description", e.target.value)
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
                          index,
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
                          index,
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
                      onClick={() => removeLineItem(index)}
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
                    <span>Balance Due (if approved)</span>
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

      {/* We need to handle the saved items dialog separately in a real implementation */}
    </div>
  );
};

export default EditEstimate;
