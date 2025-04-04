import EstimateList from "@/components/Estimates/EstimateList";

export const metadata = {
  title: "Estimates - ServiceGeek",
  description: "Manage your estimates and convert them to invoices",
};

export default function EstimatesPage() {
  return (
    <div className="container mx-auto py-6">
      <EstimateList />
    </div>
  );
} 