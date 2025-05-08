"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLogin } from "@service-geek/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login.mutateAsync({ email, password });
      // The redirect is handled in the useLogin hook
    } catch (error) {
      toast.error("Login Failed", {
        description: "Invalid email or password. Please try again.",
      });
    }
  };

  return (
    <form className='p-6 md:p-8' onSubmit={handleSubmit}>
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col items-center text-center'>
          <h1 className='text-2xl font-bold'>Welcome back</h1>
          <p className='text-balance text-muted-foreground'>
            Login to your RestoreGeek account
          </p>
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            type='email'
            placeholder='johndoe@company.com'
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className='grid gap-2'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='password'>Password</Label>
            <Link
              href='/forgot-password'
              className='text-sm text-primary hover:underline'
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id='password'
            type='password'
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type='submit' className='w-full' disabled={login.isPending}>
          {login.isPending ? "Logging in..." : "Login"}
        </Button>
        <div className='text-center text-sm'>
          Don&apos;t have an account?{" "}
          <Link href='/register' className='text-primary hover:underline'>
            Sign up
          </Link>
        </div>
      </div>
    </form>
  );
}
