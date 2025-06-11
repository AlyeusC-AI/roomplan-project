"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { LoadingPlaceholder } from "@components/ui/spinner";
import { Label } from "@components/ui/label";
import { toast } from "sonner";

function UpdatePasswordForm() {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const handlePasswordReset = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.error("Passwords don't match", {
        description:
          "The passwords you entered don't match. Please check your passwords and try again.",
      });
      return;
    }

    setLoading(false);
  };

  if (loading) {
    return <LoadingPlaceholder />;
  }

  return (
    <form className='p-6 md:p-8' onSubmit={handlePasswordReset}>
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col items-center text-center'>
          <h1 className='text-2xl font-bold'>Update Password</h1>
          <p className='mt-2 text-balance text-muted-foreground'>
            Update the password to your RestoreGeek account
          </p>
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='password'>Password</Label>
          <Input
            id='password'
            type='password'
            placeholder='*********'
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='confirm'>Confirm Password</Label>
          <Input
            id='confirm'
            type='password'
            placeholder='*********'
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <Button type='submit' className='w-full'>
          Update Password
        </Button>
        <div className='text-center text-sm'>
          Remembered your password?{" "}
          <a
            href={searchParams.get("/redirect") ?? "/login"}
            className='underline underline-offset-4'
          >
            Back
          </a>
        </div>
      </div>
    </form>
  );
}

export default function UpdatePassword() {
  return (
    <Suspense>
      <UpdatePasswordForm />
    </Suspense>
  );
}
