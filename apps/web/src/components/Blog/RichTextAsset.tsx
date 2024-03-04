import Image from 'next/image'

export default function RichTextAsset({
  id,
  assets,
}: {
  id: string
  assets: any
}) {
  const asset = assets?.find(
    (asset: { sys: { id: string } }) => asset.sys.id === id
  )

  if (asset?.url) {
    return <Image src={asset.url} fill alt={asset.description} />
  }

  return null
}
