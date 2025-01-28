import { floorOptions } from "@components/DesignSystem/CreationSelect/carrierOptions";
import SavedOptionSelect from "@components/DesignSystem/CreationSelect/SavedOptionSelect";
import { savedOptionsStore } from "@atoms/saved-options";

export default function FloorMaterial({
  defaultValue,
  onChange,
}: {
  defaultValue: string;
  onChange: (s: string) => void;
}) {
  const savedOptions = savedOptionsStore((state) => state);

  return (
    <div className='col-span-1'>
      <SavedOptionSelect
        className='col-span-6'
        name='floor-material'
        title='Floor Material'
        onSave={(value) => {
          console.log("saving", value);
          onChange(value || "");
        }}
        defaultValue={
          defaultValue
            ? savedOptions.floorMaterial.find(
                (material) => material.value === defaultValue
              )
            : undefined
        }
        optionType='floorMaterial'
        defaultOptions={floorOptions}
      />
    </div>
  );
}
