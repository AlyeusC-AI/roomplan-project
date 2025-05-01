"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SignatureCanvas from "react-signature-canvas";
import { z } from "zod";
import { createClient } from "@lib/supabase/client";
import {
  Printer,
  Save,
  Undo,
  Droplets,
  PenLine,
  UserCircle,
  Type,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useReactToPrint } from "react-to-print";
import { orgStore } from "@atoms/organization";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Dancing_Script } from "next/font/google";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const formSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  cellPhone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(1, "Address is required"),
  insuranceCompany: z.string().min(1, "Insurance company is required"),
  claimNumber: z.string().min(1, "Claim number is required"),
  policyNumber: z.string().min(1, "Policy number is required"),
  date: z.string(),
  representativeName: z.string().min(1, "Representative name is required"),
});

const SignatureDisplay = ({ signatureData }: { signatureData?: string }) => {
  if (!signatureData) {
    return <div className='h-12 w-48 border-b border-gray-300' />;
  }

  return (
    <div className='w-48 border-b border-gray-300'>
      <img
        src={signatureData}
        alt='Signature'
        className='h-10 w-full object-cover'
        style={{
          transform: "scale(1.6)",
        }}
      />
    </div>
  );
};

const CursiveSignature = ({
  name,
  onSignatureChange,
}: {
  name: string;
  onSignatureChange: (signature: string) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevNameRef = useRef(name);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Only update if the name has actually changed
    if (name === prevNameRef.current) return;
    prevNameRef.current = name;

    // Set up canvas
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000";

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw cursive text with improved styling
    ctx.font = `italic 32px ${dancingScript.style.fontFamily}, cursive`;
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Add a subtle shadow for depth
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    // Draw the text
    ctx.fillText(name, canvas.width / 2, canvas.height / 2);

    // Reset shadow
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Convert to data URL and notify parent
    const dataUrl = canvas.toDataURL();
    onSignatureChange(dataUrl);
  }, [name, onSignatureChange]);

  return (
    <div className='relative'>
      <canvas
        ref={canvasRef}
        width={400}
        height={120}
        className='h-24 w-full rounded-md border bg-white'
      />
    </div>
  );
};

