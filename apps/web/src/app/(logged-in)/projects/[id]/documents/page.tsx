'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Document as DocumentType } from '../../../documents/types';
import { Button } from '@components/ui/button';
import { FileText, Mail, Eye, Trash2, Pencil, Plus, ExternalLink, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { projectStore } from '@atoms/project';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';

export default function ProjectDocumentsPage() {
  const router = useRouter();
  const { project } = projectStore((state) => state);
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [allDocuments, setAllDocuments] = useState<DocumentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<DocumentType | null>(null);

  useEffect(() => {
    fetchDocuments();
    fetchAllDocuments();
  }, [project?.id]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/v1/organization/documents?projectId=${project?.id}`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      toast.error('Failed to fetch documents');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllDocuments = async () => {
    try {
      const response = await fetch('/api/v1/organization/documents');
      if (!response.ok) throw new Error('Failed to fetch all documents');
      const data = await response.json();
      console.log("🚀 ~ fetchAllDocuments ~ data:", data)
      setAllDocuments(data);
    } catch (error) {
      toast.error('Failed to fetch all documents');
      console.error(error);
    }
  };

  const handleViewDocument = (documentId: string) => {
    // router.push(`/documents/${documentId}?projectId=${project?.publicId}`);
    window.open(`/documents/${documentId}?projectId=${project?.publicId}`, '_blank');
  };

  const handleSendEmail = async () => {
    if (!selectedDocument) return;

    setIsSendingEmail(true);
    try {
      const response = await fetch('/api/v1/organization/documents/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: selectedDocument.id,
          projectId: project?.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to send email');

      toast.success('Document sent successfully');
      setShowEmailDialog(false);
      setSelectedDocument(null);
    } catch (error) {
      toast.error('Failed to send document');
      console.error(error);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    try {
      const response = await fetch('/api/v1/organization/documents', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: documentId }),
      });

      if (!response.ok) throw new Error('Failed to delete document');

      setDocuments(documents.filter(doc => doc.id !== documentId));
      setAllDocuments(allDocuments.filter(doc => doc.id !== documentId));
      toast.success('Document deleted successfully');
      setShowDeleteDialog(false);
      setDocumentToDelete(null);
    } catch (error) {
      toast.error('Failed to delete document');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900">Project Documents</h1>
            <p className="text-sm text-gray-500">View and manage project documents</p>
          </div>
          <Button
            onClick={() => setShowEmailDialog(true)}
            className="bg-primary text-white hover:bg-primary/90 transition-colors duration-200"
          >
            <Mail className="w-4 h-4 mr-2" />
            Send Document
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-200 shadow-sm">
              <FileText className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-900">No documents yet</p>
              <p className="text-xs text-gray-500">Documents will appear here when added to the project</p>
            </div>
          ) : (
            <TooltipProvider>
              {documents.map((doc) => {
                return (
                  <div
                    key={doc.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-sm font-medium text-gray-900 truncate block max-w-[200px]">
                              {doc.name}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{doc.name}</p>
                          </TooltipContent>
                        </Tooltip>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleViewDocument(doc.publicId)}
                          >
                            <Eye className="w-4 h-4 text-gray-500" />
                          </Button>
                          {/* <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setSelectedDocument(doc);
                              setShowEmailDialog(true);
                            }}
                          >
                            <Mail className="w-4 h-4 text-gray-500" />
                          </Button> */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setDocumentToDelete(doc);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-gray-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FileText className="w-4 h-4" />
                        <span>Added {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </TooltipProvider>
          )}
        </div>
      </div>

      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Document via Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-1">
                Select Document
              </label>
              <div className="flex gap-2">
                <Select
                  value={selectedDocument?.id?.toString()}
                  onValueChange={(value) => {
                    const doc = allDocuments.find(d => d.id.toString() === value);
                    setSelectedDocument(doc || null);
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a document" />
                  </SelectTrigger>
                  <SelectContent>
                    {allDocuments.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id.toString()}>
                        {doc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedDocument && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDocument(selectedDocument.publicId)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
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
              className="flex items-center gap-2"
            >
              {isSendingEmail ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                'Send'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Delete Document
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete the document "{documentToDelete?.name}"? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDocumentToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => documentToDelete && handleDeleteDocument(documentToDelete.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
