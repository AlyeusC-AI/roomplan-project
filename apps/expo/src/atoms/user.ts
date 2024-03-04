import { atom } from "recoil";
import { Session } from "@supabase/supabase-js";

const userSessionState = atom<Session | null>({
  key: "session",
  default: null,
});

export default userSessionState;
