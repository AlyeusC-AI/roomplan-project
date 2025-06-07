"use client";

import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { LoadingPlaceholder } from "@components/ui/spinner";
import {
  CheckIcon,
  Loader2,
  CreditCard,
  Calendar,
  Users,
  Receipt,
  ExternalLink,
  InfoIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  useCreateCheckoutSession,
  useCreatePortalSession,
  useGetSubscriptionInfo,
  useUpdateAdditionalUsers,
  useCurrentUser,
  useActiveOrganization,
} from "@service-geek/api-client";

interface Invoice {
  id: string;
  amount: number;
  status: string;
  date: string;
  pdfUrl: string | null;
}

export default function BillingPage() {
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [isAddingUsers, setIsAddingUsers] = useState(true);
  const [userCount, setUserCount] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: user } = useCurrentUser();
  const org = useActiveOrganization();
  const organizationId = org?.id;

  const { data: subscriptionInfo, isLoading } = useGetSubscriptionInfo();
  console.log("🚀 ~ BillingPage ~ subscriptionInfo:", subscriptionInfo);
  const { mutate: createCheckout, isPending: isCheckoutLoading } =
    useCreateCheckoutSession();
  const { mutate: createPortal, isPending: isPortalLoading } =
    useCreatePortalSession();
  const { mutate: updateUsers, isPending: isUpdateLoading } =
    useUpdateAdditionalUsers();

  const purchase = async (
    plan: NonNullable<typeof subscriptionInfo>["availablePlans"][0],
    noTrial: boolean
  ) => {
    if (!organizationId) {
      toast.error("Organization ID not found");
      return;
    }

    createCheckout(
      {
        organizationId,
        priceId: plan.id,
        type: "register",
        plan: plan.product.name.toLowerCase(),
        noTrial,
      },
      {
        onSuccess: (data) => {
          if (data.url) {
            window.location.href = data.url;
          } else {
            toast.error(
              "An error occurred while processing your payment. Please try again later."
            );
          }
        },
        onError: () => {
          toast.error(
            "An error occurred while processing your payment. Please try again later."
          );
        },
      }
    );
  };

  const redirectToPortal = async () => {
    if (!organizationId) {
      toast.error("Organization ID not found");
      return;
    }

    createPortal(organizationId, {
      onSuccess: (data) => {
        if (data.url) window.location.href = data.url;
      },
      onError: () => {
        toast.error("Failed to redirect to billing portal");
      },
    });
  };

  const handleUserUpdate = async () => {
    if (
      !organizationId ||
      !subscriptionInfo?.maxUsersForSubscription ||
      !subscriptionInfo?.plan?.name
    ) {
      toast.error("Invalid subscription info");
      return;
    }

    const currentBaseUsers =
      subscriptionInfo.plan.name.toLowerCase() === "startup"
        ? 2
        : subscriptionInfo.plan.name.toLowerCase() === "team"
          ? 5
          : 10;
    const currentAdditionalUsers =
      subscriptionInfo.maxUsersForSubscription - currentBaseUsers;

    const newAdditionalUsers = isAddingUsers
      ? currentAdditionalUsers + userCount
      : currentAdditionalUsers - userCount;

    updateUsers(
      { organizationId, additionalUsers: newAdditionalUsers },
      {
        onSuccess: (data) => {
          setShowUserDialog(false);
          setUserCount(1);
          toast.success("Successfully updated user limit");
        },
        onError: () => {
          toast.error("Failed to update user limit");
        },
      }
    );
  };

  const openUserDialog = (adding: boolean) => {
    setIsAddingUsers(adding);
    setUserCount(1);
    setShowUserDialog(true);
  };

  if (isLoading) return <LoadingPlaceholder />;

  return (
    <div className='mx-auto max-w-5xl space-y-8 p-8'>
      {/* Header Section */}

      {/* Main Subscription Card */}
      {subscriptionInfo?.plan &&
      !["canceled", "never"].includes(subscriptionInfo.status) ? (
        <Card className='overflow-hidden'>
          <div className='bg-primary/5 p-6'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <h2 className='text-2xl font-semibold'>
                  {subscriptionInfo.plan.name}
                </h2>
                <p className='text-sm text-muted-foreground'>
                  {subscriptionInfo.maxUsersForSubscription} users included
                </p>
              </div>
              {subscriptionInfo?.status && (
                <div className='flex items-center gap-3'>
                  {subscriptionInfo.cancelAtPeriodEnd && (
                    <Badge
                      variant='outline'
                      className='border-yellow-500/20 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                    >
                      Cancels soon
                    </Badge>
                  )}
                  <Badge
                    variant={
                      subscriptionInfo.status === "active"
                        ? "default"
                        : subscriptionInfo.status === "trialing"
                          ? "secondary"
                          : "destructive"
                    }
                    className='px-4 py-1'
                  >
                    {subscriptionInfo.status.charAt(0)?.toUpperCase() +
                      subscriptionInfo.status.slice(1)}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <CardContent className='grid gap-8 p-6'>
            <div className='flex flex-col gap-4'>
              <div className='grid grid-cols-2 gap-6'>
                {/* Price Info */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <CreditCard className='h-4 w-4' />
                    Billing Amount
                  </div>
                  <div className='flex items-baseline gap-1'>
                    <span className='text-3xl font-bold'>
                      ${subscriptionInfo.plan.price}
                    </span>
                    <span className='text-muted-foreground'>
                      /{subscriptionInfo.plan.interval}
                    </span>
                  </div>
                </div>

                {/* Next Payment */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Calendar className='h-4 w-4' />
                    Next Payment
                  </div>
                  <p className='text-xl font-medium'>
                    {subscriptionInfo.currentPeriodEnd
                      ? new Date(
                          subscriptionInfo.currentPeriodEnd
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
              {/* User Limit */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Users className='h-4 w-4' />
                    User Limit
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Base users:{" "}
                    {subscriptionInfo?.plan?.name.toLowerCase() === "startup"
                      ? 2
                      : subscriptionInfo?.plan?.name.toLowerCase() === "team"
                        ? 5
                        : 10}
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <p className='text-xl font-medium'>
                    {subscriptionInfo?.maxUsersForSubscription || 0} total users
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <Button
                    onClick={() => openUserDialog(false)}
                    variant='outline'
                    size='sm'
                    disabled={
                      !subscriptionInfo?.maxUsersForSubscription ||
                      subscriptionInfo.maxUsersForSubscription <=
                        (subscriptionInfo?.plan?.name.toLowerCase() ===
                        "startup"
                          ? 2
                          : subscriptionInfo?.plan?.name.toLowerCase() ===
                              "team"
                            ? 5
                            : 10)
                    }
                    className='flex-1'
                  >
                    Remove Users
                  </Button>
                  <Button
                    onClick={() => openUserDialog(true)}
                    variant='outline'
                    size='sm'
                    className='flex-1'
                  >
                    Add Users
                  </Button>
                </div>
                <Alert className='mt-2 bg-blue-500/10 text-blue-700 dark:text-blue-400'>
                  <InfoIcon className='h-4 w-4' />
                  <AlertDescription>
                    Each additional user will be billed at the per-user rate for
                    your plan.
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            {subscriptionInfo.plan.features?.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className='mb-4 text-sm font-medium'>
                    Included Features
                  </h3>
                  <ul className='grid gap-3 md:grid-cols-2'>
                    {subscriptionInfo.plan.features.map((feature, i) => (
                      <li key={i} className='flex items-center gap-2'>
                        <CheckIcon className='h-4 w-4 text-primary' />
                        <span className='text-sm'>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>

          <Separator />
          <CardFooter className='p-6'>
            <div className='flex w-full flex-col gap-4 sm:flex-row'>
              <Button
                onClick={redirectToPortal}
                disabled={isPortalLoading}
                className='flex-1'
                size='lg'
              >
                {isPortalLoading ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <CreditCard className='mr-2 h-4 w-4' />
                )}
                Manage Subscription
              </Button>
            </div>
          </CardFooter>
        </Card>
      ) : (
        <div className='flex flex-col items-center justify-center'>
          <div className='mx-auto mb-10 max-w-2xl text-center lg:mb-14'>
            <h2 className='scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0'>
              Choose Your Plan
            </h2>
            <p className='mt-1 text-muted-foreground'>
              {subscriptionInfo?.status === "canceled"
                ? "Your subscription has been cancelled. Choose a new plan to continue using the service."
                : "Select a plan that best fits your needs"}
            </p>
          </div>

          <div className='mt-12 grid justify-center gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:items-center'>
            {subscriptionInfo?.availablePlans?.map((plan) => (
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  plan.product.name === "Team"
                    ? "border-primary shadow-lg"
                    : "border-border"
                }`}
              >
                {plan.product.name === "Team" && (
                  <div className='absolute -right-12 top-6 rotate-45 bg-primary px-12 py-1 text-xs font-semibold text-primary-foreground'>
                    Most Popular
                  </div>
                )}
                <CardHeader className='pb-2 text-center'>
                  <CardTitle className='mb-4 text-2xl'>
                    {plan.product.name}
                  </CardTitle>
                  <div className='flex items-baseline justify-center gap-1'>
                    <span className='text-4xl font-bold'>${plan.price}</span>
                    <span className='text-muted-foreground'>/month</span>
                  </div>
                </CardHeader>
                <CardDescription className='mx-auto w-11/12 text-center text-sm'>
                  {plan.product.description}
                </CardDescription>
                <CardContent className='mt-6'>
                  <ul className='space-y-3'>
                    {plan.product.marketing_features.map((feature) => (
                      <li key={feature} className='flex items-center gap-2'>
                        <CheckIcon className='h-4 w-4 flex-shrink-0 text-primary' />
                        <span className='text-sm text-muted-foreground'>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className='mt-6'>
                  <Button
                    onClick={() => purchase(plan, true)}
                    disabled={isCheckoutLoading}
                    className='w-full'
                    size='lg'
                  >
                    {isCheckoutLoading ? (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : (
                      "Get Started"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Invoices */}
      {subscriptionInfo?.recentInvoices &&
        subscriptionInfo.recentInvoices.length > 0 && (
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>Recent Invoices</CardTitle>
                  <CardDescription>
                    View and download your recent invoices
                  </CardDescription>
                </div>
                <Receipt className='h-8 w-8 text-muted-foreground' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {subscriptionInfo.recentInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className='flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50'
                  >
                    <div>
                      <p className='font-medium'>
                        ${invoice.amount.toFixed(2)}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {new Date(invoice.date).toLocaleDateString()}
                      </p>
                    </div>
                    {invoice.pdfUrl && (
                      <Button variant='ghost' size='sm' asChild>
                        <a
                          href={invoice.pdfUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center gap-2'
                        >
                          <ExternalLink className='h-4 w-4' />
                          Download
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isAddingUsers ? "Add Users" : "Remove Users"}
            </DialogTitle>
            <DialogDescription>
              {isAddingUsers
                ? "Add additional users to your subscription. You will be billed for each new user."
                : "Remove users from your subscription. Changes will take effect at the end of the billing period."}
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='userCount'>Number of Users</Label>
              <Input
                id='userCount'
                type='number'
                min={1}
                max={
                  isAddingUsers
                    ? 100
                    : (subscriptionInfo?.maxUsersForSubscription || 0) -
                      (subscriptionInfo?.plan?.name.toLowerCase() === "startup"
                        ? 2
                        : subscriptionInfo?.plan?.name.toLowerCase() === "team"
                          ? 5
                          : 10)
                }
                value={userCount}
                onChange={(e) =>
                  setUserCount(Math.max(1, parseInt(e.target.value) || 1))
                }
                className='w-full'
              />
            </div>
            <div className='text-sm text-muted-foreground'>
              {isAddingUsers
                ? `Adding ${userCount} user${userCount > 1 ? "s" : ""} will increase your monthly bill by $${(
                    userCount *
                    (subscriptionInfo?.plan?.name.toLowerCase() === "enterprise"
                      ? 50
                      : 65)
                  ).toFixed(2)}.`
                : `Removing ${userCount} user${userCount > 1 ? "s" : ""} will decrease your monthly bill by $${(
                    userCount *
                    (subscriptionInfo?.plan?.name.toLowerCase() === "enterprise"
                      ? 50
                      : 65)
                  ).toFixed(2)}.`}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowUserDialog(false)}
              disabled={isUpdateLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleUserUpdate} disabled={isUpdateLoading}>
              {isUpdateLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Updating...
                </>
              ) : isAddingUsers ? (
                "Add Users"
              ) : (
                "Remove Users"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
