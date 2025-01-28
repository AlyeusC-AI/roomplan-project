import CostsTable from "./CostsTable";
import CostsToolbar from "./CostsToolbar";

export default function Costs({
  rcvValue,
  actualValue,
}: {
  rcvValue: number;
  actualValue: number;
}) {
  return (
    <div>
      <CostsToolbar />
      <CostsTable rcvValue={rcvValue} actualValue={actualValue} />
    </div>
  );
}
