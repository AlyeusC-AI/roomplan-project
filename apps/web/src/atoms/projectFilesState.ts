import { FileObject } from '@supabase/storage-js'
import { atom } from 'recoil'

export const defaultProjectFilesState = []
const projectFilesState = atom<FileObject[]>({
  key: 'ProjectFilesState',
  default: defaultProjectFilesState,
})

export default projectFilesState
