-- Create Estimates enum type
CREATE TYPE "public"."estimateStatus" AS ENUM ('draft', 'sent', 'approved', 'rejected', 'cancelled', 'expired');

-- Create Estimates table
CREATE TABLE IF NOT EXISTS "public"."Estimates" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "publicId" UUID DEFAULT gen_random_uuid() NOT NULL,
  "number" TEXT NOT NULL,
  "clientName" TEXT NOT NULL,
  "clientEmail" TEXT,
  "projectName" TEXT NOT NULL,
  "projectPublicId" UUID,
  "organizationPublicId" UUID,
  "amount" DECIMAL(10, 2) NOT NULL,
  "subtotal" DECIMAL(10, 2) NOT NULL,
  "taxRate" DECIMAL(5, 2),
  "taxAmount" DECIMAL(10, 2),
  "discountAmount" DECIMAL(10, 2),
  "markupPercentage" DECIMAL(5, 2),
  "markupAmount" DECIMAL(10, 2),
  "depositPercentage" DECIMAL(5, 2),
  "depositAmount" DECIMAL(10, 2),
  "notes" TEXT,
  "poNumber" TEXT,
  "status" "public"."estimateStatus" DEFAULT 'draft'::estimateStatus NOT NULL,
  "estimateDate" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "expiryDate" TIMESTAMP WITH TIME ZONE,
  "daysToPay" INTEGER,
  "hasPaymentSchedule" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "isDeleted" BOOLEAN DEFAULT false,
  "userId" UUID NOT NULL,
  "organizationId" UUID NOT NULL,
  PRIMARY KEY ("id"),
  UNIQUE ("publicId")
);

-- Create EstimateItems table
CREATE TABLE IF NOT EXISTS "public"."EstimateItems" (
  "id" UUID DEFAULT gen_random_uuid() NOT NULL,
  "publicId" UUID DEFAULT gen_random_uuid() NOT NULL,
  "estimatePublicId" UUID NOT NULL,
  "description" TEXT NOT NULL,
  "quantity" DECIMAL(10, 2) NOT NULL,
  "rate" DECIMAL(10, 2) NOT NULL,
  "amount" DECIMAL(10, 2) NOT NULL,
  "sortOrder" INTEGER,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "isDeleted" BOOLEAN DEFAULT false,
  PRIMARY KEY ("id"),
  UNIQUE ("publicId")
);

-- Add foreign key constraints
ALTER TABLE "public"."Estimates" ADD CONSTRAINT "Estimates_projectPublicId_fkey" 
    FOREIGN KEY ("projectPublicId") REFERENCES "public"."Project"("publicId") ON DELETE SET NULL;

ALTER TABLE "public"."Estimates" ADD CONSTRAINT "Estimates_organizationPublicId_fkey"
    FOREIGN KEY ("organizationPublicId") REFERENCES "public"."Organization"("publicId") ON DELETE SET NULL;

ALTER TABLE "public"."EstimateItems" ADD CONSTRAINT "EstimateItems_estimatePublicId_fkey"
    FOREIGN KEY ("estimatePublicId") REFERENCES "public"."Estimates"("publicId") ON DELETE CASCADE;

ALTER TABLE "public"."EstimateItems" ADD CONSTRAINT "EstimateItems_organizationPublicId_fkey"
    FOREIGN KEY ("organizationPublicId") REFERENCES "public"."Organization"("publicId") ON DELETE SET NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "Estimates_userId_idx" ON "public"."Estimates"("userId");
CREATE INDEX IF NOT EXISTS "Estimates_status_idx" ON "public"."Estimates"("status");
CREATE INDEX IF NOT EXISTS "Estimates_projectPublicId_idx" ON "public"."Estimates"("projectPublicId");
CREATE INDEX IF NOT EXISTS "EstimateItems_estimatePublicId_idx" ON "public"."EstimateItems"("estimatePublicId"); 