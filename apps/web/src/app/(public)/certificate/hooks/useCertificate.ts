import { useState, useCallback, useEffect, useRef } from "react";
import { z } from "zod";
import {
  CertificateFormData,
  CertificateType,
  WorkOrderFormData,
} from "../types/certificate";
import { toast } from "sonner";
import { orgStore } from "@atoms/organization";
const baseFormSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  cellPhone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(1, "Address is required"),
  insuranceCompany: z.string().min(1, "Insurance company is required"),
  claimNumber: z.string().min(1, "Claim number is required"),
  policyNumber: z.string().min(1, "Policy number is required"),
  date: z.string(),
  representativeName: z.string().min(1, "Representative name is required"),
  type: z.enum(["cos", "auth", "work-order"]),
});

const workOrderFormSchema = baseFormSchema.extend({
  email: z.string().email("Valid email is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(5, "Valid ZIP code is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
});

export const useCertificate = (id?: string) => {
  const [formData, setFormData] = useState<CertificateFormData>({
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
    type: "cos",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const [isLoading, setIsLoading] = useState(false);
  const { setOrganization } = orgStore((state: any) => state);
  useEffect(() => {
    if (id) {
      fetchDocument();
    }
  }, [id]);
  useEffect(() => {
    if (id) {
      debouncedSave();
    }
  }, [formData]);
  const fetchDocument = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/v1/public/documents/${id}`);
      if (!response.ok) throw new Error("Failed to fetch document");

      const data = await response.json();
      const projectData = data.project as Project;
      const orgData = data.org as Organization;
      if (orgData) {
        setOrganization(orgData);
      }

      if (data.json) {
        const documentData = JSON.parse(data.json);
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
          lossType: documentData.lossType || projectData?.lossType,
          dateOfLoss: documentData.dateOfLoss || projectData?.dateOfLoss,
          email: documentData.email || projectData?.clientEmail,

          phoneNumber:
            documentData.phoneNumber || projectData?.clientPhoneNumber,

          type: data.name == "COS" ? "cos" : "auth",
        }));
      }
    } catch (error) {
      toast.error("Failed to load document");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

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
    }, 1000);
  }, [id, formData]);

  const updateDocument = async () => {
    try {
      const response = await fetch(`/api/v1/public/documents/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          json: JSON.stringify(formData),
        }),
      });

      if (!response.ok) throw new Error("Failed to update document");
    } catch (error) {
      console.error("Failed to auto-save document:", error);
    }
  };

  const validateForm = () => {
    try {
      const schema =
        formData.type === "auth" ? baseFormSchema : workOrderFormSchema;
      schema.parse(formData);
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

  const handleFormDataChange = useCallback(
    (data: Partial<CertificateFormData>) => {
      setFormData((prev) => {
        const newData = {
          ...prev,
          ...data,
        };

        // If changing to work-order type, initialize work order specific fields
        if (data.type === "auth" && prev.type !== "auth") {
          return {
            ...newData,
            email: "",
            city: "",
            state: "",
            zip: "",
            phoneNumber: "",
          } as WorkOrderFormData;
        }

        return newData;
      });

      // if (id) {
      //   debouncedSave();
      // }
    },
    [id]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    formData,
    errors,
    isSaving,
    isLoading,
    handleFormDataChange,
    validateForm,
  };
};
