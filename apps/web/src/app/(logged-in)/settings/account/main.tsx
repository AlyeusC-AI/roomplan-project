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
import { userInfoStore } from "@atoms/user-info";
import { LoadingSpinner } from "@components/ui/spinner";
import { PhoneInput } from "@components/ui/phone-input";
import {
  useUpdateProfile,
  useCurrentUser,
  uploadImage,
} from "@service-geek/api-client";

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
  // const { user, setUser } = userInfoStore();
  const { data: user } = useCurrentUser();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "+1",
    },
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(
    null
  );
  const updateProfile = useUpdateProfile();

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files?.length) {
      const image = event.target.files[0];
      setSelectedImage(image);
      setUploadedImagePath(URL.createObjectURL(image));
      setLoading(true);

      try {
        const result = await uploadImage(image, {
          folder: "avatars",
          useUniqueFileName: true,
        });

        const { email, ...rest } = form.getValues();
        const updatedUser = await updateProfile.mutateAsync({
          ...rest,
          avatar: result.url ?? undefined,
        });

        removeSelectedImage();
        toast.success("Profile picture updated successfully");
      } catch (error) {
        console.error("Error updating profile picture:", error);
        toast.error("Failed to update profile picture");
      } finally {
        setLoading(false);
      }
    }
  };

  const removeSelectedImage = () => {
    setUploadedImagePath(null);
    setSelectedImage(null);
  };

  async function onSubmit(data: ProfileFormValues) {
    if (!user) return;
    setLoading(true);

    try {
      let avatarUrl = user.avatar;
      if (selectedImage) {
        avatarUrl = (await uploadImageIfNecessary()) ?? null;
      }

      const { email, ...rest } = data;
      const updatedUser = await updateProfile.mutateAsync({
        ...rest,
        avatar: avatarUrl ?? undefined,
      });

      // setUser(updatedUser);
      removeSelectedImage();
      toast.success("Profile updated successfully");
    } catch (error) {
      // toast.error("Error updating profile");
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  }

  const uploadImageIfNecessary = async () => {
    if (!selectedImage || !user?.id) return;

    try {
      const result = await uploadImage(selectedImage, {
        folder: "avatars",
        useUniqueFileName: true,
      });

      return result.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      throw error;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <Avatar className='size-24 rounded-lg'>
          <AvatarImage
            src={
              uploadedImagePath ??
              user?.avatar ??
              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-pictures/${user?.id}/avatar.png`
            }
            alt={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`}
          />
          <AvatarFallback className='rounded-lg text-2xl'>
            {`${user?.firstName ?? "No"} ${user?.lastName ?? "User"}`
              .split(" ")
              .map((word) => word[0]?.toUpperCase())
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
            disabled={loading}
          />
          {loading && <LoadingSpinner className='mt-2' />}
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
                Enter your phone number for contact purposes.
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
