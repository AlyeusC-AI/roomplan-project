"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import AddressAutoComplete from "@/components/ui/address-automplete";
import {
  useCreateOrganization,
  useUpdateOrganization,
  useDeleteOrganization,
} from "@service-geek/api-client";
import type {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  Organization,
} from "@service-geek/api-client";
import type { AddressType } from "@/types/address";
import {
  AlertCircle,
  Trash2,
  Building2,
  Phone,
  MapPin,
  Users,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const sizeOptions = [
  { label: "1-10", value: 10 },
  { label: "11-50", value: 50 },
  { label: "51-100", value: 100 },
  { label: "101+", value: 101 },
];

interface OrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization?: Organization;
  mode?: "create" | "edit";
}

export function OrganizationModal({
  isOpen,
  onClose,
  organization,
  mode = "create",
}: OrganizationModalProps) {
  const [formData, setFormData] = useState<Partial<CreateOrganizationDto>>({
    name: "",
    phoneNumber: "",
    formattedAddress: "",
    lat: 0,
    lng: 0,
    city: "",
    region: "",
    postalCode: "",
    country: "",
    size: sizeOptions[0].value,
  });
  const [address, setAddress] = useState<AddressType | null>(null);
  const [addressSearch, setAddressSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const { mutate: createOrganization } = useCreateOrganization();
  const { mutate: updateOrganization } = useUpdateOrganization();
  const { mutate: deleteOrganization } = useDeleteOrganization();

  useEffect(() => {
    if (organization && mode === "edit") {
      setFormData({
        name: organization.name,
        phoneNumber: organization.phoneNumber || "",
        formattedAddress: organization.formattedAddress || "",
        lat: organization.lat || 0,
        lng: organization.lng || 0,
        city: organization.city || "",
        region: organization.region || "",
        postalCode: organization.postalCode || "",
        country: organization.country || "",
        size: organization.size || sizeOptions[0].value,
      });
      if (organization.formattedAddress) {
        setAddress({
          formattedAddress: organization.formattedAddress,
          lat: organization.lat || 0,
          lng: organization.lng || 0,
          city: organization.city || "",
          region: organization.region || "",
          postalCode: organization.postalCode || "",
          country: organization.country || "",
        });
      }
    } else {
      // Reset form when creating new
      setFormData({
        name: "",
        phoneNumber: "",
        formattedAddress: "",
        lat: 0,
        lng: 0,
        city: "",
        region: "",
        postalCode: "",
        country: "",
        size: sizeOptions[0].value,
      });
      setAddress(null);
      setAddressSearch("");
    }
  }, [organization, mode]);

  const handleInputChange = (
    field: keyof CreateOrganizationDto,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (newAddress: AddressType | null) => {
    setAddress(newAddress);
    if (newAddress) {
      setFormData((prev) => ({
        ...prev,
        formattedAddress: newAddress.formattedAddress,
        lat: newAddress.lat,
        lng: newAddress.lng,
        city: newAddress.city,
        region: newAddress.region,
        postalCode: newAddress.postalCode,
        country: newAddress.country,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Validate required fields
      if (!formData.name || !formData.formattedAddress || !formData.size) {
        toast.error("Please complete all required fields");
        setLoading(false);
        return;
      }

      if (mode === "create") {
        createOrganization(formData as CreateOrganizationDto, {
          onSuccess: () => {
            toast.success("Organization created successfully");
            onClose();
          },
          onSettled: () => {
            setLoading(false);
          },
        });
      } else {
        updateOrganization(
          { id: organization!.id, data: formData as UpdateOrganizationDto },
          {
            onSuccess: () => {
              toast.success("Organization updated successfully");
              onClose();
            },
            onSettled: () => {
              setLoading(false);
            },
          }
        );
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!organization) return;

    deleteOrganization(organization.id, {
      onSuccess: () => {
        toast.success("Organization deleted successfully");
        onClose();
      },
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader className='space-y-3'>
            <DialogTitle className='text-2xl font-semibold'>
              {mode === "create" ? "Create Organization" : "Edit Organization"}
            </DialogTitle>
            <DialogDescription className='text-base'>
              {mode === "create"
                ? "Create a new organization to manage your team and projects."
                : "Update your organization's information."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='name' className='text-sm font-medium'>
                  Organization Name *
                </Label>
                <div className='relative'>
                  <Building2 className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='name'
                    type='text'
                    placeholder='My Organization'
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className='pl-9'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='phoneNumber' className='text-sm font-medium'>
                  Phone Number
                </Label>
                <div className='relative'>
                  <Phone className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='phoneNumber'
                    type='tel'
                    placeholder='+1 (555) 000-0000'
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    className='pl-9'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='address' className='text-sm font-medium'>
                  Organization Address *
                </Label>
                <div className='relative'>
                  <MapPin className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                  <AddressAutoComplete
                    address={address}
                    setAddress={handleAddressChange}
                    searchInput={addressSearch}
                    setSearchInput={setAddressSearch}
                    dialogTitle='Organization Address'
                    placeholder={
                      address?.formattedAddress ??
                      "Enter your organization address"
                    }
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label className='text-sm font-medium'>
                  Organization Size *
                </Label>
                <div className='relative'>
                  <Users className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='outline'
                        type='button'
                        className='w-full justify-start pl-9'
                      >
                        {sizeOptions.find((opt) => opt.value === formData.size)
                          ?.label || "Select size"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='w-full'>
                      <DropdownMenuLabel>Organization Size</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup
                        value={formData.size?.toString()}
                        onValueChange={(value) =>
                          handleInputChange("size", parseInt(value))
                        }
                      >
                        {sizeOptions.map((option) => (
                          <DropdownMenuRadioItem
                            value={option.value.toString()}
                            key={option.value}
                            className='cursor-pointer'
                          >
                            {option.label}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            <DialogFooter className='flex justify-between gap-4 sm:gap-0'>
              {mode === "edit" && (
                <Button
                  type='button'
                  variant='destructive'
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className='flex items-center gap-2 transition-colors'
                >
                  <Trash2 className='h-4 w-4' />
                  Delete
                </Button>
              )}
              <div className='flex gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={onClose}
                  className='transition-colors'
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={loading}
                  className={cn("transition-colors", loading && "opacity-70")}
                >
                  {loading
                    ? mode === "create"
                      ? "Creating..."
                      : "Saving..."
                    : mode === "create"
                      ? "Create Organization"
                      : "Save Changes"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2 text-destructive'>
              <AlertCircle className='h-5 w-5' />
              Delete Organization
            </AlertDialogTitle>
            <AlertDialogDescription className='text-base'>
              Are you sure you want to delete this organization? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='gap-2 sm:gap-0'>
            <AlertDialogCancel className='mt-0'>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
