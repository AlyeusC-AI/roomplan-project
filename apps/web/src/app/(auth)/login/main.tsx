"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { AuthLayout } from "@/components/layouts/auth-layout";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { PrimaryButton, SecondaryButton } from "@/components/components/button";
import { TertiaryLink } from "@/components/components/link";
import { LogoTextBlue } from "@/components/components/logo";
import Image from "next/image";
import { ClipLoader } from "react-spinners";
import { createClient } from "@lib/supabase/client";
import { TextField } from "@components/components/input";

export default function Login() {
  const router = useSearchParams();
  const navigate = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState((router?.get("email") as string) || "");
  const [password, setPassword] = useState("");

  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [sentMagicLink, setSentMagicLink] = useState(false);
  const [error, setError] = useState(false);
  const supabaseClient = createClient();

  // Logging In The User With Supabase
  const handleLogin = async (e: FormEvent) => {
    // Preventing Reloading The Page
    e.preventDefault();

    try {
      // Setting Loading
      setLoading(true);

      // Logging In The User With Supabase
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      // If There Is An Error, Throw It
      if (error) throw error;

      // Otherwise, Route The User To "/projects"
      navigate.push("/projects");
    } catch (error) {
      // Logging The Error To The Console
      console.error(error);

      // Setting The Error Text
      setError(true);

      // Toggling Loading
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: FormEvent) => {
    setMagicLinkLoading(true);
    const { error } = await supabaseClient.auth.signInWithOtp({
      email,
    });
    if (!error) {
      setSentMagicLink(true);
      setMagicLinkLoading(false);
    } else {
      toast;
    }
  };

  if (sentMagicLink) {
    return (
      <AuthLayout>
        <div className='mt-20'>
          <h2 className='text-xl font-semibold text-gray-900'>
            Magic link email sent
          </h2>
          <p className='mt-2 text-sm text-gray-700'>
            Check your inbox to find your login link to ServiceGeek.
          </p>
          <p className='mt-2 text-sm text-gray-700'>
            Didn&apos;t get an email?{" "}
            <Link
              prefetch={false}
              href='/login'
              className='font-medium text-primary hover:underline'
            >
              Sign in
            </Link>{" "}
            with your password instead.
          </p>
          <div className='mt-4'>
            <Image
              src='/images/email-sent.svg'
              width={647.63626 / 3}
              height={632.17383 / 3}
              alt='Email Sent'
            />
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className='flex flex-col'>
        <Link href='/' aria-label='Home' className='h-10 w-auto'>
          <LogoTextBlue />
        </Link>
        <div className='mt-20'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Sign in to your account
          </h2>
          <p className='mt-2 text-sm text-gray-700'>
            Don’t have an account?{" "}
            <TertiaryLink href='/register'>Sign up</TertiaryLink> for a free
            trial.
          </p>
        </div>
      </div>
      {loading ? (
        <div className='flex w-full flex-col items-center justify-center py-10'>
          <ClipLoader color='#2563eb' />
          <p className='mt-6 text-gray-600'>Securely logging in...</p>
        </div>
      ) : (
        <>
          <form
            action='#'
            className='mt-10 grid grid-cols-1 gap-y-8'
            onSubmit={handleLogin}
          >
            <TextField
              label='Email address'
              id='email'
              name='email'
              type='email'
              autoComplete='email'
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              required
            />
            <TextField
              label='Password'
              id='password'
              name='password'
              type='password'
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              autoComplete='current-password'
              required
            />
            <div className='flex flex-col'>
              <PrimaryButton
                type='submit'
                loading={loading}
                className='mb-2 w-full'
              >
                Sign in <span aria-hidden='true'>&rarr;</span>
              </PrimaryButton>
              <SecondaryButton
                onClick={handleMagicLink}
                loading={magicLinkLoading}
              >
                Email me a login link
              </SecondaryButton>
              <p className='mt-2 text-sm text-gray-700'>
                Forgot your password?
                <Link
                  href='/reset-password'
                  className='ml-2 font-medium text-primary hover:underline'
                >
                  Reset password
                </Link>
              </p>
            </div>
          </form>
          {error && (
            <>
              <p className='mt-4 text-sm text-red-700'>
                Invalid email or password{" "}
              </p>
              <Link
                href='/reset-password'
                className='mt-2 text-sm text-primary'
              >
                Forgot your password or email?
              </Link>
            </>
          )}
        </>
      )}
    </AuthLayout>
  );
}
