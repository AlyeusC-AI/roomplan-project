"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@lib/supabase/client";
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

const sizeOptions = ["1-10", "11-50", "50-100", "101+"];

export function OrganizationForm() {
  const [address, setAddress] = useState<AddressType | null>(null);
  const [addressSearch, setAddressSearch] = useState("");
  const [name, setName] = useState("");
  const [size, setSize] = useState(sizeOptions[0]);
  const router = useRouter();

  const supabase = createClient();
  const stepper = useStepper();

  useEffect(() => {
    stepper.setStep(2);
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      console.log(user?.user_metadata.organizationId);
      if (
        user &&
        user.email_confirmed_at &&
        user.user_metadata.organizationId
      ) {
        router.replace("/projects");
      } else if (!user?.email_confirmed_at) {
        router.replace("/login");
      }
    });
  });

  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!name || !size || !address) {
        toast.error("Please complete the form");
        setLoading(false);
        return;
      }

      const result = await fetch("/api/v1/organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          size,
          address: address?.formattedAddress,
          lat: address?.lat,
          lng: address?.lng,
        }),
      });

      if (!result.ok) {
        toast.error("An unexpected error occured. Please try again.");
        setLoading(false);
        return
      }

      setLoading(false);
      router.replace("/register?page=4");
      stepper.nextStep();
    } catch {
      toast.error(
        "An unexpected error occured. Please refresh your browser and try again."
      );
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <LoadingSpinner className='w-full' />
      </div>
    );
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
          <Label htmlFor='name'>Organization Name</Label>
          <Input
            id='name'
            type='text'
            placeholder='My Organization'
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='address'>Organization Address</Label>
          <AddressAutoComplete
            placeholder='Enter your address'
            address={address}
            setAddress={setAddress}
            searchInput={addressSearch}
            setSearchInput={setAddressSearch}
            dialogTitle='Organization Address'
          />
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='referral'>Organization Size</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline'>{size}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56'>
              <DropdownMenuLabel>Organization Size</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={size} onValueChange={setSize}>
                {sizeOptions.map((option) => (
                  <DropdownMenuRadioItem value={option} key={option}>
                    {option}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button type='submit' className='w-full'>
          Create Organization
        </Button>
        <div className='text-center text-sm'>
          Don&apos;t have an account?{" "}
          <a href='/register' className='underline underline-offset-4'>
            Sign up
          </a>
        </div>
      </div>
    </form>
  );
}
