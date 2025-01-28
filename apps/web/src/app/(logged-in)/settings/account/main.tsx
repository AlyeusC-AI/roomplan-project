"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { useState } from "react";
import { Label } from "@components/ui/label";
import { createClient } from "@lib/supabase/client";
import { userInfoStore } from "@atoms/user-info";
import { LoadingSpinner } from "@components/ui/spinner";
import { PhoneInput } from "@components/ui/phone-input";

const profileFormSchema = z.object({
  firstName: z
    .string()
    .min(2, {
      message: "Account name must be at least 2 characters.",
    })
    .max(30, {
      message: "Account name must not be longer than 30 characters.",
    }),
  lastName: z
    .string()
    .min(2, {
      message: "Account name must be at least 2 characters.",
    })
    .max(30, {
      message: "Account name must not be longer than 30 characters.",
    }),
  email: z.string({
    required_error: "Please select an email to display.",
  }),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function AccountSettings() {
  const { user, setUser } = userInfoStore();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    },
  });

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
    if (!selectedImage || !user?.id) return;

    try {
      const { error } = await client.storage
        .from("profile-pictures")
        .upload(`${user.id}/avatar.png`, selectedImage);

      console.log(user.id);

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
    if (!user) return;
    setLoading(true);

    try {
      await fetch("/api/v1/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      await uploadImageIfNecessary();

      setLoading(false);

      setUser({ ...user, ...data });

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Error updating profile");
      console.error("Error updating profile:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <Avatar className='size-24 rounded-lg'>
          <AvatarImage
            src={
              uploadedImagePath ??
              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-pictures/${user?.id}/avatar.png`
            }
            alt={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`}
          />
          <AvatarFallback className='rounded-lg text-2xl'>
            {`${user?.firstName ?? ""} ${user?.lastName ?? ""}`
              .split(" ")
              .map((word) => word[0].toUpperCase())
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className='grid w-full items-center gap-1.5'>
          <Label htmlFor='picture'>Profile Picture</Label>
          <Input
            accept='image/*'
            id='picture'
            type='file'
            onChange={handleImageChange}
          />
        </div>
        <FormField
          control={form.control}
          name='firstName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input
                  placeholder='John'
                  disabled={loading}
                  defaultValue={user?.firstName ?? ""}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter your first name. This will be displayed on your profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='lastName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input
                  disabled={loading}
                  placeholder='Doe'
                  defaultValue={user?.lastName ?? ""}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter your last name. This will be displayed on your profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder={user?.email ?? "example@gmail.com"}
                  disabled
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This is the email address that is associated with your account.
                You cannot change it.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <PhoneInput
                  placeholder={user?.phone ?? "+12345678901"}
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This is the email address that is associated with your account.
                You cannot change it.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={loading} className='w-32' type='submit'>
          {loading ? <LoadingSpinner /> : "Update profile"}
        </Button>
      </form>
    </Form>
  );
}
