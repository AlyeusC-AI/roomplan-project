import { Fragment } from 'react'
import useMentionsMetadata from './useMentionsMetadata'

export default function MentionsDisplay({ message }: { message: string }) {
  // sample text: "hello @[matt@servicegeek.com](2d6bfc8a-29ef-4ffc-88ff-741bd0bd38bb) !"
  const metadata = useMentionsMetadata(message, (params) => {
    return `#?userId=${params}`
  })

  return (
    <div>
      <span>
        {metadata.map(({ text, url }, i) => {
          if (!url) {
            return <Fragment key={i}>{text}</Fragment>
          }

          return (
            <span
              key={i}
              className="underline decoration-blue-500 decoration-2 "
            >
              {text}
            </span>
          )
        })}
      </span>
    </div>
  )
}
