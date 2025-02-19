"use client";

import { Suspense, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@lib/supabase/client";
import { LoadingSpinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Mail, Phone } from "lucide-react";
import { Factor } from "@supabase/supabase-js";

export function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(
    (searchParams?.get("email") as string) ?? ""
  );
  const [password, setPassword] = useState("");
  const supabaseClient = createClient();
  const [showMFAModal, setShowMFAModal] = useState(false);
  const [mfaTypes, setMFATypes] = useState<Factor[]>([]);

  // Logging In The User With Supabase
  async function handleLogin(e: React.FormEvent) {
    // Preventing Reloading The Page
    e.preventDefault();

    try {
      // Setting Loading
      setLoading(true);

      // Logging In The User With Supabase
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      // If There Is An Error, Throw It
      if (error) throw error;

      // Otherwise, Route The User To "/projects"
      if (
        data.user.email_confirmed_at &&
        data.user.user_metadata.organizationId
      ) {
        router.push("/projects");
      } else if (data.user.email_confirmed_at) {
        router.push("/register?page=3");
      } else {
        router.push(`/register?page=2&email=${email}`);
      }
    } catch (error) {
      // Logging The Error To The Console
      console.error(error);

      // Setting The Error Text
      toast.error("An Error Occured", {
        description:
          "The credentials you entered are invalid. Please check your email and password and try again.",
      });

      // Toggling Loading
      setLoading(false);
    }
  }

  async function twoFA(type: "totp" | "phone" | string) {
    
  }

  useEffect(() => {
    if (searchParams.get("code")) {
      setLoading(true);
      supabaseClient.auth
        .verifyOtp({
          token_hash: searchParams.get("code")!,
          type: "magiclink",
        })
        .then(() => {
          setLoading(false);
          router.push(searchParams.get("redirect") ?? "/projects");
        });
    }

    supabaseClient.auth.getUser().then((data) => {
      if (data.data.user) {
        router.push("/projects");
      }
    });
  }, []);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabaseClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `/projects`,
        shouldCreateUser: false,
      },
    });

    setLoading(false);

    if (!error) {
      toast.success("Magic link sent.", {
        description:
          "A magic link has been sent to the entered email. If you do not recieve one, try again or continue with your password.",
      });
      return;
    }

    toast.error("An Error Occured", {
      description:
        "The credentials you entered are invalid. Please check your email and password and try again.",
    });
  };

  if (loading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <LoadingSpinner className='w-full' />
      </div>
    );
  }

  return (
    <Suspense>
      <form className='p-6 md:p-8' onSubmit={handleLogin}>
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
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className='grid gap-2'>
            <div className='flex items-center'>
              <Label htmlFor='password'>Password</Label>
              <a
                href='/reset-password'
                className='ml-auto text-sm underline-offset-2 hover:underline'
              >
                Forgot your password?
              </a>
            </div>
            <Input
              id='password'
              type='password'
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type='submit' className='w-full'>
            Login
          </Button>
          <div className='text-center text-sm'>
            Don&apos;t have an account?{" "}
            <a href='/register' className='underline underline-offset-4'>
              Sign up
            </a>
          </div>
          <div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border'>
            <span className='relative z-10 bg-background px-2 text-muted-foreground'>
              Or continue with
            </span>
          </div>
          <Button
            onClick={handleMagicLink}
            variant='outline'
            className='w-full'
          >
            Magic Link
          </Button>
        </div>
      </form>
      <Dialog open={showMFAModal} onOpenChange={() => {}}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>2 Factor Authentication</DialogTitle>
            <DialogDescription>
              Verify your account using one of the following methods.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            {mfaTypes.map((factor) => (
              <Button key={factor.id} onClick={() => twoFA(factor.factor_type)}>
                <Phone /> {factor.friendly_name ?? "Verify Via SMS"}
              </Button>
            ))}
            <Button onClick={() => twoFA("email")}>
              <Mail /> Verify Via Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Suspense>
  );
}
