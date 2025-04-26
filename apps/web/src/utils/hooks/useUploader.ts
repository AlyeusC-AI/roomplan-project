import { ChangeEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { event } from "nextjs-google-analytics";
import { uploadInProgressImagesStore } from "@atoms/upload-in-progress-image";
import { uploadSummaryStore } from "@atoms/upload-summary";
import { v4 } from "uuid";

import useAmplitudeTrack from "./useAmplitudeTrack";
import useFilterParams from "./useFilterParams";
import { createClient } from "@lib/supabase/client";
const { pRateLimit } = require("p-ratelimit");

const useUploader = ({ imageFolder }: { imageFolder?: string } = {}) => {
  const uploadSummary = uploadSummaryStore((state) => state.summary);
  const { track } = useAmplitudeTrack();

  const [numUploads, setIsNumUploads] = useState(0);
  const [completedUploads, setCompletedUploads] = useState(0);
  const [failedUploads, setFailedUploads] = useState<File[]>([]);
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();
  const [trailEnded, setTrialEnded] = useState(false);
  // const processMediaMutation = trpc.media.processMedia.useMutation();

  // const trpcContext = trpc.useUtils();
  const { rooms, onlySelected, sortDirection } = useFilterParams();

  const upload = async (files: File[] | FileList, roomId: string) => {
    if (trailEnded) {
      return;
    }
    event("start_upload_images", {
      category: "Estimate Page",
      count: files.length,
    });

    if (!files || files?.length === 0) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return;
    }
    track("Upload Images", { count: files.length });

    uploadSummaryStore.getState().clearUploadSummary();
    setIsNumUploads(files.length);
    setCompletedUploads(0);
    setFailedUploads([]);
    const limit = pRateLimit({
      interval: 1000, // 1000 ms == 1 second
      rate: 30, // 10 API calls per interval
      concurrency: 30, // no more than 10 running at once
    });
    for (let i = 0; i < files.length; i++) {
      await limit(async () => await uploadToSupabase(files[i], roomId));
    }
  };

  const onChange = async (e: ChangeEvent<HTMLInputElement>, roomId: string) => {
    const imagesInFlight = Array.from(e.target.files!).map((file) => {
      return {
        path: URL.createObjectURL(file),
        name: file.name,
      };
    });

    uploadInProgressImagesStore.getState().addImages(imagesInFlight);
    // @ts-expect-error
    upload(e.target.files, roomId);
  };

  const onDrop = async (files: FileList, roomId: string) => {
    const imagesInFlight: {
      path: string;
      name: string;
    }[] = [];
    for (let i = 0; i < files.length; i++) {
      imagesInFlight.push({
        path: URL.createObjectURL(files[i]),
        name: files[i].name,
      });
    }

    uploadInProgressImagesStore.getState().addImages(imagesInFlight);
    await upload(files, roomId);
  };

  const uploadToSupabase = async (file: File, roomId: string) => {
    try {
      const body = new FormData();
      body.append("file", file);
      if (trailEnded) {
        setTrialEnded(true);
        setCompletedUploads(0);
        setFailedUploads([]);
        setIsNumUploads(0);
        uploadInProgressImagesStore.getState().clearImages();
        return;
      }

      const user = await supabase.auth.getUser();

      const fileName = `${v4()}_${file.name.replace(/\s+/g, "_")}`;
      const { data: uploadData } = await supabase.storage
        .from("media")
        .upload(`/${imageFolder ?? user.data.user?.id}/${fileName}`, file, {
          contentType: file.type,
          upsert: false,
        });
      console.log("🚀 ~ uploadToSupabase ~ uploadData:", uploadData);

      const response = await fetch(`/api/v1/projects/${id}/image`, {
        method: "POST",
        body: JSON.stringify({
          imageId: uploadData?.path,
          roomId,
          roomName: roomId,
        }),
      });
      console.log("🚀 ~ uploadToSupabase ~ response:", response);
      // const response = await processMediaMutation.mutateAsync({
      //   fileName,
      //   projectPublicId: id,
      //   mediaType: "photo",
      //   roomId,
      // });

      if (failedUploads)
        setFailedUploads((prevFailedUploads) => [...prevFailedUploads, file]);

      // urlMapStore
      //   .getState()
      //   .addUrlMap(decodeURIComponent(response.imageKey), response.signedUrl);

      // const queryContext = {
      //   projectPublicId: id,
      //   sortDirection,
      //   rooms,
      //   onlySelected,
      // };
      // const prevData =
      //   trpcContext.photos.getProjectPhotos.getData(queryContext);
      // trpcContext.photos.getProjectPhotos.setData(queryContext, {
      //   images: [
      //     {
      //       key: response.imageKey,
      //       publicId: response.imagePublicId,
      //       createdAt: new Date(response.createdAt),
      //       includeInReport: false,
      //       inference: {
      //         publicId: response.publicId,
      //         room: {
      //           name: response.roomName,
      //           publicId: response.roomId,
      //         },
      //       },
      //     },
      //     ...(prevData?.images ? prevData.images : []),
      //   ],
      // });

      // uploadSummaryStore.getState().incrementUploadSummary(response.roomName);
      setCompletedUploads((prevCompletedUploads) => prevCompletedUploads + 1);

      uploadInProgressImagesStore.getState().removeImage(file.name);
    } catch (error) {
      console.log("failed", error);
      setFailedUploads((prevFailedUploads) => [...prevFailedUploads, file]);
    }
  };

  useEffect(() => {
    if (
      numUploads > 0 &&
      completedUploads + failedUploads.length === numUploads
    ) {
      event("finish_upload_images", {
        category: "Estimate Page",
        success_count: completedUploads,
        failed_count: failedUploads.length,
      });
      setCompletedUploads(0);
      setFailedUploads([]);
      setIsNumUploads(0);
      uploadInProgressImagesStore.getState().clearImages();
      // trpcContext.photos.getProjectPhotos.invalidate();
    }
  }, [completedUploads, failedUploads, numUploads]);

  return {
    numUploads,
    onChange,
    onDrop,
    uploadSummary,
  };
};

export default useUploader;
