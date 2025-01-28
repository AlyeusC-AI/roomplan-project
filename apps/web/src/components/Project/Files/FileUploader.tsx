import { ChangeEvent, useState } from "react";
import { FileObject } from "@supabase/storage-js";
import { useParams } from "next/navigation";
import { event } from "nextjs-google-analytics";
import { orgStore } from "@atoms/organization";
import { projectStore } from "@atoms/project";

import TabTitleArea from "../TabTitleArea";

import FileEmptyState from "./FileEmptyState";
import FileList from "./FileList";
import { toast } from "sonner";
import { LoadingSpinner } from "@components/ui/spinner";
import { Plus } from "lucide-react";

function downloadFile(file: File) {
  // Create a link and set the URL using `createObjectURL`
  const link = document.createElement("a");
  link.style.display = "none";
  link.href = URL.createObjectURL(file);
  link.download = file.name;

  // It needs to be added to the DOM so it can be clicked
  document.body.appendChild(link);
  link.click();

  // To make this work on Firefox we need to wait
  // a little while before removing it.
  setTimeout(() => {
    URL.revokeObjectURL(link.href);
    link.parentNode?.removeChild(link);
  }, 0);
}

const FileUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const files = projectStore((state) => state.projectFiles);
  const orgInfo = orgStore((state) => state.organization);

  const { id } = useParams();

  const onUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    event("attempt_upload_file", {
      category: "Header",
    });
    if (!files || files.length < 0) return;
    uploadToSupabase(files[0]);
  };

  const uploadToSupabase = async (file: File) => {
    setIsUploading(true);

    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(`/api/project/${id}/file-upload`, {
        method: "POST",
        body: body,
      });
      if (res.ok) {
        // @ts-expect-error dont even know whats going on here
        setFiles((oldFiles) => [
          ...oldFiles,
          {
            name: file.name,
            created_at: new Date().toDateString(),
            metadata: {
              mimetype: file.type,
            },
          },
        ]);
        toast.success("Uploaded File");
      } else {
        toast.error("Failed to upload file.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload file.");
    }

    setIsUploading(false);
  };

  const onDownload = async (file: FileObject, url: string) => {
    try {
      console.log(url);
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        downloadFile(
          new File([blob], file.name, { type: file.metadata.mimetype })
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const onDelete = async (file: FileObject) => {
    try {
      const res = await fetch(`/api/project/${id}/file`, {
        method: "DELETE",
        body: JSON.stringify({
          filename: `${orgInfo?.publicId}/${id}/${file.name}`,
        }),
      });
      if (res.ok) {
        projectStore.getState().removeFile(file.name);
        toast.success("File deleted");
      } else {
        console.error(res);
        toast.error("Could not delete file.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Could not delete file.");
    }
  };

  return (
    <div>
      <TabTitleArea
        title='Project Files'
        description='Securely store files related to a project'
      >
        <>
          {files.length > 0 && (
            <div className='flex justify-end'>
              <label
                htmlFor='file-upload'
                className='inline-flex items-center justify-center rounded-md border border-transparent px-2 py-1 text-sm font-medium text-white shadow-sm hover:cursor-pointer hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto md:px-4 md:py-2'
              >
                {isUploading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    {" "}
                    <Plus className='-ml-1 mr-2 size-5' aria-hidden='true' />
                    Upload File
                  </>
                )}
              </label>
              <input
                onChange={onUpload}
                type='file'
                id='file-upload'
                name='file-upload'
                className='hidden'
                disabled={isUploading}
              />
            </div>
          )}
        </>
      </TabTitleArea>
      <div>
        {files.length === 0 ? (
          <FileEmptyState onChange={onUpload} isUploading={isUploading} />
        ) : (
          <div>
            <FileList
              files={files}
              onDownload={onDownload}
              onDelete={onDelete}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
