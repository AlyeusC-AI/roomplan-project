import { Metadata } from "next";
import { RegisterForm } from "@components/auth/register-form";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default async function Component() {
  // await verifyUserLoggedOut()
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
