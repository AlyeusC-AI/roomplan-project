import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getConstants } from "../utils/constants";
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = getConstants().supabaseUrl!;
const supabaseAnonKey = getConstants().supabaseAnonKey!;

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: false,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
