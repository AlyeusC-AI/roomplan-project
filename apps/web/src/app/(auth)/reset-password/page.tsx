import { Metadata } from "next";
import { ResetPasswordForm } from "./main";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return <ResetPasswordForm token={searchParams.token} />;
}
