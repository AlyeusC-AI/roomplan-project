"use client";

import { useState } from "react";
import {
  PrimaryButton,
  PrimaryLink,
  LogoTextBlue,
  TextField,
  Alert,
} from "@components/components";
import { AuthLayout } from "@components/layouts/auth-layout";
import Link from "next/link";
import { createClient } from "@lib/supabase/client";
import { useForm } from "react-hook-form";
import { AuthError } from "@supabase/supabase-js";

export default function ResetPasswordRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const { register, handleSubmit } = useForm<{ email: string }>();

  const handlePasswordReset = async (event: { email: string }) => {
    if (!event.email) {
      setError("Must provide email.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(event.email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error) {
      console.error(error);
      if (error instanceof AuthError) {
        if (error.status) {
          if (error.status === 429) {
            setError(
              "For security purposes, you can only request this once every 60 seconds."
            );
          } else {
            setError(
              "Session Expired. Please request another password reset email."
            );
          }
        } else {
          setError(
            "Session Expired. Please request another password reset email."
          );
        }
      }
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className='flex flex-col'>
        <Link href='/' aria-label='Home' className='h-10 w-auto'>
          <LogoTextBlue />
        </Link>
        <div className='mt-20'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Forgot password
          </h2>
          <p className='mt-2 text-sm text-gray-700'>
            Remembered your password?
            <Link
              href='/login'
              className='ml-2 font-medium text-primary hover:underline'
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
      {success ? (
        <>
          <Alert type='success'>Password reset email sent!</Alert>
          <PrimaryLink className='mt-4 w-full' href='/login'>
            Sign In
          </PrimaryLink>
        </>
      ) : (
        <form
          action='#'
          className='mt-10 grid grid-cols-1 gap-y-8'
          onSubmit={handleSubmit(handlePasswordReset)}
        >
          <TextField
            label='Email'
            id='email'
            type='email'
            autoComplete='email'
            required
            {...register("email", { required: "Email is required" })}
          />
          <div>
            <PrimaryButton loading={loading} type='submit' className='w-full'>
              <span>
                Send Password Reset Email <span aria-hidden='true'>&rarr;</span>
              </span>
            </PrimaryButton>
          </div>
        </form>
      )}
      {error && (
        <>
          <p className='mt-4 text-sm text-red-700'>{error}</p>
        </>
      )}
    </AuthLayout>
  );
}
