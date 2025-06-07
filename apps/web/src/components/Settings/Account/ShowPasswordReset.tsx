import { Dispatch, SetStateAction } from "react";
import Modal from "@components/DesignSystem/Modal";
import { Dialog } from "@headlessui/react";
import { AlertCircle, X } from "lucide-react";

const ShowPasswordReset = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <Modal open={open} setOpen={setOpen}>
      {(setOpen) => (
        <>
          <div className='absolute right-0 top-0 hidden pr-4 pt-4 sm:block'>
            <button
              type='button'
              className='rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              onClick={() => setOpen(false)}
            >
              <span className='sr-only'>Close</span>
              <X className='size-6' aria-hidden='true' />
            </button>
          </div>
          <div className='sm:flex sm:items-start'>
            <div className='mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:size-10'>
              <AlertCircle
                className='size-6 text-yellow-600'
                aria-hidden='true'
              />
            </div>
            <div className='mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left'>
              <Dialog.Title
                as='h3'
                className='text-lg font-medium leading-6 text-gray-900'
              >
                Reset Password
              </Dialog.Title>
              <div className='mt-2'>
                <p className='text-sm text-gray-500'>
                  To reset your password, logout of your account and follow the
                  &quot;forgot password?&quot; prompt on the login screen.
                </p>
              </div>
            </div>
          </div>
          <div className='mt-5 sm:mt-4 sm:flex sm:flex-row-reverse'>
            <button
              type='button'
              className='mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm'
              onClick={() => setOpen(false)}
            >
              Got it
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default ShowPasswordReset;
