// "use client";

// import { ChangeEvent, FormEvent, useState } from "react";
// import { AuthLayout } from "@components/layouts/auth-layout";
// import { SelectField, TextField } from "@components/components/input";
// import Link from "next/link";
// import { useRouter, useSearchParams } from "next/navigation";

// import { PrimaryButton } from "@components/components/button";
// import { TertiaryLink } from "@components/components/link";
// import { LogoTextBlue } from "@components/components/logo";
// import { Alert } from "@components/components/alert";
// import { createClient } from "@lib/supabase/client";

// export default function Register() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [firstName, setFirstName] = useState("");
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [lead, setLead] = useState("Search Engine");
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const [refferal, setRefferal] = useState(searchParams?.get("referral") ?? "");
//   const supabase = createClient();
//   const [error, setError] = useState("");

//   const [loading, setLoading] = useState(false);

//   const handleSignup = async (e: FormEvent) => {
//     e.preventDefault();
//     try {
//       setLoading(true);
//       if (!firstName || !lastName || !lead) {
//         alert("Please complete the form");
//         setLoading(false);
//         return;
//       }

//       const { error } = await supabase.auth.signUp({
//         email,
//         password,
//         phone: phoneNumber,
//         options: {
//           data: {
//             confirmation_sent_at: Date.now(),
//             isSupportUser: false,
//             firstName,
//             lastName,
//             lead,
//             phone: phoneNumber,
//           },
//         },
//       });
//       console.log(error);
//       if (error) {
//         if (error.message === "User already registered") {
//           setError("An account with this email address already exists.");
//         } else {
//           setError(
//             "An unexpected error occured. Please refresh your browser and try again."
//           );
//         }
//         setLoading(false);
//         return;
//       }
//       try {
//         if (process.env.NODE_ENV === "production") {
//           const res = await fetch(
//             "https://hooks.slack.com/services/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",
//             {
//               method: "POST",
//               body: JSON.stringify({
//                 blocks: [
//                   {
//                     type: "header",
//                     text: {
//                       type: "plain_text",
//                       text: "New User Signup :wave:",
//                       emoji: true,
//                     },
//                   },
//                   {
//                     type: "section",
//                     fields: [
//                       {
//                         type: "mrkdwn",
//                         text: `*Email:*\n${email}`,
//                       },
//                       {
//                         type: "mrkdwn",
//                         text: `*Phone Number:*\n${phoneNumber}`,
//                       },
//                       {
//                         type: "mrkdwn",
//                         text: `*First name:*\n${firstName}`,
//                       },
//                       {
//                         type: "mrkdwn",
//                         text: `*Last name:*\n${lastName}`,
//                       },
//                       {
//                         type: "mrkdwn",
//                         text: `*Lead:*\n${lead}`,
//                       },
//                       {
//                         type: "mrkdwn",
//                         text: `*Refferal code:*\n${refferal}`,
//                       },
//                     ],
//                   },
//                 ],
//               }),
//             }
//           );
//         }
//         console.log("new user sign up alert sent");
//       } catch (e) {
//         console.log(e);
//       }
//       router.push("/projects");
//     } catch (error) {
//       setError(
//         "An unexpected error occured. Please refresh your browser and try again."
//       );
//       setLoading(false);
//     }
//   };

