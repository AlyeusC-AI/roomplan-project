import FilterLabel from "./FilterLabel";
import { userPreferenceStore } from "@state/user-prefrence";
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group";

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
      <RadioGroup
        value={savedPhotoGroupBy}
        onValueChange={onClick}
        className='grid grid-cols-2 gap-2 text-xs'
      >
        <div className='flex items-center space-x-2'>
          <RadioGroupItem value='date' id='date' />
          <span>Date</span>
        </div>
        <div className='flex items-center space-x-2'>
          <RadioGroupItem value='room' id='room' />
          <span>Room</span>
        </div>
      </RadioGroup>
      {/* <Button variant='outline' onClick={onClick}>
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
      </Button> */}
    </div>
  );
}
