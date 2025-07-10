import { ChangeEvent, useEffect, useState } from "react";
import { FileObject } from "@supabase/storage-js";
import { useParams } from "next/navigation";
import { event } from "nextjs-google-analytics";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import {
  FileText,
  File,
  Plus,
  AlertTriangle,
  Eye,
  MoveRight,
  Trash2,
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
import {
  uploadImage,
  useAddImage,
  useSearchImages,
  Image,
  useRemoveImage,
  useGetProjectById,
  Document,
  useGetDocuments,
  DocumentType,
  useCreateDocument,
  useDeleteDocument,
  useSendDocumentEmail,
} from "@service-geek/api-client";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

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
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading: isProjectLoading } = useGetProjectById(
    id as string
  );

  const { data: documents, isLoading: isDocumentsLoading } = useGetDocuments(
    project?.data.id ?? ""
  );
  const { mutate: createDocument } = useCreateDocument();
  const { mutate: deleteDocument } = useDeleteDocument();
  const { mutate: sendEmail } = useSendDocumentEmail();
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("documents");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(
    null
  );
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(
    null
  );
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const { mutate: addImage } = useAddImage();
  const { data: filesData } = useSearchImages(
    id,
    {
      type: "FILE",
    },
    {
      field: "createdAt",
      direction: "desc",
    },
    {
      page: 1,
      limit: 100,
    }
  );
  const { mutate: removeImage } = useRemoveImage();
  const files = filesData?.data;

  // const fetchDocuments = async () => {
  //   try {
  //     const response = await fetch(
  //       `/api/v1/organization/documents?projectId=${project?.id}`
  //     );
  //     if (!response.ok) throw new Error("Failed to fetch documents");
  //     const data = await response.json();
  //     setDocuments(data);
  //   } catch (error) {
  //     toast.error("Failed to fetch documents");
  //     console.error(error);
  //   }
  // };

  // useEffect(() => {
  //   setLoading(true);
  //   Promise.all([fetchFiles(), fetchDocuments()])
  //     .then(() => {
  //       fetch(`/api/v1/projects/${id}/reports`)
  //         .then((res) => res.json())
  //         .then((data) => {
  //           console.log(data);
  //         })
  //         .finally(() => {
  //           setLoading(false);
  //         });
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //     });
  // }, []);

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
      const image = await uploadImage(file);

      addImage({
        data: {
          url: image.url,
          projectId: id,
          type: "FILE",
        },
      });
      toast.success("Uploaded File");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload file.");
    } finally {
      setIsUploading(false);
    }
  };

  const onDownload = async (file: Image, way: "view" | "download") => {
    try {
      if (way === "view") {
        window.open(file.url, "_blank");
        return;
      }
      const response = await fetch(file.url);
      if (!response.ok) {
        toast.error("Could not download file");
        return;
      }

      const blob = await response.blob();

      // Create download link directly from blob
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = URL.createObjectURL(blob);
      link.download = file.name || "download";

      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        URL.revokeObjectURL(link.href);
        link.parentNode?.removeChild(link);
      }, 0);
    } catch (error) {
      console.error(error);
      toast.error("Could not download file");
    }
  };

  const onDelete = async (file: Image) => {
    try {
      await removeImage(file.id);
      toast.success("File deleted");
    } catch (error) {
      console.error(error);
      // toast.error("Could not delete file.");
    }
  };

  const handleCreateDocument = async (type: DocumentType) => {
    try {
      await createDocument({
        name: type === DocumentType.COS ? "COS" : "Work Auth",
        projectId: id,
        json: {
          name: type === DocumentType.COS ? "COS" : "Work Auth",
          type: type,
        },
        type: type,
      });

      toast.success("Document created successfully");
      setShowCreateDialog(false);
      setSelectedDocType(null);
    } catch (error) {
      // toast.error("Failed to create document");
      console.error(error);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await deleteDocument(documentId);

      toast.success("Document deleted successfully");
      setShowDeleteDialog(false);
      setDocumentToDelete(null);
    } catch (error) {
      // toast.error("Failed to delete document");
      console.error(error);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedDocument) return;

    setIsSendingEmail(true);
    try {
      await sendEmail(selectedDocument.id);

      toast.success("Document sent successfully");
      setShowEmailDialog(false);
      setSelectedDocument(null);
    } catch (error) {
      // toast.error("Failed to send document");
      console.error(error);
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (isProjectLoading || isDocumentsLoading || !documents) {
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

      {/* {files && files.length > 0 && (
        <Alert>
          <Check className='size-4' />
          <AlertTitle>Roof report ordered!</AlertTitle>
          <AlertDescription>
            Your roof report is being generated and will available within 24
            hours. Your roof report .esx file will be on this page once
            it&apos;s ready
          </AlertDescription>
        </Alert>
      )} */}

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
          <div className='mx-auto'>
            {files && files.length === 0 ? (
              <FileEmptyState onChange={onUpload} isUploading={isUploading} />
            ) : (
              <FileList
                files={files || []}
                onDownload={onDownload}
                onDelete={onDelete}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value='documents' className='mt-4'>
          <div className='mx-auto'>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className='max-w-[200px] truncate'>
                        <Link target="_blank" href={ `/certificate/?isRep=true&id=${doc.id}&type=${doc.type}`} className="hover:underline">
                        {doc.name}
                        </Link>
                      </TableCell>
                      <TableCell>{doc.type}</TableCell>
                      <TableCell>
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className='flex h-8 w-8 items-center justify-center rounded-md p-0 text-gray-500 hover:bg-gray-100'>
                              <MoreHorizontal className='h-5 w-5' />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem
                              onClick={() =>
                                window.open(
                                  `/certificate/?isRep=true&id=${doc.id}&type=${doc.type}`,
                                  "_blank"
                                )
                              }
                            >
                              <Eye className='mr-2 h-4 w-4' /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedDocument(doc);
                                setShowEmailDialog(true);
                              }}
                            >
                              <MoveRight className='mr-2 h-4 w-4' /> Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setDocumentToDelete(doc);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className='mr-2 h-4 w-4' /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                  setSelectedDocType(value as DocumentType)
                }
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select a document type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DocumentType.COS}>
                    Certificate of Service (COS)
                  </SelectItem>
                  <SelectItem value={DocumentType.AUTH}>
                    Work Authorization
                  </SelectItem>
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
