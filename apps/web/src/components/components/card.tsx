export const Card = ({
  className,
  children,
  footer,
  bg = 'bg-white ',
}: {
  className?: string
  children: React.ReactNode
  footer?: React.ReactNode
  bg?: string
}) => {
  return (
    <div className={`rounded-md shadow ${className ? className : ''}`}>
      <div className={`${bg} py-6 px-4 sm:p-6`}>{children}</div>
      {footer && (
        <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">{footer}</div>
      )}
    </div>
  )
}