import { Button } from '@components/ui/button';
import { FileText, ArrowUpDown, Clock, Trash2, Eye } from 'lucide-react';
import { Document, DeleteConfirmState } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface DocumentListProps {
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  setCurrentDocument: (doc: Document) => void;
  setShowDeleteConfirm: (state: DeleteConfirmState | null) => void;
}

export default function DocumentList({
  documents,
  currentDocument,
  isLoading,
  setCurrentDocument,
  setShowDeleteConfirm
}: DocumentListProps) {
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
        <div className="p-2 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
          {documents.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-900 mb-1">No documents yet</p>
              <p className="text-xs text-gray-500">Upload a PDF to get started</p>
            </div>
          ) : (
            documents.map((doc) => {
              const documentData = JSON.parse(doc.json);
              const annotationCount = Object.keys(documentData.annotations || {}).reduce(
                (acc, page) => acc + (documentData.annotations[page]?.length || 0),
                0
              );
              
              return (
                <div
                  key={doc.id}
                  className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    currentDocument?.id === doc.id
                      ? 'bg-primary/5 border border-primary/20 shadow-sm'
                      : 'hover:bg-gray-50 border border-transparent'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !isLoading && setCurrentDocument(doc)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg transition-colors duration-200 ${
                      currentDocument?.id === doc.id 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 truncate block">
                          {doc.name}
                        </span>
                        <div className="flex items-center gap-2">
                          {/* {annotationCount > 0 && (
                            <span className="flex items-center text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {annotationCount} annotations
                            </span>
                          )} */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className=" group-hover:opacity-100 transition-opacity duration-200 p-1 h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm({ type: 'document', id: doc.id, name: doc.name });
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
                          </Button>
                        </div>
                      </div>
                  
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
} 