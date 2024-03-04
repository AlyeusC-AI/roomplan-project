import { createClient } from '@supabase/supabase-js'

if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_JWT
) {
  throw 'Missing supabase env vars'
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_JWT

export const supabaseServiceRole = createClient(supabaseUrl, supabaseAnonKey)
