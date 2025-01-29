import { Database } from "./database";

declare global {
  type User = Database["public"]["Tables"]["User"]["Row"];
  type Organization = Database["public"]["Tables"]["Organization"]["Row"];
  type FlatTeamMember =
    Database["public"]["Tables"]["UserToOrganization"]["Row"];

  type TeamMember = FlatTeamMember & {
    User: { firstName: string; lastName: string; email: string } | null;
  };

  type Cost = Database["public"]["Tables"]["Cost"]["Row"];
  type CostType = "subcontractor" | "materials" | "miscellaneous" | "labor";
  type CalendarEvent = Database["public"]["Tables"]["CalendarEvent"]["Row"];

  type FlatProject = Database["public"]["Tables"]["Project"]["Row"];
  type FlatImage = Database["public"]["Tables"]["Image"]["Row"];
  type FlatAssignee = Database["public"]["Tables"]["UserToProject"]["Row"];
  type Assignee = FlatAssignee & {
    User: { firstName: string; lastName: string; email: string } | null;
  };
  type Image = FlatImage & { url: string };
  interface Project extends FlatProject {
    images: Image[];
    assignees: Assignee[];
  }
}
