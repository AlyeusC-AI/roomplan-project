import { router } from "../../trpc";

import create from "./create";
import deleteEquipment from "./delete";
import getAll from "./getAll";
import getAllUsed from "./getAllUsed";
import removeUsedItem from "./removeUsedItem";
import setName from "./setName";
import setQuantityUsed from "./setQuantityUsed";

export const equipmentRouter = router({
  create,
  delete: deleteEquipment,
  setName,
  getAll,
  setQuantityUsed,
  removeUsedItem,
  getAllUsed,
});
