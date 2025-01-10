import { createClient } from "@lib/supabase/server";
import { appRouter } from "@servicegeek/api";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { NextRequest } from "next/server";

const handler = async (request: NextRequest) => {

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: async () => ({
      user,
      session,
      supabase
    }),
  });
};

export { handler as GET, handler as POST };