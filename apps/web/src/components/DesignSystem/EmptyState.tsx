import Image from 'next/image'

const EmptyState = ({
  title,
  description,
  imagePath,
  height = 861,
  width = 1056,
}: {
  title: string
  description: string
  imagePath: string
  height?: number
  width?: number
}) => {
  return (
    <div className="mt-14 flex flex-col items-center justify-center">
      <div
        style={{
          width: width / 3,
          height: height / 3,
        }}
      >
        <Image
          src={imagePath}
          width={width / 3}
          height={height / 3}
          alt="Empty state"
        />
      </div>
      <div className="mt-8 flex h-full flex-col items-center justify-center">
        <h3 className="text-center text-2xl font-medium sm:text-3xl">
          {title}
        </h3>
        <p className="mt-4 max-w-md text-center">{description}</p>
      </div>
    </div>
  )
}

export default EmptyState
