import { Dispatch, SetStateAction } from "react";

import FilterLabel from "./FilterLabel";
import { Button } from "@components/ui/button";
import { Grid2X2, List } from "lucide-react";
import { userPreferenceStore } from "@state/user-prefrence";

declare global {
  type PhotoViews = "photoGridView" | "photoListView";
}

export default function ViewPicker() {
  const { savedPhotoView, updatePreference } = userPreferenceStore();

  const onClick = () => {
    const newPhotoView =
      savedPhotoView === "photoListView" ? "photoGridView" : "photoListView";
    updatePreference({
      savedPhotoView: newPhotoView,
    });
  };

  return (
    <div className='flex flex-col'>
      <FilterLabel>Switch View</FilterLabel>
      <Button variant='outline' onClick={onClick}>
        {savedPhotoView === "photoListView" ? (
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
