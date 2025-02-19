import { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { type inferAsyncReturnType } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";

type CreateContextOptions = {
  session: Session | null;
  user: User | null;
  supabase: SupabaseClient | null;
};

/** Use this helper for:
 * - testing, so we dont have to mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 **/
export const createInnerTRPCContext = async (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    user: opts.user,
    supabase: opts.supabase,
  };
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export const createContext = async (supabase: SupabaseClient) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return await createInnerTRPCContext({
    session,
    user,
    supabase,
  });
};

export type Context = inferAsyncReturnType<typeof createContext>;
