import { wallOptions } from "@components/DesignSystem/CreationSelect/carrierOptions";
import SavedOptionSelect from "@components/DesignSystem/CreationSelect/SavedOptionSelect";
import { savedOptionsStore } from "@atoms/saved-options";

export default function WallMaterial({
  defaultValue,
  onChange,
}: {
  defaultValue: string;
  onChange: (s: string) => void;
}) {
  console.log("🚀 ~ defaultValue:", defaultValue)
  const savedOptions = savedOptionsStore((state) => state);
  return (
    <div className='col-span-1'>
      <SavedOptionSelect
        className='col-span-6'
        name='wall-material'
        title='Wall Material'
        onSave={(value) => {
          console.log("saving", value);
          onChange(value || "");
        }}
        defaultValue={
          defaultValue
            ? savedOptions.wallMaterial.find(
                (material) =>
                  material.value == defaultValue ||
                  material.label == defaultValue
              )
            : undefined
        }
        optionType='wallMaterial'
        defaultOptions={wallOptions}
      />
    </div>
  );
}
