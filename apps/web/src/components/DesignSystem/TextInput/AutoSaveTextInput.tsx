import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import Input, { parsePhoneNumber } from 'react-phone-number-input/input'
import TextareaAutosize from 'react-textarea-autosize'
import Spinner from '@components/Spinner'
import { XMarkIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import debounce from 'lodash.debounce'

export default function AutoSaveTextInput({
  title,
  name,
  units,
  defaultValue,
  onSave,
  className,
  placeholder = '',
  isTextArea = false,
  type = 'text',
  pattern,
  disabled = false,
  ignoreInvalid = false,
  value,
  isPhonenumber = false,
  inputClassName = '',
}: {
  title?: string
  name: string
  units?: string
  defaultValue: string | number
  onSave: (s: string) => Promise<void>
  className?: string
  placeholder?: string
  isTextArea?: boolean
  type?: string
  pattern?: string
  disabled?: boolean
  ignoreInvalid?: boolean
  value?: string
  isPhonenumber?: boolean
  inputClassName?: string
}) {
  const [loading, setLoading] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const [internalValue, setInternalValue] = useState(defaultValue)

  const saveHandler = async (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => {
    setInvalid(false)

    if (
      !ignoreInvalid &&
      (!e || !e.target || !e.target.value || !e.target.validity.valid)
    ) {
      setInvalid(true)
      return
    }
    setLoading(true)
    await onSave(e.target.value)
    setLoading(false)
    setInvalid(false)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedChangeHandler = useMemo(() => debounce(saveHandler, 500), [])
  const InputType = isTextArea ? TextareaAutosize : 'input'

  useEffect(() => {
    return () => {
      debouncedChangeHandler.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      <div className={clsx(' relative mt-1 rounded-md shadow-sm')}>
        {isPhonenumber ? (
          <Input
            country="US"
            value={
              internalValue
                ? // @ts-expect-error
                  parsePhoneNumber(internalValue, 'US')?.number
                : undefined
            }
            onChange={(value) => {
              setInternalValue(value ? value : '')
              debouncedChangeHandler({
                // @ts-expect-error
                target: { value: value ? value : '' },
              })
            }}
            className={clsx(
              'block w-full rounded-md border-gray-300 pr-12 text-sm focus:border-blue-500 focus:ring-blue-500',
              disabled && 'bg-gray-200 text-black'
            )}
            placeholder={placeholder}
          />
        ) : (
          <InputType
            type={type}
            name={name}
            id={name}
            pattern={pattern}
            className={clsx(
              'block w-full rounded-md border-gray-300 pr-12 text-sm focus:border-blue-500 focus:ring-blue-500',
              disabled && 'bg-gray-200 text-black',
              inputClassName
            )}
            placeholder={placeholder || title}
            aria-describedby={`${name}-units`}
            defaultValue={defaultValue}
            onChange={debouncedChangeHandler}
            disabled={disabled}
            {...(isTextArea ? { maxRows: 10, minRows: 3 } : {})}
            {...(value ? { value } : {})}
          />
        )}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <span
            className={clsx(
              'flex flex-row-reverse text-gray-500 sm:text-sm',
              disabled && 'text-black'
            )}
            id={`${name}-units`}
          >
            {loading ? (
              <Spinner bg="text-blue-500" fill="fill-white" />
            ) : (
              <>{units}</>
            )}
            {invalid ? <XMarkIcon className="h-6 text-red-600" /> : null}
          </span>
        </div>
      </div>
    </div>
  )
}
