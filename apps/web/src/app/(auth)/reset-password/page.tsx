import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default function Component() {
  return <></>;
}

// export async function getServerSideProps(ctx: GetServerSidePropsContext) {
//   let isLoggedIn = false
//   try {
//     const supabase = await createServerClient()
//     // const { user, accessToken } = await getUser(ctx)
//     const {
//       data: { user },
//     } = await supabase.auth.getUser()
//     isLoggedIn = !!user
//   } catch (e) {}

//   if (isLoggedIn) {
//     return {
//       redirect: {
//         destination: '/projects',
//         permanent: false,
//       },
//     }
//   }
//   return {
//     props: {}, // will be passed to the page component as props
//   }
// }
