import { Button } from '@components/ui/button';
import { FileText, ArrowUpDown, Clock, Trash2, Eye, Pencil } from 'lucide-react';
import { Document, DeleteConfirmState } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import EditDocumentNameModal from './EditDocumentNameModal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip';

interface DocumentListProps {
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  setCurrentDocument: (doc: Document) => void;
  setShowDeleteConfirm: (state: DeleteConfirmState | null) => void;
  onRefetch: () => Promise<void>;
}

export default function DocumentList({
  documents,
  currentDocument,
  isLoading,
  setCurrentDocument,
  setShowDeleteConfirm,
  onRefetch
}: DocumentListProps) {
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);

  const handleEditSuccess = async (updatedDoc: Document) => {
    setCurrentDocument(updatedDoc);
    setEditingDoc(null);
    await onRefetch();
  };

  return (
    <div className="col-span-3">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Your Documents</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-gray-100"
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {documents.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-900 mb-1">No documents yet</p>
              <p className="text-xs text-gray-500">Upload a PDF to get started</p>
            </div>
          ) : (
            <TooltipProvider>
              {documents.map((doc) => {
                const documentData = JSON.parse(doc.json);
                const annotationCount = Object.keys(documentData.annotations || {}).reduce(
                  (acc, page) => acc + (documentData.annotations[page]?.length || 0),
                  0
                );
                
                return (
                  <div
                    key={doc.id}
                    className={`group px-4 py-3 hover:bg-gray-50 transition-colors duration-200 ${
                      currentDocument?.id === doc.id
                        ? 'bg-primary/5'
                        : ''
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={() => !isLoading && setCurrentDocument(doc)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex-shrink-0 p-2 rounded-lg transition-colors duration-200 ${
                        currentDocument?.id === doc.id 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                      }`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
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
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {annotationCount > 0 && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {annotationCount}
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingDoc(doc);
                              }}
                            >
                              <Pencil className="w-4 h-4 text-gray-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm({ type: 'document', id: doc.id, name: doc.name });
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-gray-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </TooltipProvider>
          )}
        </div>
      </div>

      <EditDocumentNameModal
        show={!!editingDoc}
        setShow={(show) => !show && setEditingDoc(null)}
        document={editingDoc}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
} 