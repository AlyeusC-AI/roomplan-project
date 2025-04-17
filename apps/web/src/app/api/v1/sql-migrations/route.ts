import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { readFileSync } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    // Create a Supabase client
    const supabase = createClient();

    // This is a protected admin endpoint
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow specific users (should be replaced with proper auth check)
    const isAdmin = await checkIfUserIsAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'src/app/api/v1/sql-migrations/add-terms-to-estimates.sql');
    const migrationSql = readFileSync(migrationPath, 'utf8');

    // Run the migration
    const { error } = await supabase.rpc('run_sql_migration', {
      sql: migrationSql
    });

    if (error) {
      console.error("Migration error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error running migration:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Function to check if a user is an admin
async function checkIfUserIsAdmin(userId: string): Promise<boolean> {
  // This should be replaced with proper role checking logic
  // For now, we'll assume all authenticated users are admins
  return true;
} 