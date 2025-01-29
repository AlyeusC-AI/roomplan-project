import { Metadata } from "next";
import { verifyUserLoggedOut } from "@lib/server-side-fetching/verify-user-logged-out";
import { LoginForm } from "./main";

export const metadata: Metadata = {
  title: "Sign In",
};

export default async function LoginPage() {
  await verifyUserLoggedOut();
  return <LoginForm />;
}
