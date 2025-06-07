import { Metadata } from "next";
import { LoginForm } from "./main";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
