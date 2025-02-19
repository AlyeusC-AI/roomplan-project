import { Dispatch, SetStateAction } from "react";

import FilterLabel from "./FilterLabel";
import { Button } from "@components/ui/button";
import { Grid2X2, List } from "lucide-react";
import { userInfoStore } from "@atoms/user-info";

declare global {
  type PhotoViews = "photoGridView" | "photoListView";
}

export default function ViewPicker() {
  const user = userInfoStore();

  const onClick = () => {
    const newPhotoView =
      user.user?.photoView === "photoGridView"
        ? "photoListView"
        : "photoGridView";
    fetch("/api/v1/user", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        photoView: newPhotoView,
      }),
    });
    user.updateUser({ photoView: newPhotoView });
  };

  return (
    <div className='flex flex-col'>
      <FilterLabel>Switch View</FilterLabel>
      <Button variant='outline' onClick={onClick}>
        {user.user?.photoView === "photoListView" ? (
          <>
            <Grid2X2 className='mr-2 size-5' />
            Grid View
          </>
        ) : (
          <>
            <List className='mr-2 size-5' />
            List View
          </>
        )}
      </Button>
    </div>
  );
}
