-- Create the SavedLineItems table
CREATE TABLE IF NOT EXISTS public."SavedLineItems" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "publicId" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL,
  "organizationId" UUID NOT NULL,
  "description" TEXT NOT NULL,
  "rate" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "category" TEXT,
  "isDeleted" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint
ALTER TABLE public."SavedLineItems"
  ADD CONSTRAINT "SavedLineItems_userId_fkey"
  FOREIGN KEY ("userId")
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

ALTER TABLE public."SavedLineItems"
  ADD CONSTRAINT "SavedLineItems_organizationId_fkey"
  FOREIGN KEY ("organizationId")
  REFERENCES public."Organizations"(id)
  ON DELETE CASCADE;

-- Add index for faster lookups
CREATE INDEX "SavedLineItems_userId_idx" ON public."SavedLineItems" ("userId") WHERE "isDeleted" = FALSE;

-- Create RLS policy
ALTER TABLE public."SavedLineItems" ENABLE ROW LEVEL SECURITY;

-- Allow users to see and modify only their own saved line items
CREATE POLICY "Users can view their own saved line items"
  ON public."SavedLineItems"
  FOR SELECT
  USING ("userId" = auth.uid());

CREATE POLICY "Users can insert their own saved line items"
  ON public."SavedLineItems"
  FOR INSERT
  WITH CHECK ("userId" = auth.uid());

CREATE POLICY "Users can update their own saved line items"
  ON public."SavedLineItems"
  FOR UPDATE
  USING ("userId" = auth.uid());

CREATE POLICY "Users can delete their own saved line items"
  ON public."SavedLineItems"
  FOR DELETE
  USING ("userId" = auth.uid());

-- Insert some dummy data
INSERT INTO public."SavedLineItems" ("userId", "description", "rate", "category") 
SELECT 
  auth.uid(),
  'Web Development - Hourly',
  85.00,
  'Development'
FROM auth.users
LIMIT 1;

INSERT INTO public."SavedLineItems" ("userId", "description", "rate", "category") 
SELECT 
  auth.uid(),
  'UI/UX Design - Hourly',
  95.00,
  'Design'
FROM auth.users
LIMIT 1;

INSERT INTO public."SavedLineItems" ("userId", "description", "rate", "category") 
SELECT 
  auth.uid(),
  'Project Management',
  75.00,
  'Management'
FROM auth.users
LIMIT 1;

INSERT INTO public."SavedLineItems" ("userId", "description", "rate", "category") 
SELECT 
  auth.uid(),
  'Maintenance & Support - Monthly',
  500.00,
  'Support'
FROM auth.users
LIMIT 1; 