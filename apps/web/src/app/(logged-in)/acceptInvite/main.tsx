"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@lib/supabase/client";
import { LoadingSpinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export function AcceptInviteForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState<any>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🚀 ~ supabase.auth.onAuthStateChange ~ event:", event);
      if (
        // event == "PASSWORD_RECOVERY" &&
        session
      ) {
        console.log("SETTING SESSION");
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
      }
    });
  }, []);
  useEffect(() => {
    // Verify the invite token and get organization details
    async function verifyInvite() {
      try {
        const token =
          (await supabase.auth.getUser()).data.user?.user_metadata.inviteId ||
          searchParams.get("token");
        console.log("🚀 ~ verifyInvite ~ token:", token);
        // try {
        //   await supabase.auth.verifyOtp({
        //     token_hash: token!,
        //     type: "invite",
        //   });
        // } catch (error) {
        //   toast.error("Invalid invitation link");
        //   // router.push("/login");
        //   // return;
        // }

        if (!token) {
          toast.error("Invalid invitation link");
          router.push("/login");
          return;
        }

        // const {
        //   data: { user },
        // } = await supabase.auth.getUser();
        // if (user?.email_confirmed_at) {
        //   router.push("/projects");
        //   return;
        // }

        // Verify invite token and get org details
        const response = await fetch(
          `/api/v1/organization/invite/verify?token=${token}`
        );
        const data = await response.json();

        if (!data.valid) {
          toast.error(data.message || "Invalid or expired invitation");
          // router.push("/login");
          return;
        }

        setInviteData(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to verify invitation");
        router.push("/login");
      }
    }

    verifyInvite();
  }, []);

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!firstName || !lastName || !password || !phone) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }

      // Accept invitation and create account
      const { error } = await supabase.auth.updateUser({
        // email: inviteData.email,
        password: password,
        data: {
          firstName,
          lastName,
          // organizationId: inviteData.organizationId,
          isSupportUser: false,
          acceptedInvite: true,
          phone,
        },
      });

      if (error) {
        console.log("🚀 ~ handleAcceptInvite ~ error:", error);
        toast.error(error.message || "Failed to create account");
        setLoading(false);
        return;
      }

      // Accept the invitation
      //   const response = await fetch("/api/v1/user/accept-invite", {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({
      //       token: searchParams.get("token"),
      //     }),
      //   });

      //   if (!response.ok) {
      //     toast.error("Failed to accept invitation");
      //     setLoading(false);
      //     return;
      //   }

      toast.success("Invitation accepted successfully");
      router.push("/projects");
    } catch (error) {
      console.error(error);
      toast.error("Failed to accept invitation");
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
    <div className='flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-card px-4 py-8 shadow sm:rounded-lg sm:px-10'>
          <form className='space-y-6' onSubmit={handleAcceptInvite}>
            <div className='flex flex-col gap-6'>
              <div className='flex flex-col items-center space-y-2 text-center'>
                <h1 className='text-2xl font-bold tracking-tight'>
                  Accept Invitation
                </h1>
                <p className='max-w-sm text-balance text-muted-foreground'>
                  You've been invited to join{" "}
                  <span className='font-medium'>
                    {inviteData?.organizationName}
                  </span>
                  . Create your account to get started.
                </p>
              </div>

              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                <div className='grid gap-1.5'>
                  <Label htmlFor='firstName'>First Name</Label>
                  <Input
                    id='firstName'
                    type='text'
                    placeholder='John'
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className='grid gap-1.5'>
                  <Label htmlFor='lastName'>Last Name</Label>
                  <Input
                    id='lastName'
                    type='text'
                    placeholder='Doe'
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className='grid gap-1.5'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  value={inviteData?.email}
                  disabled
                  className='bg-muted'
                />
              </div>

              <div className='grid gap-1.5'>
                <Label htmlFor='phone'>Phone Number</Label>
                <Input
                  id='phone'
                  type='tel'
                  placeholder='+1 (555) 000-0000'
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className='grid gap-1.5'>
                <Label htmlFor='password'>Password</Label>
                <Input
                  id='password'
                  type='password'
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='••••••••'
                />
              </div>

              <Button type='submit' className='w-full'>
                Accept Invitation
              </Button>

              {/* <div className='text-center text-sm text-muted-foreground'>
                Already have an account?{" "}
                <a
                  href='/login'
                  className='font-medium text-primary underline underline-offset-4 hover:text-primary/90'
                >
                  Log in
                </a>
              </div> */}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
