import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
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

import { CertificateFormData, WorkOrderFormData } from "../types/certificate";
import { SignatureDisplay } from "./SignatureDisplay";
import { CursiveSignature } from "./CursiveSignature";
import { CertificateForm } from "./CertificateForm";
import SignatureCanvas from "react-signature-canvas";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { WorkOrderCertificate } from "./WorkOrderCertificate";

// Add type declaration for ReactNativeWebView
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

interface CertificateProps {
  formData: CertificateFormData;
  onFormDataChange: (data: Partial<CertificateFormData>) => void;
  isCustomer?: boolean;
  isRep?: boolean;
  id?: string;
  type?: "cos" | "auth" | "work-order";
  errors?: Record<string, string>;
}

// Add safe JSON parse utility
function safeParseJSON(jsonString: string) {
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

export const Certificate = ({
  formData,
  onFormDataChange,
  isCustomer,
  isRep,
  id,
  type,
  errors,
}: CertificateProps) => {
  const { organization } = orgStore((state) => state);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const orgLogoUrl = organization?.publicId
    ? `${supabaseUrl}/storage/v1/object/public/org-pictures/${organization.publicId}/avatar.png`
    : null;
  const orgName = organization?.name || "-";

  const [customerSignature, setCustomerSignature] =
    useState<SignatureCanvas | null>(null);
  const [representativeSignature, setRepresentativeSignature] =
    useState<SignatureCanvas | null>(null);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [isRepFormOpen, setIsRepFormOpen] = useState(false);
  const [showCursiveSignature, setShowCursiveSignature] = useState(false);
  const [cursiveName, setCursiveName] = useState("");
  const certificateRef = useRef<HTMLDivElement>(null);

  // Add safe JSON parse utility
  function safeParseJSON(jsonString: string) {
    try {
      return JSON.parse(jsonString || "{}");
    } catch {
      return null;
    }
  }

  const orgAddress = organization?.address
    ? safeParseJSON(organization.address)
    : null;

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
        /* Mobile-specific print styles */
        @media (max-width: 768px) {
          .certificate-content {
            padding: 0 !important;
            margin: 0 !important;
          }
          .certificate-section {
            page-break-inside: avoid;
            break-inside: avoid;
            margin-bottom: 1rem;
          }
          .signature-section {
            page-break-before: always;
            break-before: page;
            margin-top: 2rem;
          }
          /* Ensure text is readable on mobile */
          .text-xs, .text-sm {
            font-size: 12px !important;
          }
          /* Adjust spacing for mobile */
          .space-y-4 > * + * {
            margin-top: 1rem !important;
          }
          .space-y-6 > * + * {
            margin-top: 1.5rem !important;
          }
          /* Ensure signatures don't break across pages */
          .signature-display {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      }
    `,
  });

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

  const handleCursiveSignatureChange = (signature: string) => {
    if (isCustomer) {
      onFormDataChange({ customerSignature: signature });
    } else if (isRep) {
      onFormDataChange({ representativeSignature: signature });
    }
  };

  const handleExport = () => {
    // Send message to WebView
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "EXPORT_PDF",
          data: {
            id: id,
            type: formData.type,
          },
        })
      );
    }
  };

  const renderCertificate = () => {
    switch (formData.type) {
      case "auth":
        return (
          <WorkOrderCertificate
            formData={formData as WorkOrderFormData}
            onFormDataChange={onFormDataChange}
            isCustomer={isCustomer}
            isRep={isRep}
            id={id}
            errors={errors}
          />
        );
      case "cos":
      default:
        return (
          <div className='p-4'>
            <div className='relative'>
              <div className='mx-auto mb-4 flex max-w-4xl items-center justify-between'>
                <div className='flex items-center gap-2'>
                  {/* Add loading indicator if needed */}
                </div>
                <div className='flex gap-2'>
                  {isRep && id && (
                    <Dialog
                      open={isRepFormOpen}
                      onOpenChange={setIsRepFormOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant='outline'
                          className='flex items-center gap-2'
                        >
                          <UserCircle className='h-4 w-4' />
                          Representative Sign
                        </Button>
                      </DialogTrigger>
                      <DialogContent className='max-w-4xl'>
                        <DialogHeader className='mb-4'>
                          <DialogTitle>Representative Signature</DialogTitle>
                        </DialogHeader>
                        <div className='max-h-[80vh] overflow-y-auto'>
                          <CertificateForm
                            formData={formData}
                            onFormDataChange={onFormDataChange}
                            errors={errors}
                          />
                          <div className='flex flex-col gap-4'>
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
                                    !showCursiveSignature
                                      ? "default"
                                      : "outline"
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
                                    onChange={(e) =>
                                      setCursiveName(e.target.value)
                                    }
                                    className='border-b border-gray-300'
                                  />
                                  <CursiveSignature
                                    name={cursiveName}
                                    onSignatureChange={
                                      handleCursiveSignatureChange
                                    }
                                  />
                                </div>
                              ) : (
                                <div className='relative mt-2 rounded-md border bg-white'>
                                  <SignatureCanvas
                                    ref={(ref) =>
                                      setRepresentativeSignature(ref)
                                    }
                                    canvasProps={{
                                      className: "signature-canvas w-full h-24",
                                    }}
                                    onEnd={() => {
                                      const signatureData =
                                        representativeSignature?.toDataURL();
                                      if (signatureData) {
                                        onFormDataChange({
                                          representativeSignature:
                                            signatureData,
                                        });
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
                  <Dialog
                    open={isCustomerFormOpen}
                    onOpenChange={setIsCustomerFormOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className='flex items-center gap-2'>
                        <PenLine className='h-4 w-4' />
                        Customer Signature
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='max-w-4xl'>
                      <DialogHeader>
                        <DialogTitle>Fill Customer Signature</DialogTitle>
                      </DialogHeader>
                      <div className='max-h-[80vh] overflow-y-auto'>
                        <div className='space-y-6 p-4'>
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
                                  onChange={(e) =>
                                    setCursiveName(e.target.value)
                                  }
                                  className='border-b border-gray-300'
                                />
                                <CursiveSignature
                                  name={cursiveName}
                                  onSignatureChange={
                                    handleCursiveSignatureChange
                                  }
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
                                      onFormDataChange({
                                        customerSignature: signatureData,
                                      });
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
                      <div className='block'>
                        <Button
                          type='button'
                          className='w-full'
                          onClick={() => {
                            setIsCustomerFormOpen(false);
                            toast.success("Customer signature saved");
                          }}
                        >
                          Done
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {!isWebView && (
                    <Button
                      variant='outline'
                      onClick={handlePrint}
                      className='flex items-center gap-2'
                    >
                      <Printer className='h-4 w-4' />
                      Print
                    </Button>
                  )}
                  {isWebView && (
                    <Button
                      variant='outline'
                      onClick={handleExport}
                      className='flex items-center gap-2'
                    >
                      <Printer className='h-4 w-4' />
                      Export
                    </Button>
                  )}
                </div>
              </div>
              <div ref={certificateRef}>
                {/* Certificate content */}
                <div className='certificate-content mx-auto max-w-4xl rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 sm:p-6 md:p-8 print:border-none print:p-0 print:shadow-none'>
                  {/* Header with Logo */}
                  <div className='certificate-section mb-6 flex flex-col items-center justify-between gap-4 sm:mb-8 sm:flex-row sm:gap-0 print:mb-12'>
                    <div className='text-center sm:text-left'>
                      <h1 className='text-lg font-bold sm:text-xl print:text-2xl'>
                        {orgName}
                      </h1>
                      {orgAddress ? (
                        <div>
                          <p className='text-xs sm:text-sm print:text-base'>
                            {orgAddress.address}
                          </p>
                          <p className='text-xs sm:text-sm print:text-base'>
                            {orgAddress.city}, {orgAddress.region}{" "}
                            {orgAddress.postalCode}
                          </p>
                        </div>
                      ) : (
                        <>
                          <p className='text-xs sm:text-sm print:text-base'>
                            -
                          </p>
                          <p className='text-xs sm:text-sm print:text-base'>
                            -
                          </p>
                        </>
                      )}
                      <p className='text-xs sm:text-sm print:text-base'>
                        {organization?.phoneNumber || "-"}
                      </p>
                    </div>
                    <div className='flex flex-col items-center'>
                      {orgLogoUrl ? (
                        <div className='relative h-10 w-20 sm:h-12 sm:w-24 print:h-16 print:w-24'>
                          <img
                            src={orgLogoUrl}
                            alt='Organization Logo'
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
                    {/* Certificate content */}
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                      <div>
                        <span className='text-xs sm:text-sm'>
                          Customer Name:{" "}
                        </span>
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
                        {formData.address ||
                          "_________________________________"}
                      </span>
                    </div>

                    <div>
                      <span className='text-xs sm:text-sm'>
                        Insurance Company:{" "}
                      </span>
                      <span className='mt-1 block border-b border-gray-300 pb-1 dark:border-gray-700'>
                        {formData.insuranceCompany ||
                          "_________________________________"}
                      </span>
                    </div>

                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                      <div>
                        <span className='text-xs sm:text-sm'>
                          Claim Number:{" "}
                        </span>
                        <span className='border-b border-gray-300 pb-1 dark:border-gray-700'>
                          {formData.claimNumber || "___________________"}
                        </span>
                      </div>
                      <div>
                        <span className='text-xs sm:text-sm'>
                          Policy Number:{" "}
                        </span>
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
                        , have reviewed all of the repairs performed and
                        completed by {orgName}, an independent contractor, and
                        certify that all mitigation work performed and materials
                        supplied by {orgName} is in accordance with the signed
                        Work Authorization, and has been completed to my
                        satisfaction.
                      </p>
                      <p>
                        I agree to have my insurance list {orgName}, as payee on
                        all settlement payments.
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

                    <div className='signature-section mt-6 space-y-4 sm:mt-8 sm:space-y-6'>
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
                              {formData.representativeName ||
                                "___________________"}
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
              </div>
            </div>
          </div>
        );
    }
  };

  const isWebView = typeof window !== "undefined" && window.ReactNativeWebView;

  return <div>{renderCertificate()}</div>;
};
