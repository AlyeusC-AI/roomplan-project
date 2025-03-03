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
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SubscribeForm() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/subscription-plans")
      .then((response) => response.json())
      .then((data: SubscriptionPlan[]) => {
        setPlans(data);
        setLoading(false);
      });
  }, []);

  function purchase(plan: SubscriptionPlan, noTrial: boolean) {
    try {
      setLoading(true);
      fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: plan.price_id,
          type: "register",
          plan: plan.product.name.toLowerCase(),
          noTrial,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.url) {
            window.location.href = data.url;
          } else {
            toast.error(
              "An error occurred while processing your payment. Please try again later."
            );
          }
          console.log(data);
          setLoading(false);
        });
    } catch {
      toast.error(
        "An error occurred while processing your payment. Please try again later."
      );
    }
  }

  if (loading) {
    return <LoadingPlaceholder />;
  }

  return (
    <>
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
        {/* End Title */}
        {/* Switch */}
        {/* <div className='flex items-center justify-center'>
          <Label htmlFor='payment-schedule' className='me-3'>
            Monthly
          </Label>
          <Switch id='payment-schedule' />
          <Label htmlFor='payment-schedule' className='relative ms-3'>
            Annual
            <span className='absolute -end-28 -top-10 start-auto'>
              <span className='flex items-center'>
                <svg
                  className='-me-6 h-8 w-14'
                  width={45}
                  height={25}
                  viewBox='0 0 45 25'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M43.2951 3.47877C43.8357 3.59191 44.3656 3.24541 44.4788 2.70484C44.5919 2.16427 44.2454 1.63433 43.7049 1.52119L43.2951 3.47877ZM4.63031 24.4936C4.90293 24.9739 5.51329 25.1423 5.99361 24.8697L13.8208 20.4272C14.3011 20.1546 14.4695 19.5443 14.1969 19.0639C13.9242 18.5836 13.3139 18.4152 12.8336 18.6879L5.87608 22.6367L1.92723 15.6792C1.65462 15.1989 1.04426 15.0305 0.563943 15.3031C0.0836291 15.5757 -0.0847477 16.1861 0.187863 16.6664L4.63031 24.4936ZM43.7049 1.52119C32.7389 -0.77401 23.9595 0.99522 17.3905 5.28788C10.8356 9.57127 6.58742 16.2977 4.53601 23.7341L6.46399 24.2659C8.41258 17.2023 12.4144 10.9287 18.4845 6.96211C24.5405 3.00476 32.7611 1.27399 43.2951 3.47877L43.7049 1.52119Z'
                    fill='currentColor'
                    className='text-muted-foreground'
                  />
                </svg>
                <Badge className='mt-3 uppercase'>Save up to 10%</Badge>
              </span>
            </span>
          </Label>
        </div> */}
        {/* End Switch */}
        {/* Grid */}
        <div className='mt-12 grid justify-center gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:items-center'>
          {/* Card */}
          {plans
            .sort((a, b) => (a.price < b.price ? -1 : 1))
            .map((plan) => (
              <div key={plan.id}>
                {plan.product.name === "Team" ? (
                  <Card className='border-primary'>
                    <CardHeader className='pb-2 text-center'>
                      <Badge className='mb-3 w-max self-center uppercase'>
                        Most popular
                      </Badge>
                      <CardTitle className='!mb-7'>
                        {plan.product.name}
                      </CardTitle>
                      <span className='text-5xl font-bold'>${plan.price}</span>
                    </CardHeader>
                    <CardDescription className='mx-auto w-11/12 text-center'>
                      {plan.product.description}
                    </CardDescription>
                    <CardContent>
                      <ul className='mt-7 space-y-2.5 text-sm'>
                        {plan.product.marketing_features.map((feature) => (
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
                      >
                        Continue
                      </Button>
                      <Button
                        onClick={() => purchase(plan, false)}
                        className='w-full'
                        variant={"ghost"}
                      >
                        Start free trial
                      </Button>
                    </CardFooter>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader className='pb-2 text-center'>
                      <CardTitle className='mb-7'>
                        {plan.product.name}
                      </CardTitle>
                      <span className='text-5xl font-bold'>${plan.price}</span>
                    </CardHeader>
                    <CardDescription className='w-11/12 text-center'>
                      {plan.product.description}
                    </CardDescription>
                    <CardContent>
                      <ul className='mt-7 space-y-2.5 text-sm'>
                        {plan.product.marketing_features.map((feature) => (
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
                      >
                        Continue
                      </Button>
                      <Button
                        onClick={() => purchase(plan, false)}
                        className='w-full'
                        variant={"ghost"}
                      >
                        Start free trial
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </div>
            ))}
          {/* End Card */}
        </div>
        {/* End Grid */}
        {/* Comparison table */}

        {/* End Comparison table */}
      </div>
      {/* End Pricing */}
    </>
  );
}
{
  /* <div className='mt-20 w-full lg:mt-32'>
          <div className='mb-10 lg:mb-20 lg:text-center mx-20'>
            <h3 className='text-2xl font-semibold dark:text-white'>
              Compare plans
            </h3>
          </div>
          {/* xs to lg
          <Card className="mx-5 lg:mx-20">
            <Table className='hidden lg:table rounded-full'>
              <TableHeader className="rounded-full">
                <TableRow className='bg-muted hover:bg-muted rounded-full'>
                  <TableHead className='w-3/12 text-primary rounded-tl-lg'>Plans</TableHead>
                  <TableHead className='w-2/12 text-center text-lg font-medium text-primary'>
                    Free
                  </TableHead>
                  <TableHead className='w-2/12 text-center text-lg font-medium text-primary'>
                    Startup
                  </TableHead>
                  <TableHead className='w-2/12 text-center text-lg font-medium text-primary'>
                    Team
                  </TableHead>
                  <TableHead className='w-2/12 text-center text-lg font-medium text-primary rounded-tr-lg'>
                    Enterprise
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planFeatures.map((featureType) => (
                  <React.Fragment key={featureType.type}>
                    <TableRow className='bg-muted/50'>
                      <TableCell colSpan={5} className='font-bold'>
                        {featureType.type}
                      </TableCell>
                    </TableRow>
                    {featureType.features.map((feature) => (
                      <TableRow
                        key={feature.name}
                        className='text-muted-foreground'
                      >
                        <TableCell>{feature.name}</TableCell>
                        <TableCell>
                          <div className='mx-auto w-min'>
                            {feature.free ? (
                              <CheckIcon className='h-5 w-5' />
                            ) : (
                              <MinusIcon className='h-5 w-5' />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='mx-auto w-min'>
                            {feature.startup ? (
                              <CheckIcon className='h-5 w-5' />
                            ) : (
                              <MinusIcon className='h-5 w-5' />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='mx-auto w-min'>
                            {feature.team ? (
                              <CheckIcon className='h-5 w-5' />
                            ) : (
                              <MinusIcon className='h-5 w-5' />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='mx-auto w-min'>
                            {feature.enterprise ? (
                              <CheckIcon className='h-5 w-5' />
                            ) : (
                              <MinusIcon className='h-5 w-5' />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>

            <div className='space-y-24 lg:hidden'>
              <section>
                <div className='mb-4'>
                  <h4 className='text-xl font-medium'>Free</h4>
                </div>
                <Table>
                  {planFeatures.map((featureType) => (
                    <>
                      <TableRow
                        key={featureType.type}
                        className='bg-muted hover:bg-muted'
                      >
                        <TableCell
                          colSpan={2}
                          className='w-10/12 font-bold text-primary'
                        >
                          {featureType.type}
                        </TableCell>
                      </TableRow>
                      {featureType.features.map((feature) => (
                        <TableRow
                          className='text-muted-foreground'
                          key={feature.name}
                        >
                          <TableCell className='w-11/12'>
                            {feature.name}
                          </TableCell>
                          <TableCell className='text-right'>
                            {feature.enterprise ? (
                              <CheckIcon className='h-5 w-5' />
                            ) : (
                              <MinusIcon className='h-5 w-5' />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ))}
                </Table>
              </section>
              <section>
                <div className='mb-4'>
                  <h4 className='text-xl font-medium'>Startup</h4>
                </div>
                <Table>
                  {planFeatures.map((featureType) => (
                    <>
                      <TableRow
                        key={featureType.type}
                        className='bg-muted hover:bg-muted'
                      >
                        <TableCell
                          colSpan={2}
                          className='w-10/12 font-bold text-primary'
                        >
                          {featureType.type}
                        </TableCell>
                      </TableRow>
                      {featureType.features.map((feature) => (
                        <TableRow
                          className='text-muted-foreground'
                          key={feature.name}
                        >
                          <TableCell className='w-11/12'>
                            {feature.name}
                          </TableCell>
                          <TableCell className='text-right'>
                            {feature.startup ? (
                              <CheckIcon className='h-5 w-5' />
                            ) : (
                              <MinusIcon className='h-5 w-5' />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ))}
                </Table>
              </section>
              <section>
                <div className='mb-4'>
                  <h4 className='text-xl font-medium'>Team</h4>
                </div>
                <Table>
                  {planFeatures.map((featureType) => (
                    <>
                      <TableRow
                        key={featureType.type}
                        className='bg-muted hover:bg-muted'
                      >
                        <TableCell
                          colSpan={2}
                          className='w-10/12 font-bold text-primary'
                        >
                          {featureType.type}
                        </TableCell>
                      </TableRow>
                      {featureType.features.map((feature) => (
                        <TableRow
                          className='text-muted-foreground'
                          key={feature.name}
                        >
                          <TableCell className='w-11/12'>
                            {feature.name}
                          </TableCell>
                          <TableCell className='text-right'>
                            {feature.team ? (
                              <CheckIcon className='h-5 w-5' />
                            ) : (
                              <MinusIcon className='h-5 w-5' />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ))}
                </Table>
              </section>
              <section>
                <div className='mb-4'>
                  <h4 className='text-xl font-medium'>Enterprise</h4>
                </div>
                <Table>
                  {planFeatures.map((featureType) => (
                    <>
                      <TableRow
                        key={featureType.type}
                        className='bg-muted hover:bg-muted'
                      >
                        <TableCell
                          colSpan={2}
                          className='w-10/12 font-bold text-primary'
                        >
                          {featureType.type}
                        </TableCell>
                      </TableRow>
                      {featureType.features.map((feature) => (
                        <TableRow
                          className='text-muted-foreground'
                          key={feature.name}
                        >
                          <TableCell className='w-11/12'>
                            {feature.name}
                          </TableCell>
                          <TableCell className='text-right'>
                            {feature.enterprise ? (
                              <CheckIcon className='h-5 w-5' />
                            ) : (
                              <MinusIcon className='h-5 w-5' />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ))}
                </Table>
              </section>
            </div>
          </Card>
          {/* End xs to lg
        </div> */
}
