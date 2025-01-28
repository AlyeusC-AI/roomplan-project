import { Database } from "./database";

declare global {
  type User = Database["public"]["Tables"]["User"]["Row"];
  type Organization = Database["public"]["Tables"]["Organization"]["Row"];
  type TeamMember = Database["public"]["Tables"]["UserToOrganization"]["Row"];
}
