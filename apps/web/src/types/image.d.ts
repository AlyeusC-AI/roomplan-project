interface ImageUploadInProgressData {
  path: string
  name: string
}

interface PresignedUrlMap {
  [imageKey: string]: string
}