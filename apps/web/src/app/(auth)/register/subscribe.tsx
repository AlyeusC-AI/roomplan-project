import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingPlaceholder } from "@components/ui/spinner";
import { CheckIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import {
  useActiveOrganization,
  useGetOrganizations,
  useGetSubscriptionPlans,
  useCreateCheckoutSession,
} from "@service-geek/api-client";
import { OrganizationSelector } from "@/components/organization-selector";
import type {
  SubscriptionPlan,
  MarketingFeature,
} from "@service-geek/api-client";

export default function SubscribeForm() {
  const activeOrganization = useActiveOrganization();
  const { data: organizations } = useGetOrganizations();
  const { data: plans = [], isLoading } = useGetSubscriptionPlans();
  const { mutate: createCheckout, isPending: isCreatingCheckout } =
    useCreateCheckoutSession();

  function purchase(plan: SubscriptionPlan, noTrial: boolean) {
    if (!activeOrganization) {
      toast.error("Please select or create an organization first");
      return;
    }

    createCheckout(
      {
        organizationId: activeOrganization.id,
        priceId: plan.id,
        type: "register",
        plan: plan.name.toLowerCase(),
        noTrial,
      },
      {
        onSuccess: (data: { url: string }) => {
          console.log("🚀 ~ purchase ~ data:", data);
          if (data.url) {
            window.location.href = data.url;
          } else {
            toast.error(
              "An error occurred while processing your payment. Please try again later."
            );
          }
        },
      }
    );
  }

  if (isLoading || isCreatingCheckout) {
    return <LoadingPlaceholder />;
  }

  return (
    <>
      {/* Organization Selector - Only show if there are multiple organizations */}
      {organizations && organizations.length > 1 && (
        <div className='mx-auto mb-6 max-w-2xl'>
          <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground'>
            <span>Selected Organization:</span>
            <OrganizationSelector
              showLabel={false}
              readOnly={true}
              variant='subtle'
              buttonClassName='w-auto'
              hideIfSingle={true}
            />
          </div>
        </div>
      )}

      {/* Pricing */}
      <div className='flex flex-col items-center justify-center'>
        {/* Title */}
        <div className='mx-auto mb-10 max-w-2xl text-center lg:mb-14'>
          <h2 className='scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0'>
            Pricing
          </h2>
          <p className='mt-1 text-muted-foreground'>
            Whatever your status, our offers evolve according to your needs.
            <br />
            14 day free trial. (No Credit Card Required!)
          </p>
        </div>

        {/* Grid */}
        <div className='mt-12 grid justify-center gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:items-center'>
          {/* Card */}
          {plans
            .sort((a: SubscriptionPlan, b: SubscriptionPlan) =>
              a.price < b.price ? -1 : 1
            )
            .map((plan: SubscriptionPlan) => (
              <div key={plan.id}>
                {plan.name === "Team" ? (
                  <Card className='border-primary'>
                    <CardHeader className='pb-2 text-center'>
                      <Badge className='mb-3 w-max self-center uppercase'>
                        Most popular
                      </Badge>
                      <CardTitle className='!mb-7'>{plan.name}</CardTitle>
                      <span className='text-5xl font-bold'>${plan.price}</span>
                    </CardHeader>
                    <CardDescription className='mx-auto w-11/12 text-center'>
                      {plan.description}
                    </CardDescription>
                    <CardContent>
                      <ul className='mt-7 space-y-2.5 text-sm'>
                        {plan.features.map((feature: MarketingFeature) => (
                          <li key={feature.name} className='flex space-x-2'>
                            <CheckIcon className='mt-0.5 h-4 w-4 flex-shrink-0' />
                            <span className='text-muted-foreground'>
                              {feature.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className='flex flex-col gap-2'>
                      <Button
                        onClick={() => purchase(plan, true)}
                        className='w-full'
                        disabled={!activeOrganization || isCreatingCheckout}
                      >
                        Continue
                      </Button>
                      <Button
                        onClick={() => purchase(plan, false)}
                        className='w-full'
                        variant={"ghost"}
                        disabled={!activeOrganization || isCreatingCheckout}
                      >
                        Start free trial
                      </Button>
                    </CardFooter>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader className='pb-2 text-center'>
                      <CardTitle className='mb-7'>{plan.name}</CardTitle>
                      <span className='text-5xl font-bold'>${plan.price}</span>
                    </CardHeader>
                    <CardDescription className='w-11/12 text-center'>
                      {plan.description}
                    </CardDescription>
                    <CardContent>
                      <ul className='mt-7 space-y-2.5 text-sm'>
                        {plan.features.map((feature: MarketingFeature) => (
                          <li key={feature.name} className='flex space-x-2'>
                            <CheckIcon className='mt-0.5 h-4 w-4 flex-shrink-0' />
                            <span className='text-muted-foreground'>
                              {feature.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className='flex flex-col gap-2'>
                      <Button
                        onClick={() => purchase(plan, true)}
                        className='w-full'
                        disabled={!activeOrganization || isCreatingCheckout}
                      >
                        Continue
                      </Button>
                      <Button
                        onClick={() => purchase(plan, false)}
                        className='w-full'
                        variant={"ghost"}
                        disabled={!activeOrganization || isCreatingCheckout}
                      >
                        Start free trial
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
