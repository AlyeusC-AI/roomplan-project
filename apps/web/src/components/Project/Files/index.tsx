import { useRouter } from 'next/router'

import FileUploader from './FileUploader'

export default function Files({ accessToken }: { accessToken: string }) {
  const router = useRouter()
  let id = router.query.id || ''
  if (Array.isArray(id) || !id) {
    id = ''
  }
  return <FileUploader accessToken={accessToken} />
}