const EmptyCertificate = ({ formData }: { formData: any }) => {
  const { organization } = orgStore((state) => state);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const orgLogoUrl = organization?.publicId
    ? `${supabaseUrl}/storage/v1/object/public/org-pictures/${organization.publicId}/avatar.png`
    : null;
  const orgName = organization?.name || "-";

  return (
    <div className='mx-auto max-w-4xl rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 sm:p-6 md:p-8 print:border-none print:p-0 print:shadow-none'>
      {/* Header with Logo */}
      <div className='mb-6 flex flex-col items-center justify-between gap-4 sm:mb-8 sm:flex-row sm:gap-0 print:mb-12'>
        <div className='text-center sm:text-left'>
          <h1 className='text-lg font-bold sm:text-xl print:text-2xl'>
            {orgName}
          </h1>
          {organization?.address ? (
            <div>
              <p className='text-xs sm:text-sm print:text-base'>
                {JSON.parse(organization.address).address}
              </p>
              <p className='text-xs sm:text-sm print:text-base'>
                {JSON.parse(organization.address).city},{" "}
                {JSON.parse(organization.address).region}{" "}
                {JSON.parse(organization.address).postalCode}
              </p>
            </div>
          ) : (
            <>
              <p className='text-xs sm:text-sm print:text-base'>-</p>
              <p className='text-xs sm:text-sm print:text-base'>-</p>
            </>
          )}
          <p className='text-xs sm:text-sm print:text-base'>
            {organization?.phoneNumber || "-"}
          </p>
        </div>
        <div className='flex flex-col items-center'>
          {orgLogoUrl ? (
            <div className='relative h-10 w-20 sm:h-12 sm:w-24 print:h-16 print:w-24'>
              <Image
                src={orgLogoUrl}
                alt='Organization Logo'
                fill
                className='object-contain'
              />
            </div>
          ) : (
            <Droplets className='h-10 w-10 text-blue-500 sm:h-12 sm:w-12 print:h-16 print:w-16' />
          )}
        </div>
      </div>

      <h2 className='mb-4 border-b pb-2 text-center text-base font-semibold dark:border-gray-700 sm:mb-6 sm:text-lg print:mb-8 print:pb-4 print:text-2xl'>
        Certificate of Satisfaction/Completion for Mitigation
      </h2>

      <div className='space-y-4 sm:space-y-6 print:space-y-8'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div>
            <span className='text-xs sm:text-sm'>Customer Name: </span>
            <span className='border-b border-gray-300 pb-1 dark:border-gray-700'>
              {formData.customerName || "___________________"}
            </span>
          </div>
          <div>
            <span className='text-xs sm:text-sm'>Cell Phone: </span>
            <span className='border-b border-gray-300 pb-1 dark:border-gray-700'>
              {formData.cellPhone || "___________________"}
            </span>
          </div>
        </div>

        <div>
          <span className='text-xs sm:text-sm'>Address: </span>
          <span className='mt-1 block border-b border-gray-300 pb-1 dark:border-gray-700'>
            {formData.address || "_________________________________"}
          </span>
        </div>

        <div>
          <span className='text-xs sm:text-sm'>Insurance Company: </span>
          <span className='mt-1 block border-b border-gray-300 pb-1 dark:border-gray-700'>
            {formData.insuranceCompany || "_________________________________"}
          </span>
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div>
            <span className='text-xs sm:text-sm'>Claim Number: </span>
            <span className='border-b border-gray-300 pb-1 dark:border-gray-700'>
              {formData.claimNumber || "___________________"}
            </span>
          </div>
          <div>
            <span className='text-xs sm:text-sm'>Policy Number: </span>
            <span className='border-b border-gray-300 pb-1 dark:border-gray-700'>
              {formData.policyNumber || "___________________"}
            </span>
          </div>
        </div>

        <div className='mt-4 space-y-4 text-xs sm:mt-6 sm:text-sm'>
          <p>
            I,{" "}
            <span className='border-b border-gray-300 pb-1 dark:border-gray-700'>
              {formData.customerName || "___________________"}
            </span>
            , have reviewed all of the repairs performed and completed by{" "}
            {orgName}, an independent contractor, and certify that all
            mitigation work performed and materials supplied by {orgName} is in
            accordance with the signed Work Authorization, and has been
            completed to my satisfaction.
          </p>
          <p>
            I agree to have my insurance list {orgName}, as payee on all
            settlement payments.
          </p>
        </div>

        <div className='mt-4 grid grid-cols-1 gap-4 sm:mt-6 sm:grid-cols-2'>
          <div>
            <span className='text-xs sm:text-sm'>Date: </span>
            <span className='border-b border-gray-300 pb-1 dark:border-gray-700'>
              {formData.date || "___________________"}
            </span>
          </div>
        </div>

        <div className='mt-6 space-y-4 sm:mt-8 sm:space-y-6'>
          <div className='grid grid-cols-1 gap-4'>
            <div className='space-y-4'>
              <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4'>
                <span className='min-w-24 text-xs sm:min-w-32 sm:text-sm'>
                  Customer's Name:
                </span>
                <span className='flex-1 border-b border-gray-300 pb-1 dark:border-gray-700'>
                  {formData.customerName || "___________________"}
                </span>
              </div>
              <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4'>
                <span className='min-w-24 text-xs sm:min-w-32 sm:text-sm'>
                  Customer's Signature:
                </span>
                <div className='flex-1'>
                  <SignatureDisplay
                    signatureData={formData.customerSignature}
                  />
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4'>
                <span className='min-w-24 text-xs sm:min-w-32 sm:text-sm'>
                  {orgName} Representative:
                </span>
                <span className='flex-1 border-b border-gray-300 pb-1 dark:border-gray-700'>
                  {formData.representativeName || "___________________"}
                </span>
              </div>
              <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4'>
                <span className='min-w-24 text-xs sm:min-w-32 sm:text-sm'>
                  {orgName} Rep Signature:
                </span>
                <div className='flex-1'>
                  <SignatureDisplay
                    signatureData={formData.representativeSignature}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CertificatePage() {
  const searchParams = useSearchParams();
  const isCustomer = searchParams.get("isCustomer");
  const isRep = searchParams.get("isRep");
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  const [formData, setFormData] = useState({
    customerName: "",
    cellPhone: "",
    address: "",
    insuranceCompany: "",
    claimNumber: "",
    policyNumber: "",
    date: new Date().toISOString().split("T")[0],
    representativeName: "",
    customerSignature: "",
    representativeSignature: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customerSignature, setCustomerSignature] =
    useState<SignatureCanvas | null>(null);
  const [representativeSignature, setRepresentativeSignature] =
    useState<SignatureCanvas | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [isRepFormOpen, setIsRepFormOpen] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const { organization, setOrganization } = orgStore((state) => state);
  const [showCursiveSignature, setShowCursiveSignature] = useState(false);
  const [cursiveName, setCursiveName] = useState("");

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
  }, [id]);

  const fetchDocument = async () => {
    try {
      const response = await fetch(`/api/v1/public/documents/${id}`);
      if (!response.ok) throw new Error("Failed to fetch document");

      const data = await response.json();
      if (data.org && !organization) {
        setOrganization(data.org);
      }
      if (data.json) {
        const documentData = JSON.parse(data.json);
        console.log("🚀 ~ fetchDocument ~ documentData:", documentData);
        const projectData = data.project as Project;
        setFormData((prev) => ({
          ...prev,
          ...(data.project || {}),
          ...documentData,
          customerName:
            prev.customerName ||
            documentData.customerName ||
            projectData?.clientName,
          cellPhone:
            prev.cellPhone ||
            documentData.cellPhone ||
            projectData?.clientPhoneNumber,
          address:
            prev.address || documentData.address || projectData?.location,
          insuranceCompany:
            prev.insuranceCompany ||
            documentData.insuranceCompany ||
            projectData?.insuranceCompanyName,
          claimNumber:
            prev.claimNumber ||
            documentData.claimNumber ||
            projectData?.insuranceClaimId,
          policyNumber:
            prev.policyNumber ||
            documentData.policyNumber ||
            projectData?.policyNumber,
          date: prev.date || documentData.date || projectData?.dateOfLoss,
          representativeName:
            prev.representativeName ||
            documentData.representativeName ||
            projectData?.adjusterName,
        }));

        // Set signatures if they exist
        if (documentData.customerSignature) {
          setFormData((prev) => ({
            ...prev,
            customerSignature: documentData.customerSignature,
          }));
          customerSignature?.fromDataURL(documentData.customerSignature);
        }
        if (documentData.representativeSignature) {
          setFormData((prev) => ({
            ...prev,
            representativeSignature: documentData.representativeSignature,
          }));
          representativeSignature?.fromDataURL(
            documentData.representativeSignature
          );
        }
      } else {
        // Auto-fill project data if available
        if (data.project) {
          const project = data.project;
          console.log("🚀 ~ fetchDocument ~ project:", project);

          setFormData((prev) => ({
            ...prev,
            customerName: project.customerName || prev.customerName,
            cellPhone: project.customerPhone || prev.cellPhone,
            address: project.address
              ? JSON.parse(project.address).address
              : prev.address,
            insuranceCompany: project.insuranceCompany || prev.insuranceCompany,
            claimNumber: project.claimNumber || prev.claimNumber,
            policyNumber: project.policyNumber || prev.policyNumber,
            date: project.date || prev.date,
          }));
        }
      }
      console.log("🚀 ~ fetchDocument ~ data.project:", data.project);
    } catch (error) {
      toast.error("Failed to load document");
      console.error(error);
    }
  };

  // Debounced save function
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await updateDocument();
      } catch (error) {
        console.error("Failed to auto-save document:", error);
      } finally {
        setIsSaving(false);
      }
    }, 1000); // 1 second delay
  }, [id, formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    // Trigger debounced save
    // if (id) {
    //   debouncedSave();
    // }
  };

  const updateDocument = async () => {
    try {
      console.log(
        "🚀 ~ updateDocument ~ customerSignature?.toDataURL():",
        formData
      );

      const response = await fetch(`/api/v1/public/documents/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          json: JSON.stringify({
            ...formData,
            // customerSignature: customerSignature?.toDataURL(),
            // representativeSignature: representativeSignature?.toDataURL(),
          }),
        }),
      });

      if (!response.ok) throw new Error("Failed to update document");
    } catch (error) {
      console.error("Failed to auto-save document:", error);
    }
  };

  const validateForm = () => {
    try {
      formSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: certificateRef,
    pageStyle: `
      @page {
        size: letter;
        margin: 0.5in;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        img {
          max-width: 100%;
          height: auto;
        }
      }
    `,
  });

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    if (!customerSignature || customerSignature.isEmpty()) {
      toast.error("Customer signature is required.");
      return;
    }

    if (!representativeSignature || representativeSignature.isEmpty()) {
      toast.error("Representative signature is required.");
      return;
    }

    setLoading(true);

    try {
      const customerSignatureData = customerSignature.toDataURL();
      const repSignatureData = representativeSignature.toDataURL();

      // Update the form data with signatures
      const updatedFormData = {
        ...formData,
        customerSignature: customerSignatureData,
        representativeSignature: repSignatureData,
      };

      setFormData(updatedFormData);

      if (id) {
        // Update existing document
        const response = await fetch(`/api/v1/public/documents/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            json: JSON.stringify(updatedFormData),
          }),
        });

        if (!response.ok) throw new Error("Failed to update document");
        toast.success("Certificate updated successfully!");
      } else {
        // Create new document
        const response = await fetch(`/api/v1/public/documents`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            json: JSON.stringify(updatedFormData),
            type: type || "cos",
          }),
        });

        if (!response.ok) throw new Error("Failed to create document");
        toast.success("Certificate saved successfully!");
      }

      setIsCustomerFormOpen(false);
      setIsRepFormOpen(false);
    } catch (error) {
      toast.error("Failed to save certificate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearCustomerSignature = () => {
    if (customerSignature) {
      customerSignature.clear();
    }
  };

  const clearRepresentativeSignature = () => {
    if (representativeSignature) {
      representativeSignature.clear();
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);
  useEffect(() => {
    debouncedSave();
  }, [formData]);

  const handleCursiveSignatureChange = (signature: string) => {
    if (isCustomer) {
      setFormData((prev) => ({
        ...prev,
        customerSignature: signature,
      }));
    } else if (isRep) {
      setFormData((prev) => ({
        ...prev,
        representativeSignature: signature,
      }));
    }
  };

  return (
    <div className='p-8'>
      <div className='relative'>
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            {isSaving && (
              <div className='flex items-center gap-2 text-sm text-gray-500'>
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                Saving...
              </div>
            )}
          </div>
          <div className='flex gap-2'>
            {isCustomer && (
              <Dialog
                open={isCustomerFormOpen}
                onOpenChange={setIsCustomerFormOpen}
              >
                <DialogTrigger asChild>
                  <Button className='flex items-center gap-2'>
                    <PenLine className='h-4 w-4' />
                    Customer Details
                  </Button>
                </DialogTrigger>
                <DialogContent className='max-w-4xl'>
                  <DialogHeader>
                    <DialogTitle>Fill Customer Details</DialogTitle>
                  </DialogHeader>
                  <div className='max-h-[80vh] overflow-y-auto'>
                    <div className='space-y-6 p-4'>
                      <div className='grid gap-4'>
                        <div>
                          <Label className='text-sm'>
                            Customer's Signature:
                          </Label>
                          <div className='mb-2 flex gap-2'>
                            <Button
                              type='button'
                              variant={
                                showCursiveSignature ? "default" : "outline"
                              }
                              size='sm'
                              onClick={() => setShowCursiveSignature(true)}
                              className='flex items-center gap-2'
                            >
                              <Type className='h-4 w-4' />
                              Type Signature
                            </Button>
                            <Button
                              type='button'
                              variant={
                                !showCursiveSignature ? "default" : "outline"
                              }
                              size='sm'
                              onClick={() => setShowCursiveSignature(false)}
                              className='flex items-center gap-2'
                            >
                              <PenLine className='h-4 w-4' />
                              Draw Signature
                            </Button>
                          </div>
                          {showCursiveSignature ? (
                            <div className='space-y-4'>
                              <Input
                                placeholder='Type your name'
                                value={cursiveName}
                                onChange={(e) => setCursiveName(e.target.value)}
                                className='border-b border-gray-300'
                              />
                              <CursiveSignature
                                name={cursiveName}
                                onSignatureChange={handleCursiveSignatureChange}
                              />
                            </div>
                          ) : (
                            <div className='relative mt-2 rounded-md border bg-white'>
                              <SignatureCanvas
                                ref={(ref) => setCustomerSignature(ref)}
                                canvasProps={{
                                  className: "signature-canvas w-full h-24",
                                }}
                                onEnd={() => {
                                  const signatureData =
                                    customerSignature?.toDataURL();
                                  if (signatureData) {
                                    setFormData((prev) => ({
                                      ...prev,
                                      customerSignature: signatureData,
                                    }));
                                  }
                                }}
                              />
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                className='absolute right-2 top-2'
                                onClick={clearCustomerSignature}
                              >
                                <Undo className='h-4 w-4' />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='block'>
                    <Button
                      type='button'
                      className='w-full'
                      onClick={() => {
                        setIsCustomerFormOpen(false);
                        toast.success("Customer details saved");
                      }}
                    >
                      Done
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {isRep && id && (
              <Dialog open={isRepFormOpen} onOpenChange={setIsRepFormOpen}>
                <DialogTrigger asChild>
                  <Button variant='outline' className='flex items-center gap-2'>
                    <UserCircle className='h-4 w-4' />
                    Representative Sign
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader className='mb-4'>
                    <DialogTitle> Representative Signature</DialogTitle>
                  </DialogHeader>
                  <div className='max-h-[80vh] overflow-y-auto'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <Label className='text-sm'>Customer Name:</Label>
                        <Input
                          name='customerName'
                          value={formData.customerName}
                          onChange={handleInputChange}
                          className='border-b border-gray-300'
                        />
                      </div>
                      <div>
                        <Label className='text-sm'>Cell Phone:</Label>
                        <Input
                          name='cellPhone'
                          value={formData.cellPhone}
                          onChange={handleInputChange}
                          className='border-b border-gray-300'
                        />
                      </div>
                    </div>

                    <div>
                      <Label className='text-sm'>Address:</Label>
                      <Input
                        name='address'
                        value={formData.address}
                        onChange={handleInputChange}
                        className='border-b border-gray-300'
                      />
                    </div>

                    <div>
                      <Label className='text-sm'>Insurance Company:</Label>
                      <Input
                        name='insuranceCompany'
                        value={formData.insuranceCompany}
                        onChange={handleInputChange}
                        className='border-b border-gray-300'
                      />
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <Label className='text-sm'>Claim Number:</Label>
                        <Input
                          name='claimNumber'
                          value={formData.claimNumber}
                          onChange={handleInputChange}
                          className='border-b border-gray-300'
                        />
                      </div>
                      <div>
                        <Label className='text-sm'>Policy Number:</Label>
                        <Input
                          name='policyNumber'
                          value={formData.policyNumber}
                          onChange={handleInputChange}
                          className='border-b border-gray-300'
                        />
                      </div>
                    </div>

                    <div>
                      <Label className='text-sm'>Date:</Label>
                      <Input
                        type='date'
                        name='date'
                        value={formData.date}
                        onChange={handleInputChange}
                        className='border-b border-gray-300'
                      />
                    </div>

                    <div className='flex flex-col gap-4'>
                      <div>
                        <Label className='block pb-2 text-sm'>
                          Representative Name:
                        </Label>
                        <Input
                          name='representativeName'
                          value={formData.representativeName}
                          onChange={handleInputChange}
                          className='border-b border-gray-300'
                        />
                      </div>
                      <div>
                        <Label className='block pb-2 text-sm'>
                          Representative Signature:
                        </Label>
                        <div className='flex gap-3 pb-4'>
                          <Button
                            type='button'
                            variant={
                              showCursiveSignature ? "default" : "outline"
                            }
                            size='sm'
                            onClick={() => setShowCursiveSignature(true)}
                            className='flex items-center gap-2'
                          >
                            <Type className='h-4 w-4' />
                            Type Signature
                          </Button>
                          <Button
                            type='button'
                            variant={
                              !showCursiveSignature ? "default" : "outline"
                            }
                            size='sm'
                            onClick={() => setShowCursiveSignature(false)}
                            className='flex items-center gap-2'
                          >
                            <PenLine className='h-4 w-4' />
                            Draw Signature
                          </Button>
                        </div>
                        {showCursiveSignature ? (
                          <div className='space-y-4'>
                            <Input
                              placeholder='Type your name'
                              value={cursiveName}
                              onChange={(e) => setCursiveName(e.target.value)}
                              className='border-b border-gray-300'
                            />
                            <CursiveSignature
                              name={cursiveName}
                              onSignatureChange={handleCursiveSignatureChange}
                            />
                          </div>
                        ) : (
                          <div className='relative mt-2 rounded-md border bg-white'>
                            <SignatureCanvas
                              ref={(ref) => setRepresentativeSignature(ref)}
                              canvasProps={{
                                className: "signature-canvas w-full h-24",
                              }}
                              onEnd={() => {
                                const signatureData =
                                  representativeSignature?.toDataURL();
                                if (signatureData) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    representativeSignature: signatureData,
                                  }));
                                }
                              }}
                            />
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              className='absolute right-2 top-2'
                              onClick={clearRepresentativeSignature}
                            >
                              <Undo className='h-4 w-4' />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className='block w-full gap-2 p-4'>
                      <Button
                        type='button'
                        className='w-full'
                        onClick={() => {
                          setIsRepFormOpen(false);
                          toast.success("Representative signature saved");
                        }}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Button
              variant='outline'
              onClick={handlePrint}
              className='flex items-center gap-2'
            >
              <Printer className='h-4 w-4' />
              Print
            </Button>
          </div>
        </div>
        <div ref={certificateRef}>
          <EmptyCertificate formData={formData} />
        </div>
      </div>
    </div>
  );
}
