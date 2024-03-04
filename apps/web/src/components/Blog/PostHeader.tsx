import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

import Avatar from './Avatar'
import CoverImage from './CoverImage'
import DateComponent from './Date'
import PostTitle from './PostTitle'

export default function PostHeader({
  title,
  coverImage,
  date,
  author,
}: {
  title: string
  coverImage: { url: string }
  date: string
  author: { name: string; title: string; image: { url: string } }
}) {
  return (
    <>
      <Link href="/blog" className="group flex items-center hover:underline">
        <ArrowLeftIcon className="mr-4 h-6 transition-all group-hover:-translate-x-2" />{' '}
        All Posts
      </Link>
      <PostTitle>{title}</PostTitle>
      <div className="relative mb-8 flex items-center justify-center sm:mx-0 md:mb-16">
        <CoverImage title={title} url={coverImage.url} />
      </div>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 block">
          {author && (
            <Avatar
              name={author.name}
              title={author.title}
              picture={author.image}
            />
          )}
        </div>
        <div className="mb-6 text-lg">
          <DateComponent dateString={date} />
        </div>
      </div>
    </>
  )
}
