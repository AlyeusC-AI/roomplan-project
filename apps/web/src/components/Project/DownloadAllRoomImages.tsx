import { useState } from "react";
import { InferenceMetaData } from "@servicegeek/db/queries/project/getProjectDetections";
import { saveAs } from "file-saver";
import { inferencesStore } from "@atoms/inferences";
import { urlMapStore } from "@atoms/url-map";
import { projectStore } from "@atoms/project";
import { ArrowDownToLine } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@components/ui/button";

const JSZip = require("jszip");

const DownloadAllRoomImages = () => {
  const allInferences = inferencesStore((state) => state.inferences);
  const [isDownloading, setIsDownloading] = useState(false);
  const projectInfo = projectStore((state) => state.project);
  const presignedUrlMap = urlMapStore((state) => state.urlMap);

  const downloadImage = async (imageKey: string) => {
    try {
      const res = await fetch(presignedUrlMap[decodeURIComponent(imageKey)]);
      if (res.ok) {
        return res.blob();
      }
    } catch {
      return null;
    }
  };

  const downloadImagesForRoom = async (
    zip: any,
    roomName: string,
    inferences: InferenceMetaData[]
  ) => {
    setIsDownloading(true);
    const folderName = `${roomName}_photos`;
    const promises = [];
    for (const inference of inferences) {
      promises.push(downloadImage(inference.imageKey));
    }
    const roomFolder = zip.folder(folderName);

    const resolved = await Promise.all(promises);
    let index = 1;
    for (const resolvedPromise of resolved) {
      if (!resolvedPromise) continue;
      const blob = resolvedPromise as Blob;
      const mimeType = blob.type;
      let extension = ".png";
      if (mimeType === "jpg" || mimeType === "jpeg") {
        extension = ".jpeg";
      }
      roomFolder.file(`${roomName}_${index}${extension}`, blob, {
        base64: true,
      });
      index++;
    }
    return;
  };

  const downloadAllImagesForRoom = async () => {
    const zip = new JSZip();

    const promises = [];

    for (const inference of allInferences) {
      promises.push(
        downloadImagesForRoom(zip, inference.name, inference.inferences)
      );
    }

    await Promise.all(promises);

    zip
      .generateAsync({ type: "blob" })
      .then(function (content: string | Blob) {
        saveAs(
          content,
          `${projectInfo?.clientName.split(" ").join("_")}_photos.zip`
        );
        setIsDownloading(false);
      })
      .catch((e: unknown) => {
        console.error(e);
        setIsDownloading(false);
        toast.error(
          "Failed to download images. Please contact support@servicegeek.app if this error persists"
        );
      });
  };
  return (
    <Button
      onClick={() => downloadAllImagesForRoom()}
      className='sm:w-full md:w-auto'
    >
      <ArrowDownToLine className='h-6' />
    </Button>
  );
};

export default DownloadAllRoomImages;
