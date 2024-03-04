import { wallOptions } from '@components/DesignSystem/CreationSelect/carrierOptions'
import SavedOptionSelect from '@components/DesignSystem/CreationSelect/SavedOptionSelect'
import { useRecoilState } from 'recoil'
import savedOptionsState from '@atoms/savedOptionsState'

export default function WallMaterial({
  defaultValue,
  onChange,
}: {
  defaultValue: string
  onChange: (s: string) => void
}) {
  const [savedOptions] = useRecoilState(savedOptionsState)
  return (
    <div className="col-span-1">
      <SavedOptionSelect
        className="col-span-6"
        name="wall-material"
        title="Wall Material"
        onSave={(value) => {
          console.log('saving', value)
          onChange(value || '')
        }}
        defaultValue={
          defaultValue
            ? savedOptions.wallMaterial.find(
                (material) => material.value === defaultValue
              )
            : undefined
        }
        optionType="wallMaterial"
        defaultOptions={wallOptions}
      />
    </div>
  )
}
