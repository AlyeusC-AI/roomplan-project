import React, { HTMLProps } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'

interface TextInputProps {
  labelText: string
  name: string
  error: boolean
  errorText?: string
  value: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  required: boolean
  inputProps: HTMLProps<HTMLInputElement>
  includeLabel?: boolean
  containerClass?: string
}

export default function TextInput({
  labelText,
  name,
  error,
  errorText,
  value,
  onChange,
  required = false,
  inputProps,
  includeLabel = true,
  containerClass = '',
}: TextInputProps) {
  return (
    <div className={containerClass}>
      {includeLabel && (
        <label
          htmlFor={name}
          className="mb-1 block  text-sm font-medium text-gray-700"
        >
          {labelText}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {/* @ts-expect-error */}
        <input
          type="text"
          name={name}
          id={name}
          className={`block w-full rounded-md pr-10 sm:text-sm ${
            error
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500'
              : ''
          }`}
          aria-invalid="true"
          aria-describedby={`${name}-error`}
          value={value}
          onChange={onChange}
          required={required}
          {...inputProps}
        />
        {error && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ExclamationCircleIcon
              className="h-5 w-5 text-red-500"
              aria-hidden="true"
            />
          </div>
        )}
      </div>
      {error && errorText && (
        <p className="mt-2 text-sm text-red-600" id={`${name}-error`}>
          {errorText}
        </p>
      )}
    </div>
  )
}
