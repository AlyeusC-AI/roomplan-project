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
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Label } from "@components/ui/label";
import { LoadingSpinner } from "@components/ui/spinner";
import { Separator } from "@components/ui/separator";
import Address from "@components/DesignSystem/Address";
import {
  useActiveOrganization,
  useUpdateOrganization,
  uploadImage,
} from "@service-geek/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Upload, Building2, Phone, MapPin } from "lucide-react";

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Organization name must be at least 2 characters.",
    })
    .max(30, {
      message: "Organization name must not be longer than 30 characters.",
    }),
  phoneNumber: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Organization() {
  const activeOrganization = useActiveOrganization();
  console.log("🚀 ~ Organization ~ activeOrganization:", activeOrganization);
  const updateOrganization = useUpdateOrganization();
  const [newAddress, setAddress] = useState<AddressType>({
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

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files?.length) {
      const image = event.target.files[0];
      setSelectedImage(image);
      setUploadedImagePath(URL.createObjectURL(image));
      setLoading(true);
      await uploadImageIfNecessary();
      setLoading(false);
    }
  };

  const uploadImageIfNecessary = async () => {
    if (!selectedImage || !activeOrganization?.id) return;

    try {
      const response = await uploadImage(selectedImage, {
        folder: `organizations/${activeOrganization.id}`,
        useUniqueFileName: true,
      });

      if (!response.url) {
        toast.error("Error uploading image");
        setLoading(false);
        return;
      }

      // Get current form values
      const formData = form.getValues();

      // Update organization with both image and form data
      await updateOrganization.mutateAsync({
        id: activeOrganization.id,
        data: {
          name: formData.name,
          formattedAddress: newAddress.formattedAddress || undefined,
          city: newAddress.city || undefined,
          region: newAddress.region || undefined,
          postalCode: newAddress.postalCode || undefined,
          country: newAddress.country || undefined,
          lat: newAddress.lat || undefined,
          lng: newAddress.lng || undefined,
          phoneNumber: formData.phoneNumber,
          logo: response.url,
        },
      });

      removeSelectedImage();
      toast.success("Organization updated successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error uploading image");
      throw error;
    }
  };

  const removeSelectedImage = () => {
    setLoading(false);
    setUploadedImagePath(null);
    setSelectedImage(null);
  };

  async function onSubmit(data: ProfileFormValues) {
    if (!activeOrganization) return;
    setLoading(true);

    try {
      await updateOrganization.mutateAsync({
        id: activeOrganization.id,
        data: {
          name: data.name,
          formattedAddress: newAddress.formattedAddress || undefined,
          city: newAddress.city || undefined,
          region: newAddress.region || undefined,
          postalCode: newAddress.postalCode || undefined,
          country: newAddress.country || undefined,
          lat: newAddress.lat || undefined,
          lng: newAddress.lng || undefined,
          phoneNumber: data.phoneNumber,
        },
      });

      await uploadImageIfNecessary();

      setLoading(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Error updating profile");
      console.error("Error updating profile:", error);
      setLoading(false);
    }
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
    defaultValues: {
      name: activeOrganization?.name ?? "",
      phoneNumber: activeOrganization?.phoneNumber ?? "",
    },
  });

  useEffect(() => {
    if (activeOrganization) {
      form.setValue("name", activeOrganization.name ?? "");
      form.setValue("phoneNumber", activeOrganization.phoneNumber ?? "");
      setAddress({
        formattedAddress: activeOrganization.formattedAddress ?? "",
        city: activeOrganization.city ?? "",
        region: activeOrganization.region ?? "",
        postalCode: activeOrganization.postalCode ?? "",
        country: activeOrganization.country ?? "",
        lat: activeOrganization.lat ?? 0,
        lng: activeOrganization.lng ?? 0,
      });
    }
  }, [activeOrganization]);

  return (
    <div className='mx-auto max-w-4xl space-y-8 p-6'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl font-bold'>
            Organization Settings
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-8'>
          {/* Logo Section */}
          <div className='flex items-start gap-6'>
            <div className='group relative'>
              <Avatar className='size-32 rounded-xl border-2 border-border transition-all duration-200 group-hover:border-primary'>
                <AvatarImage
                  src={uploadedImagePath ?? activeOrganization?.logo}
                  alt={activeOrganization?.name ?? ""}
                  className='object-cover'
                />
                <AvatarFallback className='rounded-xl bg-muted text-3xl'>
                  {(activeOrganization?.name ?? "")
                    .split(" ")
                    .map((word: string) =>
                      word === "" ? "" : word[0]?.toUpperCase()
                    )
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className='absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100'>
                <Label
                  htmlFor='picture'
                  className='flex cursor-pointer items-center gap-2 text-white'
                >
                  <Upload className='size-5' />
                  <span>Change Logo</span>
                </Label>
              </div>
            </div>
            <div className='flex-1 space-y-2'>
              <Label htmlFor='picture' className='text-sm font-medium'>
                Organization Logo
              </Label>
              <Input
                accept='image/*'
                id='picture'
                type='file'
                onChange={handleImageChange}
                className='hidden'
              />
              <p className='text-sm text-muted-foreground'>
                Upload a logo for your organization. Recommended size: 256x256
                pixels.
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <div className='grid gap-6 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='flex items-center gap-2'>
                        <Building2 className='size-4' />
                        Organization Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          readOnly={loading}
                          placeholder='My Organization'
                          className='h-11'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your organization's display name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='phoneNumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='flex items-center gap-2'>
                        <Phone className='size-4' />
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          readOnly={loading}
                          placeholder='+1 (555) 000-0000'
                          className='h-11'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your organization's contact number.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormItem>
                <FormLabel className='flex items-center gap-2'>
                  <MapPin className='size-4' />
                  Organization Address
                </FormLabel>
                <AddressAutoComplete
                  address={newAddress}
                  setAddress={setAddress}
                  searchInput={searchInput}
                  setSearchInput={setSearchInput}
                  placeholder={
                    newAddress?.formattedAddress ??
                    "Enter your organization address"
                  }
                  dialogTitle='Enter Address'
                />
                <FormDescription>
                  This address will be used for billing and service location.
                </FormDescription>
              </FormItem>

              <Button
                disabled={loading}
                type='submit'
                className='w-full md:w-auto'
                size='lg'
              >
                {loading ? (
                  <div className='flex items-center gap-2'>
                    <LoadingSpinner />
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-2xl font-bold'>Team Members</CardTitle>
          <p className='text-sm text-muted-foreground'>
            Add members to your organization. They will receive an invitation
            email allowing them to access the projects within this organization.
          </p>
        </CardHeader>
        <CardContent>
          <OrgMembersSection />
        </CardContent>
      </Card>
    </div>
  );
}
