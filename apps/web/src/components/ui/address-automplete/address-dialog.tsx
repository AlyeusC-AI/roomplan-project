"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type React from "react";
import { type FormEvent, useEffect, useState } from "react";
import { type ZodError, z } from "zod";
import { FormMessages } from "@/components/form-messages";
import { Loader2 } from "lucide-react";

interface AddressDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  address: AddressType;
  setAddress: (address: AddressType) => void;
  dialogTitle: string;
  isLoading: boolean;
}

interface AddressFields {
  address?: string;
  city?: string;
  region?: string;
  postalCode?: string;
}

/**
 * Create a Zod schema for validating address fields.
 * Note that, different address vary from place to place.
 * This Schema makes sure that the required fields are filled.
 */
export function createAddressSchema(address: AddressFields) {
  let schema = {};

  if (address.address !== "") {
    schema = {
      ...schema,
      address: z.string().min(1, {
        message: "Address line 1 is required",
      }),
    };
  }

  if (address.city !== "") {
    schema = {
      ...schema,
      city: z.string().min(1, {
        message: "City is required",
      }),
    };
  }

  if (address.region !== "") {
    schema = {
      ...schema,
      region: z.string().min(1, {
        message: "State is required",
      }),
    };
  }

  if (address.postalCode !== "") {
    schema = {
      ...schema,
      postalCode: z.string().min(1, {
        message: "Postal code is required",
      }),
    };
  }

  return z.object(schema);
}

export default function AddressDialog(
  props: React.PropsWithChildren<AddressDialogProps>
) {
  const {
    children,
    dialogTitle,
    open,
    setOpen,
    address,
    setAddress,
    isLoading,
  } = props;

  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});

  const addressSchema = createAddressSchema({
    address: address.address,
    city: address.city,
    region: address.region,
    postalCode: address.postalCode,
  });

  /**
   * Handle form submission and save the address
   */
  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    try {
      addressSchema.parse({
        ...address,
        city,
        region,
        postalCode,
      });
    } catch (error) {
      const zodError = error as ZodError;
      const errorMap = zodError.flatten().fieldErrors;

      setErrorMap({
        address1: errorMap.address1?.[0] ?? "",
        city: errorMap.city?.[0] ?? "",
        region: errorMap.region?.[0] ?? "",
        postalCode: errorMap.postalCode?.[0] ?? "",
      });
      console.log("Errors", address);
      return;
    }

    if (
      postalCode !== address.postalCode ||
      address1 !== address.address ||
      city !== address.city ||
      region !== address.region
    ) {
      setAddress({
        ...address,
        city,
        region,
        postalCode,
      });
    }
    setOpen(false);
  };

  useEffect(() => {
    setAddress1(address.address);
    setPostalCode(address.postalCode);
    setCity(address.city);
    setRegion(address.region);

    if (!open) {
      setErrorMap({});
    }
  }, [address, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className='flex h-52 items-center justify-center'>
            <Loader2 className='size-6 animate-spin' />
          </div>
        ) : (
          <>
            <div className='space-y-4 pb-7'>
              <div className='space-y-0.5'>
                <Label htmlFor='address1'>Address line 1</Label>
                <Input
                  value={address1}
                  onChange={(e) => setAddress1(e.currentTarget.value)}
                  disabled={address?.address === ""}
                  id='address1'
                  name='address1'
                  placeholder='Address line 1'
                />
                {errorMap.address1 && (
                  <FormMessages
                    type='error'
                    className='pt-1 text-sm'
                    messages={[errorMap.address1]}
                  />
                )}
              </div>

              <div className='flex gap-4'>
                <div className='flex-1 space-y-0.5'>
                  <Label htmlFor='city'>City</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.currentTarget.value)}
                    disabled={address?.city === ""}
                    id='city'
                    name='city'
                    placeholder='City'
                  />
                  {errorMap.city && (
                    <FormMessages
                      type='error'
                      className='pt-1 text-sm'
                      messages={[errorMap.city]}
                    />
                  )}
                </div>
                <div className='flex-1 space-y-0.5'>
                  <Label htmlFor='region'>State / Province / Region</Label>
                  <Input
                    value={region}
                    onChange={(e) => setRegion(e.currentTarget.value)}
                    disabled={address?.region === ""}
                    id='region'
                    name='region'
                    placeholder='Region'
                  />
                  {errorMap.region && (
                    <FormMessages
                      type='error'
                      className='pt-1 text-sm'
                      messages={[errorMap.region]}
                    />
                  )}
                </div>
              </div>

              <div className='flex gap-4'>
                <div className='flex-1 space-y-0.5'>
                  <Label htmlFor='postalCode'>Postal Code</Label>
                  <Input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.currentTarget.value)}
                    disabled={address?.postalCode === ""}
                    id='postalCode'
                    name='postalCode'
                    placeholder='Postal Code'
                  />
                  {errorMap.postalCode && (
                    <FormMessages
                      type='error'
                      className='pt-1 text-sm'
                      messages={[errorMap.postalCode]}
                    />
                  )}
                </div>
                <div className='flex-1 space-y-0.5'>
                  <Label htmlFor='country'>Country</Label>
                  <Input
                    value={address?.country}
                    id='country'
                    disabled
                    name='country'
                    placeholder='Country'
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type='reset'
                onClick={() => setOpen(false)}
                variant={"outline"}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
