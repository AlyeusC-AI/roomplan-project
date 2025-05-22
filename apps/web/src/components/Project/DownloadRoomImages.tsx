import { useState } from "react";
import { toast } from "sonner";
import { saveAs } from "file-saver";
import { ArrowDownSquareIcon } from "lucide-react";
import { Button } from "@components/ui/button";
import { LoadingSpinner } from "@components/ui/spinner";

const JSZip = require("jszip");

const DownloadRoomImages = ({
  roomName,
  inferences,
}: {
  roomName: string;
  inferences: Inference[];
}) => {
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

  const downloadImagesForRoom = async () => {
    setIsDownloading(true);
    const folderName = `${projectInfo?.clientName
      .split(" ")
      .join("_")}_${roomName}_photos`;
    const promises = [];
    for (const inference of inferences) {
      promises.push(downloadImage(inference.imageKey!));
    }
    const zip = new JSZip();
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
    zip
      .generateAsync({ type: "blob" })
      .then(function (content: string | Blob) {
        saveAs(content, `${folderName}.zip`);
        setIsDownloading(false);
      })
      .catch(() => {
        console.error(e);
        setIsDownloading(false);
        toast.error(
          "Failed to download images. Please contact support@restoregeek.app if this error persists"
        );
      });
  };
  return (
    <Button
      variant='outline'
      onClick={() => downloadImagesForRoom()}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <LoadingSpinner />
      ) : (
        <ArrowDownSquareIcon className='h-6' />
      )}
    </Button>
  );
};

export default DownloadRoomImages;
