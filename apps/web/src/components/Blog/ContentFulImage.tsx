import Image, { ImageProps } from 'next/image'

export const contentfulLoader = ({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}) => {
  return `${src}?w=${width}&q=${quality || 75}`
}

const ContentfulImage = (props: ImageProps) => {
  return <Image loader={contentfulLoader} {...props} alt="" />
}

export default ContentfulImage
