import React, { ChangeEvent, useState } from 'react'

import { formatNumber } from './formatNumber'

export interface PhoneNumberProps
  extends React.ComponentPropsWithoutRef<'input'> {
  onCustomChange: (s: string) => void
}

const PhoneNumber = ({ onCustomChange, ...rest }: PhoneNumberProps) => {
  const [value, setValue] = useState<string>('')

  const onInternalChange = (e: ChangeEvent<HTMLInputElement>) => {
    const targetValue = formatNumber(e.target.value)
    setValue(targetValue)
    onCustomChange(targetValue)
  }

  return (
    <input
      type="tel"
      value={value}
      onChange={onInternalChange}
      maxLength={13}
      {...rest}
    />
  )
}

export default PhoneNumber
