import { useState } from "react";
import Modal from "@components/DesignSystem/Modal";

// import CreateAccessLink from "../CreateAccessLink";
// import DownloadAllRoomImages from "../DownloadAllRoomImages";
import ImageUploadModal from "./ImageUploadModal";
import RoomCreationModal from "../rooms/RoomCreationModal";
import { Button } from "@components/ui/button";
import { Dialog } from "@components/ui/dialog";

export default function MitigationToolbar() {
  const [isRoomCreationModalOpen, setIsRoomCreationModalOpen] = useState(false);
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);

  const onPrimaryClick = () => {
    setIsImageUploadModalOpen(true);
  };

  return (
    <div className='flex flex-row justify-between gap-4'>
      <div>
        <h3 className='text-lg font-medium'>Upload Photos</h3>
        <p className='text-sm text-muted-foreground'>
          Upload photos of the job site. Take photos easily right from your
          phone or upload directly from your computer.
        </p>
      </div>
      <div className='flex flex-row gap-4'>
        <div className='inline-flex rounded-md shadow-sm'>
          <Button onClick={onPrimaryClick} variant='outline' type='button'>
            Upload Images
          </Button>
        </div>
        <Dialog
          open={isImageUploadModalOpen}
          onOpenChange={setIsImageUploadModalOpen}
        >
          <ImageUploadModal setOpen={setIsImageUploadModalOpen} />
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
        {/* <CreateAccessLink />
        <DownloadAllRoomImages /> */}
      </div>
    </div>
  );
}
