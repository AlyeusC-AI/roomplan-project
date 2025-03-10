import { useState } from "react";
import Modal from "@components/DesignSystem/Modal";
import useUploader from "@utils/hooks/useUploader";
import { event } from "nextjs-google-analytics";

import CreateAccessLink from "../CreateAccessLink";
import DownloadAllRoomImages from "../DownloadAllRoomImages";
import ImageUploadModal from "../ImageUploadModal";
import RoomCreationModal from "../RoomCreationModal";
import { Button } from "@components/ui/button";
import { Dialog } from "@components/ui/dialog";

function UploadButton({
  onPrimaryClick,
  disabled,
}: {
  onPrimaryClick: () => void;
  disabled: boolean;
}) {
  return (
    <div className='inline-flex rounded-md shadow-sm'>
      <Button
        onClick={onPrimaryClick}
        variant='outline'
        type='button'
        disabled={disabled}
      >
        Upload Images
      </Button>
      {/* <Menu as='div' className='relative -ml-px block'>
        <Menu.Button className='group relative inline-flex h-full items-center rounded-r-md border-l border-gray-300 p-2 text-sm font-medium text-gray-500 hover:shadow-md focus:z-10 focus:outline-none focus:ring-1'>
          <span className='sr-only'>Open options</span>
          <ChevronDown className='size-5 text-white' aria-hidden='true' />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter='transition ease-out duration-100'
          enterFrom='transform opacity-0 scale-95'
          enterTo='transform opacity-100 scale-100'
          leave='transition ease-in duration-75'
          leaveFrom='transform opacity-100 scale-100'
          leaveTo='transform opacity-0 scale-95'
        >
          <Menu.Items className='absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none'>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onSecondaryClick}
                  disabled={disabled}
                  className={clsx(
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                    "block w-full px-4 py-2 text-sm"
                  )}
                >
                  Upload to room
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu> */}
    </div>
  );
}

export default function MitigationToolbar() {
  const [isRoomCreationModalOpen, setIsRoomCreationModalOpen] = useState(false);
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);
  const [directImageUpload, setIsDirectImageUpload] = useState(false);

  const { numUploads, onChange, onDrop } = useUploader();

  const onClick = () => {
    event("attempt_upload_images", {
      category: "Estimate Page",
    });
  };

  const onPrimaryClick = () => {
    setIsImageUploadModalOpen(true);
    setIsDirectImageUpload(false);
  };

  return (
    <div className='flex flex-row gap-4'>
      <div>
        <h3 className='text-lg font-medium'>Upload Photos</h3>
        <p className='text-sm text-muted-foreground'>
          Upload photos of the job site. Take photos easily right from your
          phone or upload directly from your computer.
        </p>
      </div>
      <>
        <UploadButton
          onPrimaryClick={onPrimaryClick}
          disabled={false}
          // disabled={
          //   !(
          //     subscriptionStatus === "trialing" ||
          //     subscriptionStatus === "active"
          //   )
          // }
        />
        <Dialog
          open={isImageUploadModalOpen}
          onOpenChange={setIsImageUploadModalOpen}
        >
          <ImageUploadModal
            onChange={onChange}
            onClick={onClick}
            isUploading={numUploads > 0}
            setOpen={setIsImageUploadModalOpen}
            directImageUpload={directImageUpload}
            onDrop={onDrop}
          />
        </Dialog>
        <Button
          variant='outline'
          onClick={() => setIsRoomCreationModalOpen(true)}
        >
          Add Room
        </Button>
        <Modal
          open={isRoomCreationModalOpen}
          setOpen={setIsRoomCreationModalOpen}
        >
          {(setOpen) => (
            <RoomCreationModal
              setOpen={setOpen}
              isOpen={isRoomCreationModalOpen}
            />
          )}
        </Modal>
        <CreateAccessLink />
        <DownloadAllRoomImages />
      </>
      {/* {Object.keys(uploadSummary).length > 0 && (
        <Alert title='Upload Successful' type='success'>
          <ul>
            {Object.keys(uploadSummary).map((room) => (
              <li key={`upload-summary-${room}`}>
                {uploadSummary[room]} image(s) added to room: {room}
              </li>
            ))}
          </ul>
        </Alert>
      )} */}
    </div>
  );
}
