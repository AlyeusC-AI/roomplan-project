import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Printer, PenLine, Type, Undo, UserCircle } from "lucide-react";
import Image from "next/image";
import { WorkOrderFormData, CertificateFormData } from "../types/certificate";
import { SignatureDisplay } from "./SignatureDisplay";
import { CursiveSignature } from "./CursiveSignature";
import SignatureCanvas from "react-signature-canvas";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CertificateForm } from "./CertificateForm";
import { format } from "date-fns";
import { Organization } from "@service-geek/api-client";

// Add type declaration for ReactNativeWebView
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

interface WorkOrderCertificateProps {
  formData: WorkOrderFormData;
  onFormDataChange?: (data: Partial<CertificateFormData>) => void;
  isCustomer?: boolean;
  isRep?: boolean;
  id?: string;
  errors?: Record<string, string>;
  organization: Organization;
}

// Add safe JSON parse utility
function safeParseJSON(jsonString: string) {
  try {
    return JSON.parse(jsonString || "{}");
  } catch {
    return null;
  }
}

export const WorkOrderCertificate = ({
  formData,
  onFormDataChange,
  isCustomer,
  isRep,
  id,
  errors,
  organization,
}: WorkOrderCertificateProps) => {
  const orgLogoUrl = organization?.logo;
  const orgName = organization?.name || "-";
  const certificateRef = useRef<HTMLDivElement>(null);
  const [customerSignature, setCustomerSignature] =
    useState<SignatureCanvas | null>(null);
  const [representativeSignature, setRepresentativeSignature] =
    useState<SignatureCanvas | null>(null);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [isRepFormOpen, setIsRepFormOpen] = useState(false);
  const [showCursiveSignature, setShowCursiveSignature] = useState(false);
  const [cursiveName, setCursiveName] = useState("");

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
        .page-break {
          page-break-after: always;
          break-after: page;
          margin: 0;
          padding: 0;
        }
        img {
          max-width: 100%;
          height: auto;
        }
      }
    `,
  });

  const handleExport = () => {
    // Send message to WebView
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "EXPORT_PDF",
          data: {
            id: id,
            type: "work-order",
          },
        })
      );
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

  const handleCursiveSignatureChange = (signature: string) => {
    if (!onFormDataChange) return;

    if (isCustomer) {
      onFormDataChange({ customerSignature: signature });
    } else if (isRep) {
      onFormDataChange({ representativeSignature: signature });
    }
  };

  const handleFormDataChange = (data: Partial<WorkOrderFormData>) => {
    if (onFormDataChange) {
      onFormDataChange(data);
    }
  };

  const isWebView = typeof window !== "undefined" && window.ReactNativeWebView;

  const orgAddress = organization?.formattedAddress;

  return (
    <div className='p-4 sm:p-6 md:p-8'>
      <div className='relative'>
        <div className='mx-auto mb-4 flex max-w-4xl flex-col items-center justify-between gap-4 sm:flex-row sm:gap-0'>
          <div className='flex items-center gap-2'>
            {/* Add loading indicator if needed */}
          </div>
          <div className='flex flex-wrap gap-2'>
            {isRep && (
              <Dialog open={isRepFormOpen} onOpenChange={setIsRepFormOpen}>
                <DialogTrigger asChild>
                  <Button variant='outline' className='flex items-center gap-2'>
                    <UserCircle className='h-4 w-4' />
                    Representative Sign
                  </Button>
                </DialogTrigger>
                <DialogContent className='max-w-4xl'>
                  <DialogHeader className='mb-4'>
                    <DialogTitle>Representative Signature</DialogTitle>
                  </DialogHeader>
                  <div className='scrollbar-none max-h-[80vh] overflow-y-scroll'>
                    <CertificateForm
                      formData={formData}
                      onFormDataChange={handleFormDataChange}
                      errors={errors}
                    />
                    <div className='flex flex-col gap-4'>
                      <div>
                        <Label className='block py-4 text-sm'>
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
                                if (signatureData && onFormDataChange) {
                                  onFormDataChange({
                                    representativeSignature: signatureData,
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
                  <span className='inline'>Customer Signature</span>
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-4xl'>
                <DialogHeader>
                  <DialogTitle>Fill Customer Signature</DialogTitle>
                </DialogHeader>
                <div className='max-h-[80vh] overflow-y-auto'>
                  <div className='space-y-6 p-4'>
                    {/* <CertificateForm
                        formData={formData}
                        onFormDataChange={handleFormDataChange}
                        errors={errors}
                      /> */}
                    <div>
                      <Label className='text-sm'>Customer's Signature:</Label>
                      <div className='mb-2 flex gap-2'>
                        <Button
                          type='button'
                          variant={showCursiveSignature ? "default" : "outline"}
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
                              if (signatureData && onFormDataChange) {
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
                <span className=''>Print</span>
              </Button>
            )}
            {isWebView && (
              <Button
                variant='outline'
                onClick={handleExport}
                className='flex items-center gap-2'
              >
                <Printer className='h-4 w-4' />
                <span className=''>Export</span>
              </Button>
            )}
          </div>
        </div>
        <div ref={certificateRef}>
          <div className='mx-auto max-w-4xl rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 sm:p-6 md:p-8 print:border-none print:p-0 print:shadow-none'>
            {/* Header with Logo */}
            <div className='mb-4 flex flex-col items-center justify-between gap-4 sm:mb-6 sm:flex-row sm:gap-0 md:mb-8 print:mb-12'>
              <div className='text-center sm:text-left'>
                <h1 className='text-lg font-bold sm:text-xl print:text-2xl'>
                  {orgName}
                </h1>
                {orgAddress ? (
                  <div className='space-y-1'>
                    <p className='text-xs sm:text-sm print:text-base'>
                      {orgAddress}
                    </p>
                    <p className='text-xs sm:text-sm print:text-base'>
                      {organization.city}, {organization.region}{" "}
                      {organization.postalCode}
                    </p>
                  </div>
                ) : null}
                <p className='text-xs sm:text-sm print:text-base'>
                  {organization?.phoneNumber || "-"}
                </p>
                <p className='text-xs sm:text-sm print:text-base'>
                  {(organization as any)?.email || "-"}
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
                ) : null}
              </div>
            </div>

            <h2 className='mb-4 text-center text-base font-bold uppercase sm:text-lg md:mb-6'>
              WORK ORDER AGREEMENT TO PERFORM EMERGENCY SERVICES AND/OR DIRECT
              PAY AUTHORIZATION
            </h2>

            {/* Client Information in a more compact layout */}
            <div className='mb-4 space-y-2 sm:mb-6'>
              <div className='flex flex-col gap-2 sm:flex-row'>
                <div className='flex-1'>
                  <div className='flex gap-1'>
                    <span className='text-sm font-semibold'>Client Name:</span>
                    <span className='flex-1 border-b border-gray-300'>
                      {formData.customerName || "___________________"}
                    </span>
                  </div>
                </div>
                <div className='flex-1'>
                  <div className='flex gap-1'>
                    <span className='text-sm font-semibold'>
                      Insurance Company:
                    </span>
                    <span className='flex-1 border-b border-gray-300'>
                      {formData.insuranceCompany || "___________________"}
                    </span>
                  </div>
                </div>
              </div>

              <div className='flex flex-col gap-2 sm:flex-row'>
                <div className='flex-1'>
                  <div className='flex gap-1'>
                    <span className='text-sm font-semibold'>Address:</span>
                    <span className='flex-1 border-b border-gray-300'>
                      {formData.address || "___________________"}
                    </span>
                  </div>
                </div>
                <div className='flex-1'>
                  <div className='flex gap-1'>
                    <span className='text-sm font-semibold'>Claim Number:</span>
                    <span className='flex-1 border-b border-gray-300'>
                      {formData.claimNumber || "___________________"}
                    </span>
                  </div>
                </div>
              </div>

              <div className='flex flex-col gap-2 sm:flex-row'>
                <div className='flex-1'>
                  <div className='flex gap-1'>
                    <span className='text-sm font-semibold'>City:</span>
                    <span className='flex-1 border-b border-gray-300'>
                      {formData.city || "___________________"}
                    </span>
                  </div>
                </div>
                <div className='flex-1'>
                  <div className='flex gap-1'>
                    <span className='text-sm font-semibold'>
                      Policy Number:
                    </span>
                    <span className='flex-1 border-b border-gray-300'>
                      {formData.policyNumber || "___________________"}
                    </span>
                  </div>
                </div>
              </div>

              <div className='flex flex-col gap-2 sm:flex-row'>
                <div className='flex gap-2'>
                  <div className='w-1/2'>
                    <div className='flex gap-1'>
                      <span className='text-sm font-semibold'>State:</span>
                      <span className='flex-1 border-b border-gray-300'>
                        {formData.state || "___"}
                      </span>
                    </div>
                  </div>
                  <div className='w-1/2'>
                    <div className='flex gap-1'>
                      <span className='text-sm font-semibold'>Zip:</span>
                      <span className='flex-1 border-b border-gray-300'>
                        {formData.zip || "_____"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className='flex-1'>
                  <div className='flex gap-1'>
                    <span className='text-sm font-semibold'>Loss Type:</span>
                    <span className='flex-1 border-b border-gray-300'>
                      {formData.lossType || "___________________"}
                    </span>
                  </div>
                </div>
              </div>

              <div className='flex flex-col gap-2 sm:flex-row'>
                <div className='flex-1'>
                  <div className='flex gap-1'>
                    <span className='text-sm font-semibold'>Phone Number:</span>
                    <span className='flex-1 border-b border-gray-300'>
                      {formData.phoneNumber || "___________________"}
                    </span>
                  </div>
                </div>
                <div className='flex-1'>
                  <div className='flex gap-1'>
                    <span className='text-sm font-semibold'>Date of Loss:</span>
                    <span className='flex-1 border-b border-gray-300'>
                      {formData.dateOfLoss
                        ? format(new Date(formData.dateOfLoss), "MM/dd/yyyy")
                        : "___________________"}
                    </span>
                  </div>
                </div>
              </div>

              <div className='flex flex-col gap-2 sm:flex-row'>
                <div className='flex-1'>
                  <div className='flex gap-1'>
                    <span className='text-sm font-semibold'>
                      Email Address:
                    </span>
                    <span className='flex-1 border-b border-gray-300'>
                      {formData.email || "___________________"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Agreement Text */}
            <div className='mb-4 space-y-4 text-sm sm:mb-6'>
              <p>
                This agreement is made between the client listed above
                (hereinafter referred to as the "Client") and {orgName}{" "}
                (hereinafter referred to as the "Contractor"). The client has
                suffered a sudden loss to property.
              </p>
              <p className='page-break'>
                The client hereby authorizes the contractor to perform the
                following services to mitigate the loss and/or maintain a
                suitable living condition and/or comfort level: ALL EMERGENCY
                SERVICES NEEDED FOR WATER DAMAGES, FIRE DAMAGE, SEWAGE CLEAN-UP
                OR MOLD-REMEDIATION, MATERIAL AND ALL LABOR SERVICES NEEDED TO
                PERFORM WORK AT YOUR PROPERTY FOR SERVICE CALLS. The client
                certifies that the damaged property has appropriate insurance
                coverage to cover this loss and that the client is responsible
                for payment of any deductibles as well as any charges on the
                final billing for any services not covered by the client's
                insurance policy or paid by the client insurance company for any
                reason.
              </p>
              <p>
                Assignment of Benefits/Direct Pay: The client further authorizes
                and instructs the client insurance company listed above to pay
                directly to contractor (or to include the contractor as a
                co-payee on the check or draft) the amount shown on the final
                billing for all services rendered by the contractor. If for any
                reason the client's insurance company or any other third party
                payor should refuse or reject such assignment of such benefits,
                if other benefits are not assigned to the contractor, then the
                client agrees to forward to the contractor all insurance and
                other third-party payments that the client received for services
                rendered to the client immediately upon receipt. This
                aforementioned assignment shall continue and be valid until such
                time as the contractor has issued a final bill for work
                performed and said final bill has been paid in full.
              </p>
              <p className='font-semibold'>
                The client has read the conditions and understands that this
                form constitutes a contract for services
              </p>
              <p className='font-semibold'>Please Fill Out:</p>
            </div>

            {/* Signatures */}
            <div className='space-y-4'>
              <div className='flex flex-col gap-4 sm:flex-row sm:gap-8'>
                <div className='flex-1'>
                  <div className='flex gap-1'>
                    <span className='text-sm font-semibold'>
                      WORK ORDERED BY:
                    </span>
                    <div className='flex-1'>
                      <SignatureDisplay
                        signatureData={formData.customerSignature}
                      />
                    </div>
                  </div>
                </div>
                <div className='flex-1'>
                  <div className='flex gap-1'>
                    <span className='text-sm font-semibold'>DATE:</span>
                    <span className='flex-1 border-b border-gray-300'>
                      {formData.date || "___________________"}
                    </span>
                  </div>
                </div>
              </div>

              <div className='flex flex-col gap-4 sm:flex-row sm:gap-8'>
                <div className='flex-1'>
                  <div className='flex gap-2'>
                    <span className='text-sm font-semibold'>PRINT NAME:</span>
                    <span className='flex-1 border-b border-gray-300'>
                      {formData.customerName || "___________________"}
                    </span>
                  </div>
                </div>
                <div className='flex-1'>
                  <div className='flex gap-1'>
                    <span className='text-sm font-semibold'>DATE:</span>
                    <span className='flex-1 border-b border-gray-300'>
                      {formData.date || "___________________"}
                    </span>
                  </div>
                </div>
              </div>

              <div className='flex flex-col gap-4 sm:flex-row sm:gap-8'>
                <div className='flex-1'>
                  <div className='flex gap-1'>
                    <span className='text-sm font-semibold'>CONTRACTOR:</span>
                    <div className='flex-1'>
                      <SignatureDisplay
                        signatureData={formData.representativeSignature}
                      />
                    </div>
                  </div>
                </div>
                <div className='flex-1'>
                  <div className='flex gap-1'>
                    <span className='text-sm font-semibold'>DATE:</span>
                    <span className='flex-1 border-b border-gray-300'>
                      {formData.date || "___________________"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
