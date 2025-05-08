"use client";
import { useState } from "react";
import { useRequestPasswordReset } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const requestPasswordReset = useRequestPasswordReset();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await requestPasswordReset.mutateAsync({ email });
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <Card className='w-[350px]'>
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            If an account exists with {email}, you will receive a password reset
            link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className='w-full'>
            <Link href='/login'>Back to login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-[350px]'>
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a link to reset your
          password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='Enter your email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button
            type='submit'
            className='w-full'
            disabled={requestPasswordReset.isLoading}
          >
            {requestPasswordReset.isLoading ? "Sending..." : "Send reset link"}
          </Button>
          <Button variant='link' asChild className='w-full'>
            <Link href='/login'>Back to login</Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
