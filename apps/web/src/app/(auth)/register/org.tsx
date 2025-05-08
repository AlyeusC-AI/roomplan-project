"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { toast } from "sonner";
import AddressAutoComplete from "@components/ui/address-automplete";
import { useStepper } from "@components/ui/nyxbui/stepper";
import {
  useCreateOrganization,
  useCurrentUser,
} from "@service-geek/api-client";
import type { CreateOrganizationDto } from "@service-geek/api-client";
import type { AddressType } from "@/types/address";

const sizeOptions = [
  { label: "1-10", value: 10 },
  { label: "11-50", value: 50 },
  { label: "51-100", value: 100 },
  { label: "101+", value: 101 },
];

export function OrganizationForm() {
  const [formData, setFormData] = useState<Partial<CreateOrganizationDto>>({
    name: "",
    phoneNumber: "",
    address: "",
    size: sizeOptions[0].value,
  });
  const [address, setAddress] = useState<AddressType | null>(null);
  const [addressSearch, setAddressSearch] = useState("");
  const router = useRouter();
  const stepper = useStepper();
  const { mutate: createOrganization } = useCreateOrganization();
  const { data: user, isLoading: isUserLoading } = useCurrentUser();

  // Handle navigation based on user state
  useEffect(() => {
    if (isUserLoading) {
      return;
    }

    if (!user) {
      router.replace("/register?page=1");
      return;
    }

    if (!user.isEmailVerified) {
      router.replace("/register?page=2");
      return;
    }

    if (
      user.organizationMemberships &&
      user.organizationMemberships.length > 0
    ) {
      router.replace("/projects");
    }
  }, [user]);

  const [loading, setLoading] = useState(false);

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
        address: newAddress.formattedAddress,
        lat: newAddress.lat,
        lng: newAddress.lng,
      }));
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Validate required fields
      if (!formData.name || !formData.address || !formData.size) {
        toast.error("Please complete all required fields");
        setLoading(false);
        return;
      }

      createOrganization(formData as CreateOrganizationDto, {
        onSuccess: () => {
          toast.success("Organization created successfully");
          router.replace("/register?page=4");
          stepper.nextStep();
        },
        // onError: (error) => {
        //   toast.error(error.message || "Failed to create organization");
        // },
        onSettled: () => {
          setLoading(false);
        },
      });
    } catch (error) {
      toast.error(
        "An unexpected error occurred. Please refresh your browser and try again."
      );
      setLoading(false);
    }
  };

  if (isUserLoading || loading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <LoadingSpinner className='w-full' />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <form className='p-6 md:p-8' onSubmit={handleSignup}>
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col items-center text-center'>
          <h1 className='text-2xl font-bold'>Create Organization</h1>
          <p className='text-balance text-muted-foreground'>
            Let's get started by creating your organization.
          </p>
        </div>

        <div className='grid gap-2'>
          <Label htmlFor='name'>Organization Name *</Label>
          <Input
            id='name'
            type='text'
            placeholder='My Organization'
            required
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
        </div>

        <div className='grid gap-2'>
          <Label htmlFor='phoneNumber'>Phone Number</Label>
          <Input
            id='phoneNumber'
            type='tel'
            placeholder='+1 (555) 000-0000'
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
          />
        </div>

        <div className='grid gap-2'>
          <Label htmlFor='address'>Organization Address *</Label>
          <AddressAutoComplete
            placeholder='Enter your address'
            address={address}
            setAddress={handleAddressChange}
            searchInput={addressSearch}
            setSearchInput={setAddressSearch}
            dialogTitle='Organization Address'
          />
        </div>

        <div className='grid gap-2'>
          <Label>Organization Size *</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' type='button'>
                {sizeOptions.find((opt) => opt.value === formData.size)
                  ?.label || "Select size"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56'>
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
                  >
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button type='submit' className='w-full'>
          Create Organization
        </Button>
      </div>
    </form>
  );
}
