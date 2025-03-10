import {
  OnlySelectedFilterQueryParam,
  RoomsFilterQueryParam,
  SortDirectionQueryParam,
} from "@utils/types";
import { useSearchParams } from "next/navigation";
import { z } from "zod";

const useFilterParams = () => {
  const router = useSearchParams();

  let parsedRooms: z.infer<typeof RoomsFilterQueryParam> = undefined;
  let parsedOnlySelected: z.infer<typeof OnlySelectedFilterQueryParam> =
    undefined;
  let parsedSortDirection: z.infer<typeof SortDirectionQueryParam> = undefined;

  if (router.get("rooms")) {
    try {
      parsedRooms = RoomsFilterQueryParam.parse(
        JSON.parse(router.get("rooms") as string)
      );
    } catch (e) {
      console.error(e);
    }
  }

  if (router.get("onlySelected")) {
    try {
      parsedOnlySelected = OnlySelectedFilterQueryParam.parse(
        JSON.parse(router.get("onlySelected") as string)
      );
    } catch (e) {
      console.error(e);
    }
  }

  if (router.get("sortDirection")) {
    try {
      parsedSortDirection = SortDirectionQueryParam.parse(
        router.get("sortDirection") as string
      );
    } catch (e) {
      console.error(e);
    }
  }
  return {
    rooms: parsedRooms,
    onlySelected: parsedOnlySelected,
    sortDirection: parsedSortDirection,
  };
};

export default useFilterParams;