//   return (
//     <AuthLayout>
//       <div className='flex flex-col'>
//         <Link href='/' aria-label='Home'>
//           <LogoTextBlue />
//         </Link>
//         <div className=''>
//           <h2 className='text-lg font-semibold text-gray-900'>Free forever!</h2>
//           <p className='mt-2 text-gray-700'>No credit card necessary</p>
//           <p className='mt-2 text-sm text-gray-700'>
//             Already registered?{" "}
//             <TertiaryLink href='/login'>Sign in</TertiaryLink> to your account.
//           </p>
//         </div>
//       </div>
//       {error && (
//         <Alert title='Could not create account' type='error'>
//           <p className='mt-2 text-sm text-gray-700'>
//             {error}
//             {error === "An account with this email address already exists." && (
//               <div>
//                 <TertiaryLink href='/login'>Sign in</TertiaryLink> to your
//                 account.
//               </div>
//             )}
//           </p>
//         </Alert>
//       )}
//       <form
//         className='mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2'
//         onSubmit={handleSignup}
//       >
//         <TextField
//           label='First name'
//           id='firstName'
//           name='firstName'
//           type='text'
//           autoComplete='given-name'
//           value={firstName}
//           onChange={(e: ChangeEvent<HTMLInputElement>) =>
//             setFirstName(e.target.value)
//           }
//           required
//         />
//         <TextField
//           label='Last name'
//           id='lastName'
//           name='lastName'
//           type='text'
//           autoComplete='family-name'
//           value={lastName}
//           onChange={(e: ChangeEvent<HTMLInputElement>) =>
//             setLastName(e.target.value)
//           }
//           required
//         />
//         <TextField
//           className='col-span-full'
//           label='Email address'
//           id='email'
//           name='email'
//           type='email'
//           autoComplete='email'
//           value={email}
//           onChange={(e: ChangeEvent<HTMLInputElement>) =>
//             setEmail(e.target.value)
//           }
//           required
//         />
//         <TextField
//           className='col-span-full'
//           label='Phone Number'
//           id='phoneNumber'
//           name='phoneNumber'
//           type='text'
//           autoComplete='phone'
//           value={phoneNumber}
//           onChange={(e: ChangeEvent<HTMLInputElement>) =>
//             setPhoneNumber(e.target.value)
//           }
//           required
//         />
//         <TextField
//           className='col-span-full'
//           label='Password'
//           id='password'
//           name='password'
//           type='password'
//           autoComplete='new-password'
//           value={password}
//           onChange={(e: ChangeEvent<HTMLInputElement>) =>
//             setPassword(e.target.value)
//           }
//           required
//         />
//         <SelectField
//           className='col-span-full'
//           label='How did you hear about us?'
//           name='lead'
//           id='lead'
//           value={lead}
//           onChange={(e: ChangeEvent<HTMLSelectElement>) =>
//             setLead(e.target.value)
//           }
//         >
//           <option>Search Engine</option>
//           <option>LinkedIn Advertisement</option>
//           <option>At a Convention</option>
//           <option>Word of Mouth</option>
//           <option>Email</option>
//           <option>Other</option>
//         </SelectField>
//         <TextField
//           className='col-span-full'
//           label='Refferal Code (optional)'
//           id='refferal'
//           name='refferal'
//           type='text'
//           value={refferal}
//           onChange={(e: ChangeEvent<HTMLInputElement>) =>
//             setRefferal(e.target.value)
//           }
//         />
//         <div className='col-span-full'>
//           <input type='checkbox' required /> I have read and agree to the{" "}
//           <TertiaryLink href='/terms'>terms of service</TertiaryLink>.
//           <PrimaryButton
//             type='submit'
//             className='mb-5 mt-2 w-full'
//             loading={loading}
//           >
//             Sign up{" "}
//             <span aria-hidden='true' className='ml-2'>
//               &rarr;
//             </span>
//           </PrimaryButton>
//         </div>
//       </form>
//     </AuthLayout>
//   );
// }

// // export async function getServerSideProps(ctx: GetServerSidePropsContext) {
// //   let isLoggedIn = false
// //   try {
// //     const supabase = await createServerClient()
// //     const {
// //       data: { user },
// //     } = await supabase.auth.getUser()
// //     isLoggedIn = !!user
// //   } catch (e) {}

// //   if (isLoggedIn) {
// //     return {
// //       redirect: {
// //         destination: '/projects',
// //         permanent: false,
// //       },
// //     }
// //   }
// //   return {
// //     props: {}, // will be passed to the page component as props
// //   }
// // }
