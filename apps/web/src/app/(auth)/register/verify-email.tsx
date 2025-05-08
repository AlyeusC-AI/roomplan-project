"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useStepper } from "@components/ui/nyxbui/stepper";
import {
  useVerifyEmail,
  useCurrentUser,
  useResendVerificationEmail,
} from "@service-geek/api-client";

const RESEND_COOLDOWN = 60; // 60 seconds cooldown

export function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const stepper = useStepper();
  const router = useRouter();
  const { mutate: verifyEmail } = useVerifyEmail();
  const { mutate: resendVerification } = useResendVerificationEmail();
  const { data: user } = useCurrentUser();
  const token = searchParams.get("token");

  useEffect(() => {
    stepper.setStep(1);
    if (user?.isEmailVerified) {
      router.replace("/register?page=3");
    }
    // Auto-verify if token is present
  }, [user, router, searchParams, stepper]);
  useEffect(() => {
    if (token) {
      handleVerifyEmail();
    }
  }, [token]);

  // Handle cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown(cooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerifyEmail = async () => {
    if (!token) {
      toast.error("No verification token found");
      return;
    }

    try {
      setLoading(true);
      verifyEmail(token, {
        onSuccess: () => {
          toast.success("Email verified successfully");
          router.replace("/register?page=3");
          stepper.nextStep();
        },
        onError: () => {
          toast.error("Failed to verify email");
        },
        onSettled: () => {
          setLoading(false);
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to verify email");
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!user?.email) {
      toast.error("No email found");
      return;
    }

    if (cooldown > 0) {
      toast.error(
        `Please wait ${cooldown} seconds before requesting another email`
      );
      return;
    }

    try {
      setLoading(true);
      resendVerification(user.email, {
        onSuccess: () => {
          toast.success("Verification email sent");
          setCooldown(RESEND_COOLDOWN);
        },
        onError: () => {
          toast.error("Failed to resend verification email");
        },
        onSettled: () => {
          setLoading(false);
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to resend verification email");
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
    <div className='p-6 md:p-8'>
      <div className='flex flex-col items-center justify-center gap-6'>
        <div className='flex flex-col items-center text-center'>
          <h1 className='text-2xl font-bold'>Verify Email</h1>
          <p className='text-balance text-muted-foreground'>
            {token
              ? "Verifying your email..."
              : "Please check your email for the verification link."}
          </p>
        </div>
        {!token && (
          <>
            <div className='text-center text-sm'>
              Didn't receive an email?{" "}
              <Button
                variant='link'
                onClick={handleResendEmail}
                disabled={cooldown > 0}
                className='underline underline-offset-4'
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend it"}
              </Button>
            </div>
            <div className='text-center text-sm'>
              Wrong Email?{" "}
              <a href='/register' className='underline underline-offset-4'>
                Log in with a different account
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
