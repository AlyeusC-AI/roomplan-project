const Input = ({
  defaultValue,
  type,
  name,
  id,
  className,
  autoComplete,
}: {
  defaultValue: string
  type: string
  name: string
  id: string
  className?: string
  autoComplete?: string
}) => (
  <input
    defaultValue={defaultValue}
    type={type}
    name={name}
    id={id}
    autoComplete={autoComplete}
    className={`mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
      className ? className : ''
    }`}
  />
)

export default Input
