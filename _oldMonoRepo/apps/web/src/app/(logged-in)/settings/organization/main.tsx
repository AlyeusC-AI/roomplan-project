"use client";

import { orgStore } from "@atoms/organization";
import OrgMembersSection from "@app/(logged-in)/settings/organization/members";
import AddressAutoComplete from "@components/ui/address-automplete";
import { Button } from "@components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import { Input } from "@components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createClient } from "@lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Label } from "@components/ui/label";
import { LoadingSpinner } from "@components/ui/spinner";
import { Separator } from "@components/ui/separator";

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Organization name must be at least 2 characters.",
    })
    .max(30, {
      message: "Organization name must not be longer than 30 characters.",
    }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Organization() {
  const { organization, setOrganization } = orgStore((state) => state);

  const [newAddress, setAddress] = useState<AddressType>({
    address: "",
    formattedAddress: "",
    city: "",
    region: "",
    postalCode: "",
    country: "",
    lat: 0,
    lng: 0,
  });
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(
    null
  );
  const client = createClient();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      const image = event.target.files[0];
      setSelectedImage(image);
      setUploadedImagePath(URL.createObjectURL(image));
    }
  };

  const uploadImageIfNecessary = async () => {
    if (!selectedImage || !organization?.publicId) return;

    try {
      const { error } = await client.storage
        .from("org-pictures")
        .upload(`${organization.publicId}/avatar.png`, selectedImage);

      if (error) {
        toast.error("Error uploading image");
        console.error(error);
        setLoading(false);
        return;
      }
      removeSelectedImage();
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const removeSelectedImage = () => {
    setLoading(false);
    setUploadedImagePath(null);
    setSelectedImage(null);
  };

  async function onSubmit(data: ProfileFormValues) {
    if (!organization) return;
    setLoading(true);

    try {
      const response = await fetch("/api/v1/organization", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          address: newAddress.address === "" ? null : newAddress,
        }),
      });

      const json: { message?: string } = await response.json();

      if (!response.ok) {
        if (json.message) {
          toast.error("Error updating profile.", {
            description: json.message,
          });
        } else {
          toast.error("Error updating profile.");
        }
        setLoading(false);
        return;
      }

      await uploadImageIfNecessary();

      setLoading(false);

      setOrganization({ ...organization, ...data });

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Error updating profile");
      console.error("Error updating profile:", error);
    }
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
    defaultValues: {
      name: organization?.name ?? "",
    },
  });

  useEffect(() => {
    fetch("/api/v1/organization")
      .then((res) => res.json())
      .then((data) => {
        setOrganization(data);
        form.setValue("name", data.name ?? "");
      });
  }, []);

  return (
    <div className='flex flex-col'>
      <section aria-labelledby='organization-settings'>
        <Avatar className='size-24 rounded-lg'>
          <AvatarImage
            src={
              uploadedImagePath ??
              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/org-pictures/${organization?.publicId ?? ""}/avatar.png`
            }
            alt={organization?.name ?? ""}
          />
          <AvatarFallback className='rounded-lg text-2xl'>
            {(organization?.name ?? "")
              .split(" ")
              .map((word) => (word === "" ? "" : word[0].toUpperCase()))
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className='mt-6 grid w-full items-center gap-1.5'>
          <Label htmlFor='picture'>Organization Logo</Label>
          <Input
            accept='image/*'
            id='picture'
            type='file'
            onChange={handleImageChange}
          />
        </div>
        <div className='my-5'>
          <Label>Organization Address</Label>
          <AddressAutoComplete
            address={newAddress}
            setAddress={setAddress}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            placeholder={organization?.address ?? ""}
            dialogTitle='Enter Address'
          />
          <p className={"text-sm text-muted-foreground"}>
            Enter your organization address.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input
                      readOnly={loading}
                      placeholder='My Organization'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Your organization name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={loading} type='submit'>
              {loading ? <LoadingSpinner /> : "Update organization"}
            </Button>
          </form>
        </Form>
      </section>
      <div className='mt-10 space-y-6'>
        <div>
          <h3 className='text-lg font-medium'>Team Members</h3>
          <p className='text-sm text-muted-foreground'>
            Add members to your organization. They will recieve an invitation
            email allowing them to access the projects within this organization.
          </p>
        </div>
        <Separator />
        <OrgMembersSection />
      </div>
    </div>
  );
}
