import { Dispatch, SetStateAction } from 'react'
import Modal from '@components/DesignSystem/Modal'
import { Dialog } from '@headlessui/react'
import { KeyIcon, XMarkIcon } from '@heroicons/react/24/outline'

const ConfirmNewApiKey = ({
  open,
  setOpen,
  createApiKey,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  createApiKey: () => Promise<void>
}) => {
  return (
    <Modal open={open} setOpen={setOpen}>
      {(setOpen) => (
        <>
          <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => setOpen(false)}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <KeyIcon className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900"
              >
                Generate New API Key
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Creating a new API key will invalidate your old API Key.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={createApiKey}
            >
              Create
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}

export default ConfirmNewApiKey
