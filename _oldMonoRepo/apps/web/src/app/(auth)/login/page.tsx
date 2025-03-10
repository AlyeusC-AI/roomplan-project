import { Metadata } from "next";
import { LoginForm } from "./main";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign In",
};

export default async function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
