import FilterLabel from "./FilterLabel";
import { userPreferenceStore } from "@state/user-prefrence";
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group";

declare global {
  type PhotoViews = "photoGridView" | "photoListView";
}

export default function ViewPicker() {
  const { savedPhotoView, updatePreference } = userPreferenceStore();

  const handleViewChange = (value: string) => {
    updatePreference({
      savedPhotoView: value as PhotoViews,
    });
  };

  return (
    <div className='flex flex-col'>
      <FilterLabel>View</FilterLabel>
      <RadioGroup
        value={savedPhotoView}
        onValueChange={handleViewChange}
        className='grid grid-cols-2 gap-2 text-xs'
      >
        <div className='flex items-center space-x-2'>
          <RadioGroupItem value='photoGridView' id='photoGridView' />
          <span>Grid</span>
        </div>
        <div className='flex items-center space-x-2'>
          <RadioGroupItem value='photoListView' id='photoListView' />
          <span>List</span>
        </div>
      </RadioGroup>
    </div>
  );
}
