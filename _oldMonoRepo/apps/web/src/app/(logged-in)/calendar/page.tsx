import { Metadata } from "next";
import Calendar from "./main";

export const metadata: Metadata = {
  title: "Calender",
  description: "Access the organization's calender",
  icons: ["./favicon.ico"],
};

export default function Component() {
  return <Calendar />;
}
