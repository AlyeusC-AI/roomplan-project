"use client";

import { Suspense, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "next/navigation";
import { createClient } from "@lib/supabase/client";
import { LoadingPlaceholder, LoadingSpinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export function ResetPassword() {
  const router = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState((router?.get("email") as string) ?? "");

  const [sentMagicLink, setSentMagicLink] = useState(false);
  const supabaseClient = createClient();

  // Logging In The User With Supabase
  const sendPasswordReset = async (e: React.FormEvent) => {
    // Preventing Reloading The Page
    e.preventDefault();

    try {
      // Setting Loading
      setLoading(true);

      // Logging In The User With Supabase
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: "/login",
      });

      // If There Is An Error, Throw It
      if (error) throw error;

      toast.success("Password reset sent successfully", {
        description:
          "A password reset link has been sent to your email. If you did not recieve one, check your spam folder or try again.",
      });
    } catch (error) {
      // Logging The Error To The Console
      console.error(error);

      // Setting The Error Text
      toast.error("An Error Occured", {
        description:
          "There was an error resetting your password. Double check your email and try again.",
      });
    }

    // Toggling Loading
    setLoading(false);
  };

  if (loading) {
    return (
      <Suspense>
        <LoadingPlaceholder />
      </Suspense>
    );
  }

  if (sentMagicLink) {
    return (
      <Suspense>
        <div className='mt-20 flex flex-col items-center justify-center px-4'>
          <div className='my-auto'>
            <h1 className='text-center text-2xl font-bold'>
              Magic link email sent
            </h1>
            <p className='text-balance text-center text-muted-foreground'>
              Check your inbox to find your login link to RestoreGeek.
            </p>
          </div>
          <div className='mt-4'>
            <img
              src='/images/email-sent.svg'
              width={647.63626 / 3}
              height={632.17383 / 3}
              alt='Email Sent'
              className='my-10'
            />
          </div>
          <Button
            onClick={() => setSentMagicLink(false)}
            variant='default'
            className='mb-10 w-11/12'
          >
            Continue With Password
          </Button>
        </div>
      </Suspense>
    );
  }

  return (
    <Suspense>
      <form className='p-6 md:p-8' onSubmit={sendPasswordReset}>
        <div className='flex flex-col gap-6'>
          <div className='flex flex-col items-center text-center'>
            <h1 className='text-2xl font-bold'>Forgot Password</h1>
            <p className='mt-2 text-balance text-muted-foreground'>
              Reset the password to your RestoreGeek account
            </p>
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='johndoe@company.com'
              required
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>
          <Button type='submit' className='w-full'>
            Send Email
          </Button>
          <div className='text-center text-sm'>
            Remembered your password?{" "}
            <a href='/login' className='underline underline-offset-4'>
              Log in
            </a>
          </div>
        </div>
      </form>
    </Suspense>
  );
}
