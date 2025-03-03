import { Database } from "./database";

type Project = Database["public"]["Tables"]["Projects"]["Row"];
type CostData = {
  id: string;
  name: string;
  actualCost: number;
  estimatedCost: number;
};

type CostDataType = "subcontractor" | "materials" | "miscellaneous" | "labor";

type ProjectStatus =
  | "active"
  | "mitigation"
  | "inspection"
  | "review"
  | "completed"
  | "inactive"
  | "incomplete";

type AreaAffectedType = "wall" | "floor" | "ceiling";

type AffectedAreaData = {
  material?: string;
  totalAreaRemoved?: string;
  totalAreaMicrobialApplied?: string;
  cause?: string;
  category?: number;
  cabinetryRemoved?: string;
  isDeleted?: boolean;
};

type DimensionData = {
  length?: string;
  width?: string;
  height?: string;
  totalSqft?: string;
  windows?: number;
  doors?: number;
  equipmentUsed?: string[];
};
