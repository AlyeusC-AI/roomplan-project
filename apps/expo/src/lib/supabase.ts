import { createClient } from "@supabase/supabase-js";
import { getConstants } from "./constants";
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = getConstants().supabaseUrl!;
const supabaseAnonKey = getConstants().supabaseAnonKey!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: false,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
