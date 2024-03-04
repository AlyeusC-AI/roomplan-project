import { useEffect, useState } from 'react'

const PDFSafeImage = ({ url }: { url: string }) => {
  const [dataUri, setDataUri] = useState('')

  useEffect(() => {
    const fetchDataUri = async () => {
      let blob = await fetch(url).then((r) => r.blob())
      let dataUrl = await new Promise((resolve) => {
        let reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(blob)
      })
      setDataUri(dataUrl as string)
    }
    fetchDataUri()
  }, [url])
  if (!dataUri) return null
  /* eslint-disable-next-line */
  return <img src={dataUri} />
}

export default PDFSafeImage
