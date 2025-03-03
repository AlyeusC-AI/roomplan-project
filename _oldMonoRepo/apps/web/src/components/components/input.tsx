// import clsx from 'clsx'
// import React, { useState } from 'react'
// import { ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
// import TextareaAutosize from 'react-textarea-autosize'
// import { Spinner } from '@components/components'
// import debounce from 'lodash.debounce'

// const formClasses =
//   'block w-full appearance-none rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-blue-500 sm:text-sm'

// function Label({ id, children }: React.PropsWithChildren<{ id: string }>) {
//   return (
//     <label
//       htmlFor={id}
//       className="mb-3 block text-sm font-medium text-gray-700"
//     >
//       {children}
//     </label>
//   )
// }

// export function TextField({
//   id,
//   label,
//   type = 'text',
//   className = '',
//   ...props
// }: React.ComponentPropsWithoutRef<'input'> & { label: string; id: string }) {
//   return (
//     <div className={className}>
//       {label && <Label id={id}>{label}</Label>}
//       <input id={id} type={type} {...props} className={formClasses} />
//     </div>
//   )
// }

// export function SelectField({
//   id,
//   label,
//   className = '',
//   ...props
// }: React.ComponentPropsWithoutRef<'select'> & {
//   id: string
//   label: string
// }) {
//   return (
//     <div className={className}>
//       {label && <Label id={id}>{label}</Label>}
//       <select id={id} {...props} className={clsx(formClasses, 'pr-8')} />
//     </div>
//   )
// }

// export const PhoneNumber = ({
//   onCustomChange,
//   ...rest
// }: React.ComponentPropsWithoutRef<'input'> & {
//   onCustomChange: (s: string) => void
// }) => {
//   const [value, setValue] = useState<string>('')

//   const onInternalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const targetValue = formatNumber(e.target.value)
//     setValue(targetValue)
//     onCustomChange(targetValue)
//   }

//   return (
//     <input
//       type="tel"
//       value={value}
//       onChange={onInternalChange}
//       maxLength={13}
//       {...rest}
//     />
//   )
// }

// const formatNumber = (phoneNumber: string): string => {
//   const number = phoneNumber.trim().replace(/[^0-9]/g, '')

//   if (number.length < 4) return number
//   if (number.length < 7) return number.replace(/(\d{3})(\d{1})/, '$1-$2')
//   if (number.length < 11)
//     return number.replace(/(\d{3})(\d{3})(\d{1})/, '$1-$2-$3')
//   return number.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
// }

// interface TextInputProps {
//   labelText: string
//   name: string
//   error: boolean
//   errorText?: string
//   value: string
//   onChange: React.ChangeEventHandler<HTMLInputElement>
//   required: boolean
//   inputProps: React.HTMLProps<HTMLInputElement>
//   includeLabel?: boolean
//   containerClass?: string
// }

// export function TextInput({
//   labelText,
//   name,
//   error,
//   errorText,
//   value,
//   onChange,
//   required = false,
//   inputProps,
//   includeLabel = true,
//   containerClass = '',
// }: TextInputProps) {
//   return (
//     <div className={containerClass}>
//       {includeLabel && (
//         <label
//           htmlFor={name}
//           className="mb-1 block  text-sm font-medium text-gray-700"
//         >
//           {labelText}
//         </label>
//       )}
//       <div className="relative rounded-md shadow-sm">
//         <input
//           type="text"
//           name={name}
//           id={name}
//           className={`block w-full rounded-md pr-10 sm:text-sm ${
//             error
//               ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500'
//               : ''
//           }`}
//           aria-invalid="true"
//           aria-describedby={`${name}-error`}
//           value={value}
//           onChange={onChange}
//           required={required}
//           {...inputProps}
//         />
//         {error && (
//           <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
//             <ExclamationCircleIcon
//               className="h-5 w-5 text-red-500"
//               aria-hidden="true"
//             />
//           </div>
//         )}
//       </div>
//       {error && errorText && (
//         <p className="mt-2 text-sm text-red-600" id={`${name}-error`}>
//           {errorText}
//         </p>
//       )}
//     </div>
//   )
// }

