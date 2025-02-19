"use client";

// export default async function BillingPage() {
//   return (
//     // <AppContainer
//     //   renderSecondaryNavigation={() => <ProjectsNavigationContainer />}
//     // >
//     <></>
//     // <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
//     //   {planInfo && (
//     //     <Card bg="" className="shadow-none">
//     //       <h2 className="text-lg font-medium leading-6 text-gray-900">
//     //         Billing Information
//     //         {status === 'canceled' && (
//     //           <span className=" ml-2 rounded-full bg-red-200 px-2 py-1 text-sm">
//     //             Cancelled
//     //           </span>
//     //         )}
//     //         {status === 'active' && (
//     //           <span className=" ml-2 rounded-full bg-green-200 px-2 py-1 text-sm">
//     //             active
//     //           </span>
//     //         )}
//     //       </h2>
//     //       {status === 'active' && (
//     //         <>
//     //           {productInfo && (
//     //             <h3 className="text-md mt-6 font-medium leading-6 text-gray-900">
//     //               Plan: {productInfo.name}
//     //             </h3>
//     //           )}
//     //           <div className="mt-6 flex items-baseline">
//     //             <p className="text-4xl">
//     //               $ {parseInt(planInfo.unitAmount) * 0.01}
//     //             </p>
//     //             <p className="ml-4 text-base">
//     //               {' '}
//     //               / user / {planInfo.interval}
//     //             </p>
//     //           </div>
//     //         </>
//     //       )}
//     //       {status === 'canceled' && (
//     //         <>
//     //           <PrimaryLink
//     //             color="blue"
//     //             href="/pricing"
//     //             className="mt-4 rounded-md"
//     //           >
//     //             Reactivate Now
//     //           </PrimaryLink>
//     //         </>
//     //       )}
//     //     </Card>
//     //   )}
//     //   {status !== 'never' ? (
//     //     <Card bg="" className="shadow-none">
//     //       <h2 className="text-lg font-medium leading-6 text-gray-900">
//     //         Payment Portal
//     //       </h2>
//     //       <h3 className="text-md mt-6 font-medium leading-6 text-gray-900">
//     //         We partnered with Stripe to simplify billing.
//     //       </h3>
//     //       <button
//     //         type="button"
//     //         className="mt-6 flex items-center justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-center text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//     //         onClick={redirectToCustomerPortal}
//     //       >
//     //         {isLoading ? (
//     //           <Spinner fill="fill-white" />
//     //         ) : (
//     //           <span>View Billing Portal</span>
//     //         )}
//     //       </button>
//     //     </Card>
//     //   ) : (
//     //     <Card>
//     //       <h2 className="text-2xl font-medium leading-6 text-gray-900">
//     //         Upgrade Your Account
//     //       </h2>
//     //       <PricingOptions inProduct />
//     //     </Card>
//     //   )}
//     //   <Card bg="" className="shadow-none">
//     //     <h2 className="text-lg font-medium leading-6 text-gray-900">
//     //       Support
//     //     </h2>
//     //     <h3 className="text-md mt-6 font-medium leading-6 text-gray-900">
//     //       Need help with something?
//     //     </h3>

//     //     <p className="text-md mt-6 leading-6 text-gray-900">
//     //       Contact{' '}
//     //       <a href="mailto:support@restoregeek.app" className="underline">
//     //         support@restoregeek.app
//     //       </a>
//     //     </p>
//     //   </Card>
//     // </div>
//     // </AppContainer>
//   );
// }

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function Subscriptions() {
  const [plans, setPlans] = useState<
    {
      id: string;
      name: string;
      description: string;
      price: number;
      interval: string;
      price_id: string;
    }[]
  >([]);

  useEffect(() => {
    // Fetch subscription plans from your API
    fetch("/api/subscription-plans")
      .then((res) => res.json())
      .then((data) => setPlans(data));
  }, []);

  const handleSubscribe = async (priceId: string) => {
    const stripe = await stripePromise;
    const { sessionId } = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ priceId }),
    }).then((res) => res.json());

    const result = await stripe?.redirectToCheckout({ sessionId });

    if (result.error) {
      console.error(result.error);
    }
  };

  return (
    <div>
      <h1>Choose a Subscription Plan</h1>
      {plans.map((plan) => (
        <div key={plan.id}>
          <h2>{plan.name}</h2>
          <p>{plan.description}</p>
          <p>
            Price: ${plan.price / 100} / {plan.interval}
          </p>
          <button onClick={() => handleSubscribe(plan.price_id)}>
            Subscribe
          </button>
        </div>
      ))}
    </div>
  );
}
