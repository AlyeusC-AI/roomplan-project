import { sql } from "drizzle-orm";
import { pgTable, serial, text, timestamp, numeric, integer } from "drizzle-orm/pg-core";

// Migration for creating estimates and estimate_items tables
export async function up(db: any): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "estimates" (
      "id" SERIAL PRIMARY KEY,
      "public_id" TEXT NOT NULL UNIQUE,
      "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "number" TEXT NOT NULL,
      "client_name" TEXT NOT NULL,
      "client_email" TEXT,
      "project_public_id" TEXT,
      "project_name" TEXT,
      "po_number" TEXT,
      "estimate_date" TIMESTAMP NOT NULL,
      "expiry_date" TIMESTAMP NOT NULL,
      "subtotal" NUMERIC NOT NULL,
      "markup" NUMERIC,
      "discount" NUMERIC,
      "tax" NUMERIC,
      "total" NUMERIC NOT NULL,
      "deposit" NUMERIC,
      "status" TEXT NOT NULL DEFAULT 'draft' CHECK ("status" IN ('draft', 'sent', 'approved', 'rejected')),
      "notes" TEXT,
      "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
      "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "estimate_items" (
      "id" SERIAL PRIMARY KEY,
      "public_id" TEXT NOT NULL UNIQUE,
      "estimate_id" INTEGER NOT NULL REFERENCES "estimates"("id") ON DELETE CASCADE,
      "description" TEXT NOT NULL,
      "quantity" NUMERIC NOT NULL,
      "rate" NUMERIC NOT NULL,
      "amount" NUMERIC NOT NULL,
      "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
      "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);
}

export async function down(db: any): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "estimate_items";
    DROP TABLE IF EXISTS "estimates";
  `);
} 