// export function AutoSaveTextInput({
//   title,
//   name,
//   units,
//   defaultValue,
//   onSave,
//   className,
//   placeholder = '',
//   isTextArea = false,
//   type = 'text',
//   pattern,
//   disabled = false,
//   ignoreInvalid = false,
//   value,
//   isPhonenumber = false,
//   inputClassName = '',
// }: {
//   title?: string
//   name: string
//   units?: string
//   defaultValue: string | number
//   onSave: (s: string) => Promise<void>
//   className?: string
//   placeholder?: string
//   isTextArea?: boolean
//   type?: string
//   pattern?: string
//   disabled?: boolean
//   ignoreInvalid?: boolean
//   value?: string
//   isPhonenumber?: boolean
//   inputClassName?: string
// }) {
//   const [loading, setLoading] = useState(false)
//   const [invalid, setInvalid] = useState(false)
//   const [internalValue, setInternalValue] = useState(defaultValue)

//   const saveHandler = async (
//     e:
//       | React.ChangeEvent<HTMLInputElement>
//       | React.ChangeEvent<HTMLTextAreaElement>
//   ) => {
//     setInvalid(false)

//     if (
//       !ignoreInvalid &&
//       (!e || !e.target || !e.target.value || !e.target.validity.valid)
//     ) {
//       setInvalid(true)
//       return
//     }
//     setLoading(true)
//     await onSave(e.target.value)
//     setLoading(false)
//     setInvalid(false)
//   }

//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   const debouncedChangeHandler = React.useMemo(
//     () => debounce(saveHandler, 500),
//     []
//   )
//   const InputType = isTextArea ? TextareaAutosize : 'input'

//   React.useEffect(() => {
//     return () => {
//       debouncedChangeHandler.cancel()
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [])

//   return (
//     <div className={clsx(className)}>
//       {title && (
//         <label
//           htmlFor={name}
//           className="block text-sm font-medium text-gray-700"
//         >
//           {title}
//         </label>
//       )}
//       <div className={clsx(' relative mt-1 rounded-md shadow-sm')}>
//         {isPhonenumber ? (
//           <TextField
//             label={placeholder}
//             id={name}
//             value={internalValue}
//             onChange={(event) => {
//               setInternalValue(value ? value : '')
//               debouncedChangeHandler({
//                 // @ts-ignore
//                 target: { value: value ?? '' },
//               })
//             }}
//             className={clsx(
//               'block w-full rounded-md border-gray-300 pr-12 text-sm focus:border-blue-500 focus:ring-blue-500',
//               disabled && 'bg-gray-200 text-black'
//             )}
//             placeholder={placeholder}
//           />
//         ) : (
//           <InputType
//             type={type}
//             name={name}
//             id={name}
//             pattern={pattern}
//             className={clsx(
//               'block w-full rounded-md border-gray-300 pr-12 text-sm focus:border-blue-500 focus:ring-blue-500',
//               disabled && 'bg-gray-200 text-black',
//               inputClassName
//             )}
//             placeholder={placeholder || title}
//             aria-describedby={`${name}-units`}
//             defaultValue={defaultValue}
//             onChange={debouncedChangeHandler}
//             disabled={disabled}
//             {...(isTextArea ? { maxRows: 10, minRows: 3 } : {})}
//             {...(value ? { value } : {})}
//           />
//         )}
//         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
//           <span
//             className={clsx(
//               'flex flex-row-reverse text-gray-500 sm:text-sm',
//               disabled && 'text-black'
//             )}
//             id={`${name}-units`}
//           >
//             {loading ? (
//               <Spinner bg="text-blue-500" fill="fill-white" />
//             ) : (
//               <>{units}</>
//             )}
//             {invalid ? <XMarkIcon className="h-6 text-red-600" /> : null}
//           </span>
//         </div>
//       </div>
//     </div>
//   )
// }
