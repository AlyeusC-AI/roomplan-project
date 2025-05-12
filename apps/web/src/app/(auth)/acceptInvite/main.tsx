"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  setTokenStorage,
  useAuthStore,
  useAcceptInvitation,
  useCurrentUser,
} from "@service-geek/api-client";
import { Card } from "@components/ui/card";
import { Spinner } from "@components/components";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
});

type FormValues = z.infer<typeof formSchema>;

export default function AcceptInvite() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const { data: user, refetch } = useCurrentUser();
  const acceptInvitation = useAcceptInvitation();
  const orgId = searchParams.get("orgId");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      password: "",
      phone: "",
    },
  });
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      useAuthStore.getState().setToken(token);
      refetch();
    }
    setLoading(false);
  }, []);

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);

      // Accept invitation with user data in a single request
      await acceptInvitation.mutateAsync({
        orgId: orgId || "",
        memberId:
          user?.organizationMemberships.find(
            (membership) => membership.organization.id === orgId
          )?.id || "",
        userData: {
          firstName: data.firstName,
          lastName: data.lastName,
          password: data.password,
          phone: data.phone,
        },
      });

      toast.success("Successfully joined the organization");
      router.push("/projects");
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete registration");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Card className='w-full max-w-md p-6'>
          <div className='flex flex-col items-center justify-center space-y-4'>
            <Spinner />
            <p className='text-center text-sm text-muted-foreground'>
              Processing your invitation...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className='flex min-h-screen items-center justify-center'>
  //       <Card className='w-full max-w-md p-6'>
  //         <div className='flex flex-col items-center justify-center space-y-4'>
  //           <p className='text-center text-sm text-destructive'>{error}</p>
  //           <Button onClick={() => router.push("/")}>Go to Dashboard</Button>
  //         </div>
  //       </Card>
  //     </div>
  //   );
  // }

  // if (showForm) {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <Card className='w-full max-w-md p-6'>
        <div className='flex flex-col space-y-4'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold'>Complete Your Registration</h2>
            <p className='mt-2 text-sm text-muted-foreground'>
              Please provide your information to complete the registration
              process
            </p>
          </div>

          <div className='mb-4'>
            <Label>Email</Label>
            <Input value={user?.email} disabled className='bg-muted' />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='firstName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder='John' {...field} />
                      </FormControl>
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
                        <Input placeholder='Doe' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder='+1 (555) 000-0000' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='••••••••'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Must be at least 8 characters long
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type='submit' className='w-full' disabled={loading}>
                {loading ? <Spinner className='mr-2' /> : null}
                Complete Registration
              </Button>
            </form>
          </Form>
        </div>
      </Card>
    </div>
  );
  // }

  // return null;
}
