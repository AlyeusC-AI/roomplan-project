import { Metadata } from "next";
import UpdatePassword from "./main";

export const metadata: Metadata = {
  title: "Update Password",
};

export default function Component() {
  return <UpdatePassword />;
}
