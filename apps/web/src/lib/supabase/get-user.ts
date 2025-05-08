import { NextRequest } from "next/server";
import { createClient } from "./server";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { Database } from "@/types/database";
import { serverAuth } from "@/lib/server-auth";
export async function user(
  req: NextRequest
): Promise<[SupabaseClient<Database>, User]> {
  let currentUser: User | null = null;
  try {
    currentUser = await serverAuth.getCurrentUser();
  } catch (error) {
    console.error("Error getting current user:", error);
  }

  // Create a new Supabase client
  const supabase = await createClient();
  if (currentUser) {
    return [supabase, currentUser];
  }

  // Get the auth token from the request headers
  let authToken: string | undefined = undefined;

  // Check if the auth token is present in the request headers
  if (req.headers.get("auth-token")) {
    // Get the auth token from the request headers
    authToken = req.headers.get("auth-token") ?? undefined;
  }

  // Set the auth token
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(authToken);

  console.log(req.headers.get("auth-token"));

  currentUser = currentUser || user;
  // Check if there is an error
  // if (!user || error) {
  //   throw new Error("Unauthorized");
  // }

  return [supabase, currentUser!];
}
