import React, { useId, useState } from 'react'
import { OptionProps } from 'react-select/dist/declarations/src'
import { XMarkIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import dynamic from 'next/dynamic'
import { Option } from '@atoms/savedOptionsState'
import { v4 } from 'uuid'

import TertiaryButton from '../Buttons/TertiaryButton'

const CreatableSelect = dynamic(() => import('react-select/creatable'), {
  ssr: false,
})

const SelectOption = ({
  innerProps,
  isDisabled,
  isSelected,
  data,
  onDelete,
}: OptionProps & { onDelete: (option: Option) => Promise<void> }) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isConfirmingDelete, setisConfirmingDelete] = useState(false)

  const onClick: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isConfirmingDelete) {
      setisConfirmingDelete(true)
      return
    }
    if (isDeleting) return
    setIsDeleting(true)
    await onDelete(data as Option)
    setIsDeleting(false)
  }

  return !isDisabled ? (
    <div
      {...innerProps}
      className={clsx(
        'flex h-12 items-center justify-between px-2 py-1 ',
        isSelected && 'bg-blue-300',
        !isSelected && 'hover:cursor-pointer hover:bg-blue-50'
      )}
    >
      {(data as Option).label}
      {(data as Option).publicId && (
        <TertiaryButton
          onClick={onClick}
          loading={isDeleting}
          disabled={isDeleting}
          variant="danger"
        >
          {isConfirmingDelete ? (
            'Delete Permanently?'
          ) : (
            <XMarkIcon className="h-4" />
          )}
        </TertiaryButton>
      )}
    </div>
  ) : null
}

const CreationSelect = ({
  className,
  title,
  name,
  defaultValue,
  onSave,
  createOption,
  deleteOption,
  options,
}: {
  className?: string
  title?: string
  name: string
  defaultValue?: Option
  options: Option[]
  onSave: (option: Option) => void
  createOption: (label: string) => Promise<Option | undefined>
  deleteOption: (option: Option) => Promise<void>
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [value, setValue] = useState<Option | undefined>(defaultValue)
  const reactSelectId = useId()
  const handleCreate = async (inputValue: string) => {
    setIsLoading(true)
    const oldValue = value
    setValue({
      label: inputValue,
      value: v4(),
    })
    const newOption = await createOption(inputValue)
    if (!newOption) {
      setIsLoading(false)
      setValue(oldValue)
      return
    }
    setIsLoading(false)
    setValue(newOption)
    onSave(newOption)
  }

  const onDelete = async (option: Option) => {
    if (option.value === value?.value) {
      setValue(undefined)
    }
    await deleteOption(option)
  }

  return (
    <div className={clsx(className)}>
      {title && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {title}
        </label>
      )}
      <CreatableSelect
        instanceId={reactSelectId}
        className="mt-1 rounded-md shadow-sm"
        classNames={{
          control: () => 'py-[.14rem] !border-gray-300 !rounded-md',
          menuList: () => 'rounded-md border border-gray-200 shadow-lg',
          input: () => '!text-sm',
          singleValue: () => '!text-sm',
        }}
        isClearable
        isDisabled={isLoading}
        isLoading={isLoading}
        onChange={(newValue) => {
          setValue(newValue as Option)
          onSave(newValue as Option)
        }}
        onCreateOption={handleCreate}
        options={options}
        value={value}
        id={name}
        name={name}
        placeholder="Select or type to create"
        components={{
          Option: (props) => <SelectOption {...props} onDelete={onDelete} />,
        }}
      />
    </div>
  )
}

export default CreationSelect
