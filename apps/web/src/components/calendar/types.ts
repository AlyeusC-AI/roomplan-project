import { z } from "zod";

export const calendarEventSchema = z.object({
  subject: z
    .string()
    .min(2, {
      message: "Event subject must be at least 2 characters.",
    })
    .max(30, {
      message: "Event subject must not be longer than 30 characters.",
    }),
  projectId: z.number().optional(),
  description: z
    .string()
    .min(2, {
      message: "Event message must be at least 2 characters.",
    })
    .max(200, {
      message: "Event message must not be longer than 200 characters.",
    }),
  remindProjectOwners: z.boolean().optional(),
  remindClient: z.boolean().optional(),
  start: z.date({
    required_error: "Date is required",
  }),
  end: z.date({
    required_error: "Date is required",
  }),
  reminderTime: z.enum(["24h", "2h", "40m"]).optional(),
});
