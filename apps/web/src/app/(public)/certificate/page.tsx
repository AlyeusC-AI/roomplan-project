"use client";

import { useSearchParams } from "next/navigation";
import { Certificate } from "./components/Certificate";
import { useCertificate } from "./hooks/useCertificate";
import { CertificateType } from "./types/certificate";
import { useEffect } from "react";

export default function CertificatesPage() {
  const searchParams = useSearchParams();
  const isCustomer = searchParams.get("isCustomer");
  const isRep = searchParams.get("isRep");
  const type = searchParams.get("type") as CertificateType;
  const id = searchParams.get("id");

  const {
    formData,
    errors,
    isSaving,
    isLoading,
    handleFormDataChange,
    validateForm,
  } = useCertificate(id || undefined);
  console.log("🚀 ~ CertificatesPage ~ formData:", formData);

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <div className='h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500' />
          <p className='text-sm text-gray-500'>Loading certificate...</p>
        </div>
      </div>
    );
  }
  return (
    <Certificate
      formData={formData}
      onFormDataChange={handleFormDataChange}
      isCustomer={!!isCustomer}
      isRep={!!isRep}
      id={id || undefined}
      type={formData.type || undefined}
      errors={errors}
    />
  );
}
