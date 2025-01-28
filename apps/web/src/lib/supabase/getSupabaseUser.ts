import getUser from "@servicegeek/db/queries/user/getUser";
import { createClient } from "./server";

const getSupabaseUser = async () => {
  const supabaseClient = await createClient();

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();
  if (!user) {
    return { user: null, accessToken: null };
  }
  const supabaseUser = await getUser(user.id);
  return {
    user: supabaseUser,
    accessToken: session?.access_token,
    emailConfirmedAt: user.email_confirmed_at,
  };
};

export default getSupabaseUser;
