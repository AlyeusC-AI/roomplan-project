/* eslint-disable @next/next/no-img-element */
import { useState } from 'react'

function BlurImage({
  src,
  alt,
  sizes,
}: {
  src: string
  alt: string
  sizes: string
}) {
  const [isLoading, setLoading] = useState(true)

  return (
    <>
      <img alt={alt} src={src} onLoadedData={() => setLoading(false)} />
    </>
  )
}

export default BlurImage
