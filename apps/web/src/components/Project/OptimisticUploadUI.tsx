import placeHolderImage from "@images/placeholders/upload.jpeg";
import { uploadInProgressImagesStore } from "@atoms/upload-in-progress-image";
import { LoadingSpinner } from "@components/ui/spinner";

const OptimisticUploadUI = () => {
  const uploadInProgressImages = uploadInProgressImagesStore(
    (state) => state.images
  );

  if (uploadInProgressImages.length === 0) return null;
  return (
    <>
      <div className='mt-8 rounded-md md:text-base'>
        <div className='flex justify-between pr-4 sm:items-center'>
          <h1 className='flex text-2xl font-semibold text-gray-900'>
            <span className='mr-4'>Uploading Images</span> <LoadingSpinner />
          </h1>
        </div>
        <div className='flex items-center'>
          <div className='mt-4 flex w-full gap-6 overflow-x-auto'>
            <div className={`flex w-full py-2`}>
              {uploadInProgressImages.map((image, index) => (
                <div key={index} className='group relative px-4'>
                  <div>
                    <div className='relative w-[150px]'>
                      <img
                        src={image.path ? image.path : placeHolderImage.src}
                        className={
                          image.path
                            ? "w-full animate-pulse rounded-md opacity-75"
                            : "w-full animate-pulse rounded-md opacity-25 blur-sm"
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OptimisticUploadUI;
