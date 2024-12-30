import { Metadata } from "next";
import Organization from "./main";

export const metadata: Metadata = {
  title: "Organization Settings",
  description: "Access organization settings and manage your team",
  icons: ["/favicon.ico"],
};

export default async function Component() {
  return <Organization />
}