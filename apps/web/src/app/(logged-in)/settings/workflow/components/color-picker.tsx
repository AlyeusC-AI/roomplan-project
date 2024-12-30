import { Dispatch, SetStateAction } from 'react'
import { RadioGroup } from '@headlessui/react'
import clsx from 'clsx'
import { CheckIcon } from 'lucide-react'

export const STATUS_COLORS = [
  {
    name: 'Slate',
    bgColor: 'bg-slate-500',
    selectedColor: 'ring-slate-500',
  },
  {
    name: 'Gray',
    bgColor: 'bg-gray-500',
    selectedColor: 'ring-gray-500',
  },
  {
    name: 'Black',
    bgColor: 'bg-black',
    selectedColor: 'ring-black',
  },
  {
    name: 'Red',
    bgColor: 'bg-red-500',
    selectedColor: 'ring-red-500',
  },
  {
    name: 'Orange',
    bgColor: 'bg-orange-500',
    selectedColor: 'ring-orange-500',
  },
  {
    name: 'Yellow',
    bgColor: 'bg-yellow-500',
    selectedColor: 'ring-yellow-500',
  },
  { name: 'Green', bgColor: 'bg-green-500', selectedColor: 'ring-green-500' },

  {
    name: 'Emerald',
    bgColor: 'bg-emerald-500',
    selectedColor: 'ring-emerald-500',
  },
  {
    name: 'Cyan',
    bgColor: 'bg-cyan-500',
    selectedColor: 'ring-cyan-500',
  },
  { name: 'Blue', bgColor: 'bg-blue-500', selectedColor: 'ring-blue-500' },
  {
    name: 'Violet',
    bgColor: 'bg-violet-500',
    selectedColor: 'ring-violet-500',
  },
  {
    name: 'Purple',
    bgColor: 'bg-purple-500',
    selectedColor: 'ring-purple-500',
  },
  { name: 'Pink', bgColor: 'bg-pink-500', selectedColor: 'ring-pink-500' },
  {
    name: 'Rose',
    bgColor: 'bg-rose-500',
    selectedColor: 'ring-rose-500',
  },
]

export default function ColorPicker({
  labelName,
  newColor,
  setNewColor,
}: {
  labelName: string
  newColor: string
  setNewColor: Dispatch<SetStateAction<string>>
}) {
  const selectedColor = STATUS_COLORS.find((s) => s.name === newColor)

  return (
    <RadioGroup
      value={selectedColor}
      onChange={(sel: {
        name: string
        bgColor: string
        selectedColor: string
      }) => setNewColor(sel.name)}
    >
      <RadioGroup.Label className="block text-xs font-medium text-gray-900">
        Choose a label color
      </RadioGroup.Label>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {STATUS_COLORS.map((color) => (
          <RadioGroup.Option
            key={color.name}
            value={color}
            className={({ active, checked }) =>
              clsx(
                color.selectedColor,
                active && checked ? 'ring ring-offset-1' : '',
                !active && checked ? 'ring-2' : '',
                'relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none'
              )
            }
          >
            <RadioGroup.Label as="span" className="sr-only">
              {color.name}
            </RadioGroup.Label>
            <span
              aria-hidden="true"
              className={clsx(
                color.bgColor,
                'h-8 w-8 rounded-full border border-black border-opacity-10'
              )}
            />
            {color.name === newColor && (
              <CheckIcon
                className="absolute top-1/2 left-1/2 h-6 -translate-x-1/2 -translate-y-1/2 transform"
                color="#fff"
              />
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  )
}
