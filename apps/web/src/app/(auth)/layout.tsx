"use client";

import { Card, CardContent } from "@components/ui/card";
import { Step, Stepper, type StepItem } from "@/components/ui/nyxbui/stepper";
import { Building, CircleUser, CreditCard, IdCard } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function Layout({ children }: React.PropsWithChildren) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const steps = [
    { label: "Account", icon: CircleUser },
    { label: "Verify", icon: IdCard },
    { label: "Organization", icon: Building },
    { label: "Get Started", icon: CreditCard },
  ] satisfies StepItem[];

  console.log(pathname);

  return (
    <Suspense>
      <div className='flex min-h-screen flex-col items-center justify-center bg-background p-6 md:p-10'>
        <div className='w-full max-w-sm md:max-w-3xl'>
          <div className='flex flex-col gap-6'>
            <Stepper
              initialStep={parseInt(searchParams.get("page") ?? "0") - 1}
              steps={steps}
              orientation='horizontal'
            >
              {pathname.includes("/register") &&
                steps.map(({ label }, index) => (
                  <Step key={label} label={label} icon={steps[index].icon} />
                ))}
              {pathname.includes("/register") &&
              searchParams.get("page") === "4" ? (
                <>{children}</>
              ) : (
                <Card className='overflow-hidden'>
                  <CardContent className='grid min-h-[60vh] p-0 md:grid-cols-2'>
                    {children}
                    <div className='relative hidden h-full bg-muted md:block'>
                      <img
                        src='/caterpiller.jpg'
                        alt='Image'
                        className='absolute inset-0 size-full object-cover dark:brightness-[0.2] dark:grayscale'
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className='text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary'>
                By clicking continue, you agree to our{" "}
                <a href='/terms'>Terms of Service</a> and{" "}
                <a href='/privacy'>Privacy Policy</a>.
              </div>
            </Stepper>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
