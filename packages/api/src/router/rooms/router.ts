import { router } from "../../trpc";

import getRooms from "./getRooms";

export const roomsRouter = router({
  getRooms,
});