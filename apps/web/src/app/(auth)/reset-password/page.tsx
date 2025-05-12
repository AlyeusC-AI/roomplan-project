import { Metadata } from "next";
import { ResetPasswordForm } from "./main";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
