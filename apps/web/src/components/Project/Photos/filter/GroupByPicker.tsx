import FilterLabel from "./FilterLabel";
import { Button } from "@components/ui/button";
import { Calendar, Home } from "lucide-react";
import { userPreferenceStore } from "@state/user-prefrence";
import { user } from "@lib/supabase/get-user";

export default function GroupByPicker() {
  const { savedPhotoGroupBy, updatePreference } = userPreferenceStore();

  const onClick = () => {
    const newView = savedPhotoGroupBy == "date" ? "room" : "date";
    updatePreference({
      savedPhotoGroupBy: newView,
    });
    fetch("/api/v1/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        savedPhotoGroupBy: newView,
      }),
    });
  };

  return (
    <div className='flex flex-col'>
      <FilterLabel>Group By</FilterLabel>
      <Button variant='outline' onClick={onClick}>
        {savedPhotoGroupBy == "date" ? (
          <>
            <Calendar className='mr-2 size-5' />
            Date
          </>
        ) : (
          <>
            <Home className='mr-2 size-5' />
            Room
          </>
        )}
      </Button>
    </div>
  );
}
