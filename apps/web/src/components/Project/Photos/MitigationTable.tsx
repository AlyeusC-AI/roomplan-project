import EmptyState from "@components/DesignSystem/EmptyState";
import useFilterParams from "@utils/hooks/useFilterParams";
import { useParams } from "next/navigation";
import OptimisticUploadUI from "../OptimisticUploadUI";
import PhotoList from "./PhotoList";
import { useSearchImages } from "@service-geek/api-client";

export default function MitigationTable() {
  const { id } = useParams<{ id: string }>();
  const { rooms, onlySelected, sortDirection } = useFilterParams();

  // React Query hooks
  const {
    data: imagesData,
    isLoading: isLoadingImages,
    refetch,
  } = useSearchImages(
    id,
    {
      type: "ROOM",
      roomIds: rooms,
      showInReport: onlySelected || undefined,
    },
    { field: "createdAt", direction: sortDirection || "desc" },
    { page: 1, limit: 100 }
  );

  return (
    <div className='mt-6 space-y-4'>
      <OptimisticUploadUI />
      {!isLoadingImages &&
        (!imagesData?.data || imagesData?.data.length === 0) ? (
        <EmptyState
          imagePath='/images/no-uploads.svg'
          title='Get started by uploading photos'
          description='Once uploaded, we will sort your photos by room as well as identify items within each picture.'
        />
      ) : (
        <PhotoList photos={imagesData?.data} refetch={refetch} />
      )}
    </div>
  );
}
