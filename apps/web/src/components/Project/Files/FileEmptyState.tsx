import { ChangeEvent } from 'react'
import Spinner from '@components/Spinner'
import { PlusIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { event } from 'nextjs-google-analytics'

const FileEmptyState = ({
  onChange,
  isUploading,
}: {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  isUploading: boolean
}) => {
  const onClick = () => {
    event('attempt_upload_file', {
      category: 'Empty State CTA',
    })
  }
  return (
    <div className="mt-20 flex flex-col items-center justify-center text-center">
      <div
        style={{
          width: 647.63626 / 3,
          height: 632.17383 / 3,
        }}
      >
        <Image
          src="/images/no-files.svg"
          width={647.63626 / 3}
          height={632.17383 / 3}
          alt="No files"
        />
      </div>
      <h3 className="text-center text-2xl font-medium sm:text-3xl">No files</h3>
      <p className="mt-1 text-sm text-gray-500">
        Upload PDFs, images, and .docx files related to this project
      </p>
      <div className="mt-6">
        <div>
          <label
            htmlFor="file-upload"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-action px-2 py-1 text-sm font-medium text-white shadow-sm hover:cursor-pointer hover:bg-primary-action-hover focus:outline-none focus:ring-2 focus:ring-primary  focus:ring-offset-2 sm:w-auto md:px-4 md:py-2"
          >
            {isUploading ? (
              <Spinner bg="fill-white" />
            ) : (
              <>
                {' '}
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Upload File
              </>
            )}
          </label>
          <input
            onChange={onChange}
            type="file"
            id="file-upload"
            name="file-upload"
            className="hidden"
            disabled={isUploading}
            onClick={onClick}
          />
        </div>
      </div>
    </div>
  )
}

export default FileEmptyState
