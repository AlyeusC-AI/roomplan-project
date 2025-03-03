import { Metadata } from "next";
import ExpensesPage from "./main";

export const metadata: Metadata = {
  title: "Expenses",
  description: "Project Estimate and Details",
};

export default function Expenses() {
  return <ExpensesPage />;
}
