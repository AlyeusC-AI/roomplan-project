import handleUpload from '../handleUpload'
import { NextRequest } from 'next/server'

export const config = {
  api: {
    bodyParser: false,
  },
}
// Used by mobile app
export async function POST(req: NextRequest) {
  return await handleUpload(req)
}
