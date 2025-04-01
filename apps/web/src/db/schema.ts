// Estimates
export const estimates = pgTable(
  "estimates",
  {
    id: serial("id").primaryKey(),
    publicId: text("public_id").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    number: text("number").notNull(),
    clientName: text("client_name").notNull(),
    clientEmail: text("client_email"),
    projectPublicId: text("project_public_id"),
    projectName: text("project_name"),
    poNumber: text("po_number"),
    estimateDate: timestamp("estimate_date").notNull(),
    expiryDate: timestamp("expiry_date").notNull(),
    subtotal: numeric("subtotal").notNull(),
    markup: numeric("markup"),
    discount: numeric("discount"),
    tax: numeric("tax"),
    total: numeric("total").notNull(),
    deposit: numeric("deposit"),
    status: text("status", { enum: ["draft", "sent", "approved", "rejected"] }).notNull().default("draft"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  }
);

export const estimateItems = pgTable(
  "estimate_items",
  {
    id: serial("id").primaryKey(),
    publicId: text("public_id").notNull().unique(),
    estimateId: integer("estimate_id")
      .notNull()
      .references(() => estimates.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    quantity: numeric("quantity").notNull(),
    rate: numeric("rate").notNull(),
    amount: numeric("amount").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  }
); 