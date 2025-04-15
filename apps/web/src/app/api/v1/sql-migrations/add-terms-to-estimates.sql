-- Add terms field to Estimates table
ALTER TABLE "Estimates" 
ADD COLUMN IF NOT EXISTS "terms" text;

-- Update permissions to include the new column
ALTER TABLE "Estimates" ENABLE ROW LEVEL SECURITY;

-- Make sure the policy applies to the new column
DROP POLICY IF EXISTS "Users can view their own estimates" ON "Estimates";
CREATE POLICY "Users can view their own estimates" 
  ON "Estimates" 
  FOR ALL 
  USING ("userId" = auth.uid()); 