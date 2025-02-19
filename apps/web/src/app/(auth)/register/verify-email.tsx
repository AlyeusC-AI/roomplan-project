"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@lib/supabase/client";
import { LoadingSpinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { AuthSessionMissingError } from "@supabase/supabase-js";
import { useStepper } from "@components/ui/nyxbui/stepper";

export function VerifyEmailForm() {
  const [code, setCode] = useState("");
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const stepper = useStepper()

  async function verifyEmail() {
    try {
      setLoading(true);

      const { error } = await supabase.auth.verifyOtp({
        type: "signup",
        token: code,
        email: searchParams.get("email")!,
      });

      if (error) {
        toast.error("Failed to verify email");
        setLoading(false);
        console.error(error);
        return;
      }
      stepper.nextStep()
      toast.success("Email verified successfully");
      setLoading(false);
      router.replace("/register?page=3");
    } catch (error) {
      console.error(error);
      toast.error("Failed to verify email");
    }
  }

  const router = useRouter();

  useEffect(() => {
    stepper.setStep(1)
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      console.log(user);
      console.log(error);
      if (user?.email_confirmed_at) {
        router.replace("/register?page=3");
      } else if (!searchParams.get("email")) {
        router.replace("/login");
        setLoading(false);
        return;
      } 
    });
  }, []);

  async function resendEmail() {
    try {
      setLoading(true);

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: searchParams.get("email")!,
      });

      if (error) {
        toast.error("Failed to resend email");
        console.error(error)
        setLoading(false);
        return;
      }

      toast.success("Email sent successfully");
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to resend email");
    }
  }

  if (loading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <LoadingSpinner className='w-full' />
      </div>
    );
  }

  return (
    <form className='p-6 md:p-8' onSubmit={verifyEmail}>
      <div className='flex flex-col items-center justify-center gap-6'>
        <div className='flex flex-col items-center text-center'>
          <h1 className='text-2xl font-bold'>Verify Email</h1>
          <p className='text-balance text-muted-foreground'>
            Verify your email now to continue.
          </p>
        </div>
        <InputOTP onChange={setCode} maxLength={6}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <div className='text-center text-sm'>
          Didn't receive an email?{" "}
          <Button
            variant='link'
            onClick={resendEmail}
            className='underline underline-offset-4'
          >
            Resend it
          </Button>
        </div>
        <Button type='submit' className='w-full'>
          Verify Account
        </Button>
        <div className='text-center text-sm'>
          Wrong Email?{" "}
          <a href='/register' className='underline underline-offset-4'>
            Log in with a different account
          </a>
        </div>
      </div>
    </form>
  );
}
