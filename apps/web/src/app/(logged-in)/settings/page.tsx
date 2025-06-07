import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "RestoreGeek account settings",
  icons: ["/favicon.ico"],
};

export default async function Component() {
  redirect("/settings/account");
}
