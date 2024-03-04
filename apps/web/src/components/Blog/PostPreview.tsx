import Link from 'next/link'

import Avatar from './Avatar'
import CoverImage from './CoverImage'
import DateComponent from './Date'

export default function PostPreview({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
}: {
  title: string
  date: string
  coverImage: { url: string }
  excerpt: string
  author: { name: string; title: string; image: { url: string } }
  slug: string
}) {
  return (
    <div>
      <div className="mb-5">
        <CoverImage title={title} slug={slug} url={coverImage.url} />
      </div>
      <h3 className="mb-3 text-3xl leading-snug">
        <Link href={`/blog/${slug}`}>{title}</Link>
      </h3>
      <div className="mb-4 text-lg">
        <DateComponent dateString={date} />
      </div>
      <p className="mb-4 text-lg leading-relaxed">{excerpt}</p>
      {author && (
        <Avatar
          title={author.title}
          name={author.name}
          picture={author.image}
        />
      )}
    </div>
  )
}
