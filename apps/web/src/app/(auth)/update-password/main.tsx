"use client";

import { FormEvent, useEffect, useState } from "react";
import { AuthLayout } from "@components/layouts/auth-layout";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import queryString from "query-string";
import { createClient } from "@lib/supabase/client";
import { AuthError } from "@supabase/supabase-js";
import { LogoTextBlue } from "@components/components";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { LoadingSpinner } from "@components/ui/spinner";

export default function UpdatePassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");

  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event) => {
      console.log(event);
      if (event == "PASSWORD_RECOVERY") {
        // const newPassword = prompt("What would you like your new password to be?");
        // const { data, error } = await supabase.auth
        //   .updateUser({ password: newPassword })
        // if (data) alert("Password updated successfully!")
        // if (error) alert("There was an error updating your password.")
      }
    });
  }, []);

  const handlePasswordReset = async (e: FormEvent) => {
    e.preventDefault();
    // @ts-expect-error i dont even know this was here before
    if (!e.target.password || !e.target.confirmPassword) {
      setError("Invalid form state. Please refresh the page.");
      return;
    }
    // @ts-expect-error i dont even know this was here before
    if (e.target.password.value !== e.target.confirmPassword.value) {
      setError("Passwords do not match.");
      return;
    }
    try {
      setLoading(true);
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      const { error } = await supabase.auth.updateUser({
        // @ts-expect-error i dont even know this was here before
        password: e.target.password.value,
      });
      if (error) throw error;
      router.push("/login?reset_successful=1");
    } catch (error) {
      console.log(error);
      if (error instanceof AuthError) {
        if (error.status && error.status === 422) {
          setError(error.message as string);
          setLoading(false);
          return;
        }
      }

      setError("Session Expired. Please request another password reset email.");
      setLoading(false);
    }
  };

  useEffect(() => {
    const query = queryString.parse(pathname!.split("#")[1]);
    if (query.access_token && !Array.isArray(query.access_token)) {
      setAccessToken(query.access_token);
    }
    if (query.refresh_token && !Array.isArray(query.refresh_token)) {
      setRefreshToken(query.refresh_token);
    }
    if (query.error_description && typeof query.error_description === "string")
      setError(query.error_description);
  }, [router]);

  return (
    <AuthLayout>
      <div className='flex flex-col'>
        <Link href='/' aria-label='Home' className='h-10 w-auto'>
          <LogoTextBlue />
        </Link>
        <div className='mt-20'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Reset password
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
      <form
        action='#'
        className='mt-10 grid grid-cols-1 gap-y-8'
        onSubmit={handlePasswordReset}
      >
        <Input
          id='password'
          name='Password'
          type='password'
          autoComplete='password'
          required
        />
        <Input
          id='confirmPassword'
          name='confirm-password'
          type='password'
          autoComplete='password'
          required
        />
        <div>
          <Button
            type='submit'
            disabled={loading}
            color='blue'
            className='w-full'
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <span>
                Reset Password <span aria-hidden='true'>&rarr;</span>
              </span>
            )}
          </Button>
        </div>
      </form>
      {error && (
        <>
          <p className='mt-4 text-sm text-red-700'>{error}</p>
        </>
      )}
    </AuthLayout>
  );
}
