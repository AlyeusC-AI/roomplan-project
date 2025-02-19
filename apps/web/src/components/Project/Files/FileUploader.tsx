import { ChangeEvent, useEffect, useState } from "react";
import { FileObject } from "@supabase/storage-js";
import { useParams } from "next/navigation";
import { event } from "nextjs-google-analytics";
import { orgStore } from "@atoms/organization";
import { projectStore } from "@atoms/project";

import FileEmptyState from "./FileEmptyState";
import FileList from "./FileList";
import { toast } from "sonner";
import { LoadingSpinner } from "@components/ui/spinner";
import { Check, Plus } from "lucide-react";
import { createClient } from "@lib/supabase/client";
import { buttonVariants } from "@components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";

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
  const files = projectStore();
  const orgInfo = orgStore((state) => state.organization);
  const supabase = createClient();

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    fetch(`/api/v1/projects/${id}/files`)
      .then((res) => res.json())
      .then((data) => {
        files.setFiles(data);
        console.log(data.files);
      });
    fetch(`/api/v1/projects/${id}/reports`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        // files.setReports(data);
      });
  }, []);

  const onUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    event("attempt_upload_file", {
      category: "Header",
    });
    if (!files || files.length < 0) {
      toast.error("No file selected.");
      return;
    }
    uploadToSupabase(files[0]);
  };

  const uploadToSupabase = async (file: File) => {
    setIsUploading(true);

    try {
      const body = new FormData();
      body.append("file", file);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data } = await supabase.storage
        .from("user-files")
        .upload(
          `${user?.user_metadata.organizationid}/${files.project?.publicId}/${file.name}`,
          await file.bytes(),
          {
            upsert: true,
            contentType: file.type,
          }
        );
      files.addFile({
        name: file.name,
        created_at: new Date().toDateString(),
        metadata: {
          mimetype: file.type,
        },
        bucket_id: "",
        updated_at: new Date().toDateString(),
        owner: user!.id,
        id: data!.id,
        buckets: {
          id: "",
          name: "",
          created_at: "",
          updated_at: "",
          owner: "",
          public: true,
        },
        last_accessed_at: new Date().toDateString(),
      });
      toast.success("Uploaded File");
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
      const res = await fetch(`/api/v1/projects/${id}/files`, {
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
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-medium'>Project Files</h3>
          <p className='text-sm text-muted-foreground'>
            Securely store files related to a project
          </p>
        </div>
        <div className='flex justify-end'>
          <label
            htmlFor='file-upload'
            className={buttonVariants({ variant: "outline" })}
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
      </div>
      {files.pendingReports && files.pendingReports.length > 0 && (
        <Alert>
          <Check className='size-4' />
          <AlertTitle>Roof report ordered!</AlertTitle>
          <AlertDescription>
            Your roof report is being generated and will available within 24
            hours. Your roof report .esx file will be on this page once
            it&apos;s ready
          </AlertDescription>
        </Alert>
      )}
      <div>
        {files.projectFiles.length === 0 ? (
          <FileEmptyState onChange={onUpload} isUploading={isUploading} />
        ) : (
          <div>
            <FileList
              files={files.projectFiles}
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
