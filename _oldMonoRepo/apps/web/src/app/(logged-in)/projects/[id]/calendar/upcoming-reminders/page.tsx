import { Metadata } from "next";
import UpcomingReminders from "./main";

export const metadata: Metadata = {
  title: "Upcoming Reminders",
};

export default function UpcomingRemindersPage() {
  return <UpcomingReminders />;
}
