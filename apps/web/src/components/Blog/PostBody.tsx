import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { BLOCKS } from '@contentful/rich-text-types'
import clsx from 'clsx'
import Link from 'next/link'

import RichTextAsset from './RichTextAsset'

import markdownStyles from './markdown-styles.module.css'

const customMarkdownOptions = (content: any) => ({
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node: {
      data: { target: { sys: { id: any } } }
    }) => (
      <RichTextAsset
        id={node.data.target.sys.id}
        assets={content.links.assets.block}
      />
    ),
  },
})

export default function PostBody({ content }: { content: any }) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className={markdownStyles['markdown']}>
        {documentToReactComponents(
          content.json,
          // @ts-expect-error
          customMarkdownOptions(content)
        )}
      </div>
      <div
        className={clsx(
          markdownStyles['markdown'],
          'mt-4 border-t border-dashed border-t-slate-400'
        )}
      >
        <p>
          RestorationX offers a job management platform for the insurance
          restoration industry.{' '}
          <Link
            href="/register"
            className="font-bold text-primary hover:underline"
          >
            Sign up
          </Link>{' '}
          today to start using AI to help you write estimates faster.
        </p>
      </div>
    </div>
  )
}
