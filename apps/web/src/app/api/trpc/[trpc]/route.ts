import { createClient } from "@lib/supabase/server";
import { appRouter, createContext } from "@servicegeek/api";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { NextRequest } from "next/server";

const handler = async (request: NextRequest) => {
  const supabase = await createClient();
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: async () => {
      return await createContext(supabase);
    },
  });
};

export { handler as GET, handler as POST };
