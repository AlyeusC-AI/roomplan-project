import { Metadata } from "next";
import Calendar from "./main";

export const metadata: Metadata = {
  title: "Calendar",
};

export default async function Component() {
  return <Calendar />;
}
