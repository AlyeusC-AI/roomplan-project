import clsx from 'clsx'
import Link from 'next/link'

import ContentfulImage from './ContentFulImage'

export default function CoverImage({
  title,
  url,
  slug,
}: {
  title: string
  url: string
  slug?: string
}) {
  const image = (
    <ContentfulImage
      width={600}
      height={300}
      alt={`Cover Image for ${title}`}
      className={clsx('rounded-md shadow-lg', {
        'hover:shadow-medium transition-shadow duration-200': slug,
      })}
      src={url}
    />
  )

  return (
    <div className="sm:mx-0">
      {slug ? <Link href={`/blog/${slug}`}>{image}</Link> : image}
    </div>
  )
}
