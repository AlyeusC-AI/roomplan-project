import ContentfulImage from './ContentFulImage'

export default function Avatar({
  name,
  picture,
  title,
}: {
  name: string
  title: string
  picture: { url: string }
}) {
  return (
    <div className="flex items-center">
      <div className="relative mr-4 h-12 w-12">
        <ContentfulImage
          src={picture.url}
          fill
          className="rounded-full"
          alt={name}
        />
      </div>
      <div>
        <div className="text-xl font-bold">{name}</div>
        <div className="text-base font-semibold">{title}</div>
      </div>
    </div>
  )
}
