"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@components/ui/button";
import {
  FileText,
  Mail,
  Eye,
  Trash2,
  Pencil,
  Plus,
  ExternalLink,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import {
  useGetProjectById,
  Document,
  useGetDocuments,
  DocumentType,
  useCreateDocument,
  useDeleteDocument,
  useSendDocumentEmail,
} from "@service-geek/api-client";

export default function ProjectDocumentsPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: project, isLoading: isProjectLoading } = useGetProjectById(
    id as string
  );

  const { data: documents, isLoading: isDocumentsLoading } = useGetDocuments(
    project?.data.id ?? ""
  );
  const { mutate: createDocument } = useCreateDocument();
  const { mutate: deleteDocument } = useDeleteDocument();
  const { mutate: sendEmail } = useSendDocumentEmail();

  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(
    null
  );
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(
    null
  );

  const handleViewDocument = (
    documentId: string | undefined,
    type?: DocumentType
  ) => {
    window.open(
      `/certificate/?isRep=true${documentId ? `&id=${documentId}` : ""}${
        type ? `&type=${type}` : ""
      }`,
      "_blank"
    );
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

  const handleCreateDocument = async (type: DocumentType) => {
    try {
      await createDocument({
        name: type === DocumentType.COS ? "COS" : "Work Auth",
        projectId: project?.data.id ?? "",
        json: JSON.stringify({
          name: type === DocumentType.COS ? "COS" : "Work Auth",
          type: type,
        }),
        type: type,
      });

      toast.success("Document created successfully");
      setShowCreateDialog(false);
      setSelectedDocType(null);
    } catch (error) {
      toast.error("Failed to create document");
      console.error(error);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const response = await fetch("/api/v1/organization/documents", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: documentId }),
      });

      if (!response.ok) throw new Error("Failed to delete document");

      toast.success("Document deleted successfully");
      setShowDeleteDialog(false);
      setDocumentToDelete(null);
    } catch (error) {
      toast.error("Failed to delete document");
      console.error(error);
    }
  };

  if (isProjectLoading || isDocumentsLoading || !documents) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className='container mx-auto max-w-7xl p-6'>
      <div className='flex flex-col gap-8'>
        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <h1 className='text-3xl font-bold text-gray-900'>
              Project Documents
            </h1>
            <p className='text-sm text-gray-500'>
              Create and manage project documents
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className='bg-primary text-white transition-colors duration-200 hover:bg-primary/90'
          >
            <Plus className='mr-2 h-4 w-4' />
            Create Document
          </Button>
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {documents.length === 0 ? (
            <div className='col-span-full flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-12 shadow-sm'>
              <FileText className='mb-3 h-12 w-12 text-gray-400' />
              <p className='text-sm font-medium text-gray-900'>
                No documents yet
              </p>
              <p className='text-xs text-gray-500'>
                Create a document to get started
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className='mt-4 bg-primary text-white'
              >
                <Plus className='mr-2 h-4 w-4' />
                Create Document
              </Button>
            </div>
          ) : (
            <TooltipProvider>
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md'
                >
                  <div className='border-b border-gray-200 bg-gray-50 p-4'>
                    <div className='flex items-center justify-between'>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className='block max-w-[200px] truncate text-sm font-medium text-gray-900'>
                            {doc.name}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{doc.name}</p>
                        </TooltipContent>
                      </Tooltip>
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0'
                          onClick={() => handleViewDocument(doc.id)}
                        >
                          <Eye className='h-4 w-4 text-gray-500' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0'
                          onClick={() => {
                            setSelectedDocument(doc);
                            setShowEmailDialog(true);
                          }}
                        >
                          <Mail className='h-4 w-4 text-gray-500' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0'
                          onClick={() => {
                            setDocumentToDelete(doc);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className='h-4 w-4 text-gray-500' />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className='p-4'>
                    <div className='flex items-center gap-2 text-sm text-gray-500'>
                      <FileText className='h-4 w-4' />
                      <span>
                        Added{" "}
                        {formatDistanceToNow(new Date(doc.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </TooltipProvider>
          )}
        </div>
      </div>

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
            <Button
              variant='outline'
              onClick={() => {
                setShowCreateDialog(false);
                setSelectedDocType(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedDocType && handleCreateDocument(selectedDocType)
              }
              disabled={!selectedDocType}
              className='bg-primary text-white'
            >
              Create Document
            </Button>
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
            <Button
              variant='outline'
              onClick={() => {
                setShowEmailDialog(false);
                setSelectedDocument(null);
              }}
              disabled={isSendingEmail}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={!selectedDocument || isSendingEmail}
              className='bg-primary text-white'
            >
              {isSendingEmail ? (
                <>
                  <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  Sending...
                </>
              ) : (
                "Send Email"
              )}
            </Button>
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
            <Button
              variant='outline'
              onClick={() => {
                setShowDeleteDialog(false);
                setDocumentToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={() =>
                documentToDelete && handleDeleteDocument(documentToDelete.id)
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
