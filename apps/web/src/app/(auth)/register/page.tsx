import { Metadata } from "next";
import { RegisterForm } from "./main";
import { Suspense } from "react";
export const metadata: Metadata = {
  title: "Sign Up",
};

export default async function Component() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
