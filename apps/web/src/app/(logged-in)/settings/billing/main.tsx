"use client";

import { useState } from "react";

export default async function BillingPage() {
  return (
    // <AppContainer
    //   renderSecondaryNavigation={() => <ProjectsNavigationContainer />}
    // >
    <></>
    // <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
    //   {planInfo && (
    //     <Card bg="" className="shadow-none">
    //       <h2 className="text-lg font-medium leading-6 text-gray-900">
    //         Billing Information
    //         {status === 'canceled' && (
    //           <span className=" ml-2 rounded-full bg-red-200 px-2 py-1 text-sm">
    //             Cancelled
    //           </span>
    //         )}
    //         {status === 'active' && (
    //           <span className=" ml-2 rounded-full bg-green-200 px-2 py-1 text-sm">
    //             active
    //           </span>
    //         )}
    //       </h2>
    //       {status === 'active' && (
    //         <>
    //           {productInfo && (
    //             <h3 className="text-md mt-6 font-medium leading-6 text-gray-900">
    //               Plan: {productInfo.name}
    //             </h3>
    //           )}
    //           <div className="mt-6 flex items-baseline">
    //             <p className="text-4xl">
    //               $ {parseInt(planInfo.unitAmount) * 0.01}
    //             </p>
    //             <p className="ml-4 text-base">
    //               {' '}
    //               / user / {planInfo.interval}
    //             </p>
    //           </div>
    //         </>
    //       )}
    //       {status === 'canceled' && (
    //         <>
    //           <PrimaryLink
    //             color="blue"
    //             href="/pricing"
    //             className="mt-4 rounded-md"
    //           >
    //             Reactivate Now
    //           </PrimaryLink>
    //         </>
    //       )}
    //     </Card>
    //   )}
    //   {status !== 'never' ? (
    //     <Card bg="" className="shadow-none">
    //       <h2 className="text-lg font-medium leading-6 text-gray-900">
    //         Payment Portal
    //       </h2>
    //       <h3 className="text-md mt-6 font-medium leading-6 text-gray-900">
    //         We partnered with Stripe to simplify billing.
    //       </h3>
    //       <button
    //         type="button"
    //         className="mt-6 flex items-center justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-center text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    //         onClick={redirectToCustomerPortal}
    //       >
    //         {isLoading ? (
    //           <Spinner fill="fill-white" />
    //         ) : (
    //           <span>View Billing Portal</span>
    //         )}
    //       </button>
    //     </Card>
    //   ) : (
    //     <Card>
    //       <h2 className="text-2xl font-medium leading-6 text-gray-900">
    //         Upgrade Your Account
    //       </h2>
    //       <PricingOptions inProduct />
    //     </Card>
    //   )}
    //   <Card bg="" className="shadow-none">
    //     <h2 className="text-lg font-medium leading-6 text-gray-900">
    //       Support
    //     </h2>
    //     <h3 className="text-md mt-6 font-medium leading-6 text-gray-900">
    //       Need help with something?
    //     </h3>

    //     <p className="text-md mt-6 leading-6 text-gray-900">
    //       Contact{' '}
    //       <a href="mailto:support@servicegeek.app" className="underline">
    //         support@servicegeek.app
    //       </a>
    //     </p>
    //   </Card>
    // </div>
    // </AppContainer>
  );
}

// export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
//   try {
//     const { user, orgAccessLevel } = await getUserWithAuthStatus(ctx)
//     if (!user) {
//       return {
//         redirect: {
//           destination: '/login',
//           permanent: false,
//         },
//       }
//     }

//     if (orgAccessLevel === ORG_ACCESS_LEVEL.REMOVED) {
//       console.error('Access Revoked')
//       return {
//         redirect: {
//           destination: '/access-revoked',
//           permanent: false,
//         },
//       }
//     }
//     const orgPublicId = user.org?.organization.publicId

//     if (!orgPublicId) {
//       console.error('No Org ID')
//       return {
//         redirect: {
//           destination: '/projects',
//           permanent: false,
//         },
//       }
//     }
//     const organization = await getOrganization(orgPublicId)
//     if (!organization) {
//       console.error('No Org')
//       return {
//         props: {
//           error: 'Could not find Organization.',
//         },
//       }
//     }

//     const subscriptions = await getSubscriptions(organization.id)
//     const subscription = subscriptions[0]
//     if (orgAccessLevel !== ORG_ACCESS_LEVEL.ADMIN) {
//       console.error('Invalid org access level', orgAccessLevel)
//       return {
//         redirect: {
//           destination: '/projects',
//           permanent: false,
//         },
//       }
//     }

//     let planInfo
//     let productInfo

//     if (subscription) {
//       const price = await getPrice(subscription.pricesId)
//       if (price) {
//         const { unitAmount, currency, type, interval } = price
//         planInfo = {
//           unitAmount: `${unitAmount}`,
//           currency,
//           type,
//           interval,
//         }

//         const product = await getProduct(price.productId)

//         if (product) {
//           productInfo = {
//             name: product.name,
//           }
//         }
//       }
//     }

//     const subscriptionStatus = await getSubcriptionStatus(user.id)

//     return {
//       props: {
//         status: !subscription ? 'never' : subscription.status,
//         planInfo: planInfo || null,
//         productInfo: productInfo || null,
//         userInfo: getUserInfo(user),
//         orgInfo: getOrgInfo(user),
//         subscriptionStatus,
//       },
//     }
//   } catch (e) {
//     console.error(e)
//     return {
//       props: {},
//     }
//   }
// }
