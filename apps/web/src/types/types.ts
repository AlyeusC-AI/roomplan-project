import { Database } from "./database";

declare global {
  type User = Database["public"]["Tables"]["User"]["Row"];
  type Organization = Database["public"]["Tables"]["Organization"]["Row"];
  type FlatTeamMember =
    Database["public"]["Tables"]["UserToOrganization"]["Row"];

  type TeamMember = FlatTeamMember & {
    User: {
      firstName: string;
      lastName: string;
      email: string;
      accessLevel: "owner" | "admin" | "viewer";
      id: string;
    } | null;
  };

  type Cost = Database["public"]["Tables"]["Cost"]["Row"];
  type CostType = "subcontractor" | "materials" | "miscellaneous" | "labor";
  type CalendarEvent = Database["public"]["Tables"]["CalendarEvent"]["Row"];

  type FlatProject = Database["public"]["Tables"]["Project"]["Row"];
  type FlatImage = Database["public"]["Tables"]["Image"]["Row"];
  type FlatAssignee = Database["public"]["Tables"]["UserToProject"]["Row"];
  type Assignee = FlatAssignee & {
    user: {
      firstName: string;
      lastName: string;
      email: string;
      accessLevel: "owner" | "admin" | "viewer";
      id: string;
    } | null;
  };
  type Image = FlatImage & { url: string };
  interface Project extends FlatProject {
    images: Image[];
    assignees: Assignee[];
  }
  type PendingRoofReport =
    Database["public"]["Tables"]["PendingRoofReports"]["Row"];

  type Status = Database["public"]["Tables"]["ProjectStatusValue"]["Row"];
  type RoomReading = Database["public"]["Tables"]["RoomReading"]["Row"];
  type GenericRoomReading =
    Database["public"]["Tables"]["GenericRoomReading"]["Row"] & {
      GenericRoomReadingImage: {
        id: number;
        imageKey: string;
        type: "floor" | "wall";
      }[];
    };
  type Room = Database["public"]["Tables"]["Room"]["Row"];
  type RoomReadingImage =
    Database["public"]["Tables"]["RoomReadingImage"]["Row"];
  interface ReadingsWithGenericReadings extends RoomReading {
    GenericRoomReading: GenericRoomReading[];
    RoomReadingImage: RoomReadingImage[];
  }

  type Equipment = Database["public"]["Tables"]["Equipment"]["Row"];

  type ProjectEquipmentFlat =
    Database["public"]["Tables"]["ProjectEquipment"]["Row"];

  type ProjectEquipment = ProjectEquipmentFlat & {
    Equipment: Equipment | null;
  };

  type AreaAffected = Database["public"]["Tables"]["AreaAffected"]["Row"];
  type AreaAffectedType = Database["public"]["Enums"]["AreaAffectedType"];
  type PropertyData = Database["public"]["Tables"]["PropertyData"]["Row"];

  type FlatNote = Database["public"]["Tables"]["Notes"]["Row"];
  type NotesAuditTrail = Database["public"]["Tables"]["NotesAuditTrail"]["Row"];

  type Note = FlatNote & {
    NotesAuditTrail: NotesAuditTrail[];
    NoteImage: {
      imageKey: string;
    }[];
  };

  type ImageNote = Database["public"]["Tables"]["ImageNote"]["Row"];

  type Inference = Database["public"]["Tables"]["Inference"]["Row"];

  type InferenceWithImages = Inference & {
    Image: Database["public"]["Tables"]["Image"]["Row"] | null;
  };

  interface RoomWithReadings extends Room {
    RoomReading: ReadingsWithGenericReadings[];
    Inference: InferenceWithImages[];
    Notes: Note[];
    AreaAffected: AreaAffected[];
  }
}
