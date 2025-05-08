"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { PhoneInput } from "@components/ui/phone-input";
import { useStepper } from "@components/ui/nyxbui/stepper";
import { useRegister, useCurrentUser } from "@service-geek/api-client";

const leadOptions = [
  "Search Engine",
  "LinkedIn Advertisement",
  "At a Convention",
  "Word of Mouth",
  "Email",
  "Other",
];

export function AccountForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+1");
  const [lastName, setLastName] = useState("");
  const [lead, setLead] = useState("Search Engine");
  const [acceptReminders, setAcceptReminders] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepper = useStepper();
  const { mutate: register } = useRegister();
  const { data: user } = useCurrentUser();

  const [refferal, setRefferal] = useState(searchParams?.get("referral") ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    stepper.setStep(0);
    if (user?.isEmailVerified && user?.organizationMemberships?.length > 0) {
      router.replace("/register?page=4");
    } else if (user?.isEmailVerified) {
      router.replace("/register?page=3");
    }
  }, [user, router, stepper]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!firstName || !lastName) {
        toast.error("Please complete the form");
        setLoading(false);
        return;
      }

      register(
        {
          email,
          password,
          firstName,
          lastName,
          phone: phoneNumber,
          // lead,
          referralSource: refferal,
          acceptReminders,
        },
        {
          onSuccess: () => {
            if (process.env.NODE_ENV === "production") {
              fetch(
                "https://hooks.slack.com/services/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",
                {
                  method: "POST",
                  body: JSON.stringify({
                    blocks: [
                      {
                        type: "header",
                        text: {
                          type: "plain_text",
                          text: "New User Signup :wave:",
                          emoji: true,
                        },
                      },
                      {
                        type: "section",
                        fields: [
                          {
                            type: "mrkdwn",
                            text: `*Email:*\n${email}`,
                          },
                          {
                            type: "mrkdwn",
                            text: `*Phone Number:*\n${phoneNumber}`,
                          },
                          {
                            type: "mrkdwn",
                            text: `*First name:*\n${firstName}`,
                          },
                          {
                            type: "mrkdwn",
                            text: `*Last name:*\n${lastName}`,
                          },
                          {
                            type: "mrkdwn",
                            text: `*Lead:*\n${lead}`,
                          },
                          {
                            type: "mrkdwn",
                            text: `*Refferal code:*\n${refferal}`,
                          },
                        ],
                      },
                    ],
                  }),
                }
              );
            }
            router.replace(`/register?page=3&email=${email}`);
            stepper.nextStep();
          },

          onSettled: () => {
            setLoading(false);
          },
        }
      );
    } catch (error) {
      toast.error(
        "An unexpected error occurred. Please refresh your browser and try again."
      );
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
    <form className='p-6 md:p-8' onSubmit={handleSignup}>
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col items-center text-center'>
          <h1 className='text-2xl font-bold'>Welcome to RestoreGeek</h1>
          <p className='text-balance text-muted-foreground'>
            Register now to gain access to RestoreGeek.
          </p>
        </div>
        <div className='flex justify-between space-x-3'>
          <div className='grid gap-2'>
            <Label htmlFor='firstName'>First Name</Label>
            <Input
              id='firstName'
              type='text'
              placeholder='John'
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='lastName'>Last Name</Label>
            <Input
              id='lastName'
              type='text'
              placeholder='Doe'
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='phoneNumber'>Phone Number</Label>
          <PhoneInput
            id='phoneNumber'
            type='text'
            placeholder='+1 (888)-000-0000'
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e)}
          />
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
          <div className='flex items-center'>
            <Label htmlFor='password'>Password</Label>
          </div>
          <Input
            id='password'
            type='password'
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className='grid gap-2'>
          <div className='flex items-center'>
            <Label htmlFor='referral'>Referral (Optional)</Label>
          </div>
          <Input
            id='referral'
            type='text'
            value={refferal}
            onChange={(e) => setRefferal(e.target.value)}
          />
        </div>
        <div className='grid gap-2'>
          <div className='flex items-center'>
            <Label htmlFor='referral'>How did you hear about us?</Label>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline'>{lead}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56'>
              <DropdownMenuLabel>How did you hear about us?</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={lead} onValueChange={setLead}>
                {leadOptions.map((option) => (
                  <DropdownMenuRadioItem value={option} key={option}>
                    {option}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className='mt-3 flex items-center space-x-2'>
            <Checkbox required id='terms1' />
            <div className='grid gap-1.5 leading-none'>
              <label
                htmlFor='terms1'
                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                Accept terms and conditions
              </label>
            </div>
          </div>
          <div className='mt-3 flex items-center space-x-2'>
            <Checkbox
              id='twillio1'
              checked={acceptReminders}
              onCheckedChange={(checked) =>
                setAcceptReminders(checked === true)
              }
            />
            <div className='grid gap-1.5 leading-none'>
              <label
                htmlFor='twillio1'
                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                Opt in to receive one time passcodes and appointment reminders
                via text from RestoreGeek (optional)
              </label>
            </div>
          </div>
        </div>
        <Button type='submit' className='w-full'>
          Create Account
        </Button>
        <div className='text-center text-sm'>
          Already have an account?{" "}
          <a href='/login' className='underline underline-offset-4'>
            Log in
          </a>
        </div>
      </div>
    </form>
  );
}
