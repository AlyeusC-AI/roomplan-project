import { ChangeEvent, useEffect, useState } from "react";
import { FileObject } from "@supabase/storage-js";
import { useParams } from "next/navigation";
import { event } from "nextjs-google-analytics";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import {
  FileText,
  File,
  Plus,
  Eye,
  Trash2,
  Mail,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";

import FileEmptyState from "./FileEmptyState";
import FileList from "./FileList";
import { toast } from "sonner";
import { LoadingSpinner } from "@components/ui/spinner";
import { Check } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("documents");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<"cos" | "auth" | null>(
    null
  );
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [documentToDelete, setDocumentToDelete] = useState<any>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const files = projectStore();
  const orgInfo = orgStore((state) => state.organization);
  const supabase = createClient();
  const { project } = projectStore();

  const { id } = useParams<{ id: string }>();

  const fetchFiles = async () => {
    try {
      const res = await fetch(`/api/v1/projects/${id}/files`);
      const data = await res.json();
      files.setFiles(data);
    } catch (error) {
      console.error("Failed to fetch files:", error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch(
        `/api/v1/organization/documents?projectId=${project?.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch documents");
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      toast.error("Failed to fetch documents");
      console.error(error);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchFiles(), fetchDocuments()])
      .then(() => {
        fetch(`/api/v1/projects/${id}/reports`)
          .then((res) => res.json())
          .then((data) => {
            console.log(data);
          })
          .finally(() => {
            setLoading(false);
          });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const onUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log("🚀 ~ onUpload ~ files:", files);
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
    console.log("🚀 ~ uploadToSupabase ~ file:", file);
    setIsUploading(true);

    try {
      const body = new FormData();
      body.append("file", file);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("🚀 ~ uploadToSupabase ~ user:", user?.user_metadata);

      const { data, error } = await supabase.storage
        .from("user-files")
        .upload(
          `${user?.user_metadata.organizationId}/${files.project?.publicId}/${file.name}`,
          body,
          {
            upsert: true,
            contentType: file.type,
          }
        );
      console.log("🚀 ~ uploadToSupabase ~ error:", error);

      console.log("🚀 ~ uploadToSupabase ~ data:", data);

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
    } finally {
      setIsUploading(false);
    }
  };

  const onDownload = async (file: FileObject, url: string) => {
    try {
      const { data } = await supabase.storage
        .from("user-files")
        .createSignedUrl(`${orgInfo?.publicId}/${id}/${file.name}`, 60);

      if (!data?.signedUrl) {
        // toast.error("Could not access file");
        return;
      }

      // If URL is empty, it means we want to download
      if (!url) {
        const res = await fetch(data.signedUrl);
        if (res.ok) {
          const blob = await res.blob();
          downloadFile(
            new File([blob], file.name, { type: file.metadata.mimetype })
          );
        } else {
          toast.error("Could not download file");
        }
        return;
      }

      // For preview (thumbnails), return the URL without opening
      if (url === "preview" && file.metadata.mimetype?.startsWith("image/")) {
        return data.signedUrl;
      }

      // For viewing files
      if (url === "view") {
        window.open(data.signedUrl, "_blank");
      }
    } catch (e) {
      console.error(e);
      // toast.error("Could not access file");
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
        await fetchFiles(); // Refetch files after successful deletion
      } else {
        console.error(res);
        toast.error("Could not delete file.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Could not delete file.");
    }
  };

  const handleCreateDocument = async (type: "cos" | "auth") => {
    try {
      const response = await fetch(
        `/api/v1/organization/documents?projectId=${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: type === "cos" ? "COS" : "Work Auth",
            projectId: id,
            json: JSON.stringify({
              name: type === "cos" ? "COS" : "Work Auth",
              type: type,
            }),
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to create document");

      toast.success("Document created successfully");
      setShowCreateDialog(false);
      setSelectedDocType(null);
      await fetchDocuments();
    } catch (error) {
      toast.error("Failed to create document");
      console.error(error);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    try {
      const response = await fetch("/api/v1/organization/documents", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: documentId }),
      });

      if (!response.ok) throw new Error("Failed to delete document");

      setDocuments(documents.filter((doc) => doc.id !== documentId));
      toast.success("Document deleted successfully");
      setShowDeleteDialog(false);
      setDocumentToDelete(null);
    } catch (error) {
      toast.error("Failed to delete document");
      console.error(error);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedDocument) return;

    setIsSendingEmail(true);
    try {
      const response = await fetch("/api/v1/organization/documents/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId: selectedDocument.id,
          projectId: id,
        }),
      });

      if (!response.ok) throw new Error("Failed to send email");

      toast.success("Document sent successfully");
      setShowEmailDialog(false);
      setSelectedDocument(null);
    } catch (error) {
      toast.error("Failed to send document");
      console.error(error);
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-medium'>Project Files & Documents</h3>
          <p className='text-sm text-muted-foreground'>
            Securely store files and manage documents related to this project
          </p>
        </div>
        <div className='flex justify-end'>
          {activeTab === "files" && (
            <label
              htmlFor='file-upload'
              className={buttonVariants({ variant: "outline" })}
            >
              {isUploading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <Plus className='-ml-1 mr-2 size-5' aria-hidden='true' />
                  Upload File
                </>
              )}
            </label>
          )}
          {activeTab === "documents" && (
            <button
              onClick={() => setShowCreateDialog(true)}
              className={buttonVariants({ variant: "outline" })}
            >
              <Plus className='-ml-1 mr-2 size-5' aria-hidden='true' />
              Create Document
            </button>
          )}
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

      <Tabs defaultValue='documents' onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value='files'>
            <File className='mr-2 h-4 w-4' />
            Files
          </TabsTrigger>
          <TabsTrigger value='documents'>
            <FileText className='mr-2 h-4 w-4' />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value='files' className='mt-4'>
          <div className='mx-auto max-w-6xl'>
            {files.projectFiles.length === 0 ? (
              <FileEmptyState onChange={onUpload} isUploading={isUploading} />
            ) : (
              <FileList
                files={files.projectFiles}
                onDownload={onDownload}
                onDelete={onDelete}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value='documents' className='mt-4'>
          <div className='mx-auto max-w-6xl'>
            {documents.length === 0 ? (
              <div className='mt-20 flex flex-col items-center justify-center text-center'>
                <FileText className='mb-3 h-12 w-12 text-gray-400' />
                <h3 className='text-center text-2xl font-medium sm:text-3xl'>
                  No documents
                </h3>
                <p className='mt-1 text-sm text-gray-500'>
                  Create and manage project documents
                </p>
              </div>
            ) : (
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md'
                  >
                    <div className='border-b border-gray-200 bg-gray-50 p-4'>
                      <div className='flex items-center justify-between'>
                        <span className='block max-w-[200px] truncate text-sm font-medium text-gray-900'>
                          {doc.name}
                        </span>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() =>
                              window.open(
                                `/certificate/?isRep=true&id=${doc.publicId}&type=${doc.type}`,
                                "_blank"
                              )
                            }
                            className='h-8 w-8 rounded-md p-0 text-gray-500 hover:bg-gray-100'
                          >
                            <Eye className='h-4 w-4' />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDocument(doc);
                              setShowEmailDialog(true);
                            }}
                            className='h-8 w-8 rounded-md p-0 text-gray-500 hover:bg-gray-100'
                          >
                            <Mail className='h-4 w-4' />
                          </button>
                          <button
                            onClick={() => {
                              setDocumentToDelete(doc);
                              setShowDeleteDialog(true);
                            }}
                            className='h-8 w-8 rounded-md p-0 text-gray-500 hover:bg-gray-100'
                          >
                            <Trash2 className='h-4 w-4' />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className='p-4'>
                      <div className='flex items-center gap-2 text-sm text-gray-500'>
                        <FileText className='h-4 w-4' />
                        <span>
                          Added {new Date(doc.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Document</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='documentType'
                className='mb-1 block text-sm font-medium text-gray-700'
              >
                Select Document Type
              </label>
              <Select
                value={selectedDocType || ""}
                onValueChange={(value) =>
                  setSelectedDocType(value as "cos" | "auth")
                }
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select a document type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='cos'>
                    Certificate of Service (COS)
                  </SelectItem>
                  <SelectItem value='auth'>Work Authorization</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                setShowCreateDialog(false);
                setSelectedDocType(null);
              }}
              className={buttonVariants({ variant: "outline" })}
            >
              Cancel
            </button>
            <button
              onClick={() =>
                selectedDocType && handleCreateDocument(selectedDocType)
              }
              disabled={!selectedDocType}
              className={buttonVariants()}
            >
              Create Document
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Document via Email</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <p className='text-sm text-gray-600'>
              Send the document "{selectedDocument?.name}" to the project's
              email address?
            </p>
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                setShowEmailDialog(false);
                setSelectedDocument(null);
              }}
              disabled={isSendingEmail}
              className={buttonVariants({ variant: "outline" })}
            >
              Cancel
            </button>
            <button
              onClick={handleSendEmail}
              disabled={!selectedDocument || isSendingEmail}
              className={buttonVariants()}
            >
              {isSendingEmail ? (
                <>
                  <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  Sending...
                </>
              ) : (
                "Send Email"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5 text-yellow-500' />
              Delete Document
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <p className='text-sm text-gray-600'>
              Are you sure you want to delete the document "
              {documentToDelete?.name}"? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                setShowDeleteDialog(false);
                setDocumentToDelete(null);
              }}
              className={buttonVariants({ variant: "outline" })}
            >
              Cancel
            </button>
            <button
              onClick={() =>
                documentToDelete && handleDeleteDocument(documentToDelete.id)
              }
              className={buttonVariants({ variant: "destructive" })}
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileUploader;
