"server only";

import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

// if (
//   !process.env.NEXT_PUBLIC_SUPABASE_URL ||
//   !process.env.SUPABASE_SERVICE_ROLE_JWT
// ) {
//   throw "Missing supabase env vars";
// }

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_JWT || "";

export const supabaseServiceRole = createClient<Database>(
  supabaseUrl,
  serviceKey
);
