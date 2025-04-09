import { Button } from '@components/ui/button';
import { Document, Page, pdfjs } from 'react-pdf';
import { Rnd } from 'react-rnd';
import type { DraggableEvent, DraggableData } from 'react-draggable';
import { PenLine, Type, Image, Save, Trash2, ChevronLeft, ChevronRight, Pencil, X, FileText, GripVertical, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Document as DocumentType, Annotation } from '../types';
import { useState, useEffect } from 'react';

interface PDFViewerProps {
  currentDocument: DocumentType | null;
  pageNumber: number;
  numPages: number | null;
  setPageNumber: (page: number) => void;
  setNumPages: (pages: number) => void;
  isLoading: boolean;
  setShowSignatureList: (show: boolean) => void;
  setShowTextInput: (show: boolean) => void;
  handleSaveDocument: () => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setShowDeleteConfirm: (state: { type: 'document' | 'signature' | 'annotation'; id: number; name?: string } | null) => void;
  pdfContainerRef: React.RefObject<HTMLDivElement>;
  annotations: Record<number, Annotation[]>;
  selectedAnnotation: number | null;
  setSelectedAnnotation: (index: number | null) => void;
  handleAnnotationUpdate: (index: number, updates: Partial<Annotation>) => void;
  handleAnnotationDelete: (index: number) => void;
  handleEditAnnotation: (index: number) => void;
  pdfError: string | null;
  setPdfError: (error: string | null) => void;
}

export default function PDFViewer({
  currentDocument,
  pageNumber,
  numPages,
  setPageNumber,
  setNumPages,
  isLoading,
  setShowSignatureList,
  setShowTextInput,
  handleSaveDocument,
  handleImageUpload,
  setShowDeleteConfirm,
  pdfContainerRef,
  annotations,
  selectedAnnotation,
  setSelectedAnnotation,
  handleAnnotationUpdate,
  handleAnnotationDelete,
  handleEditAnnotation,
  pdfError,
  setPdfError
}: PDFViewerProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showToolbar, setShowToolbar] = useState(true);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && pageNumber > 1) {
        setPageNumber(pageNumber - 1);
      } else if (e.key === 'ArrowRight' && numPages && pageNumber < numPages) {
        setPageNumber(pageNumber + 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [pageNumber, numPages, setPageNumber]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setPdfError('Failed to load PDF. Please try again.');
    toast.error('Failed to load PDF. Please try again.');
  };

  return (
    <div className="col-span-9">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {currentDocument ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentDocument.name}
                </h3>
                <p className="text-sm text-gray-500">Page {pageNumber} of {numPages}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowSignatureList(true)}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="relative group"
                >
                  <PenLine className="w-4 h-4 mr-2" />
                  Add Signature
                </Button>
                <Button
                  onClick={() => setShowTextInput(true)}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="group"
                >
                  <Type className="w-4 h-4 mr-2" />
                  Add Text
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isLoading}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="group"
                >
                  <Image className="w-4 h-4 mr-2" />
                  Add Image
                </Button>
                <div className="h-6 w-px bg-gray-200 mx-2" />
                <Button
                  onClick={handleSaveDocument}
                  disabled={isLoading}
                  size="sm"
                  className="bg-primary text-white hover:bg-primary/90 transition-colors duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => currentDocument && setShowDeleteConfirm({
                    type: 'document',
                    id: currentDocument.id,
                    name: currentDocument.name
                  })}
                  disabled={isLoading}
                  className="group"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div ref={pdfContainerRef} className="relative bg-gray-50 rounded-lg p-4">
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-lg z-50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newScale = Math.min(scale + 0.1, 2);
                    setScale(newScale);
                  }}
                  disabled={scale >= 2}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newScale = Math.max(scale - 0.1, 0.5);
                    setScale(newScale);
                  }}
                  disabled={scale <= 0.5}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <div className="h-6 w-px bg-gray-200" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-lg z-50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                  disabled={pageNumber <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  {pageNumber} / {numPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages || prev))}
                  disabled={!numPages || pageNumber >= numPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <Document
                file={currentDocument.url}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                }
                error={
                  <div className="text-red-500 text-center p-4">
                    {pdfError || 'Failed to load PDF'}
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  width={800 * scale}
                  rotate={rotation}
                  renderAnnotationLayer={true}
                  renderTextLayer={true}
                  loading={
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  }
                  error={
                    <div className="flex items-center justify-center h-64 text-red-500">
                      Failed to load page
                    </div>
                  }
                />
                {annotations[pageNumber]?.map((annotation, index) => (
                  <Rnd
                    key={`${pageNumber}-${index}`}
                    default={{
                      x: annotation.x,
                      y: annotation.y,
                      width: annotation.width || 200,
                      height: annotation.height || 100,
                    }}
                    bounds="parent"
                    enableUserSelectHack={false}
                    cancel=".no-drag"
                    enableResizing={{
                      top: true,
                      right: true,
                      bottom: true,
                      left: true,
                      topRight: true,
                      bottomRight: true,
                      bottomLeft: true,
                      topLeft: true
                    }}
                    enableDragging={true}
                    dragHandleClassName="drag-handle"
                    resizeHandleClasses={{
                      top: 'resize-handle resize-handle-top',
                      right: 'resize-handle resize-handle-right',
                      bottom: 'resize-handle resize-handle-bottom',
                      left: 'resize-handle resize-handle-left',
                      topRight: 'resize-handle resize-handle-top-right',
                      bottomRight: 'resize-handle resize-handle-bottom-right',
                      bottomLeft: 'resize-handle resize-handle-bottom-left',
                      topLeft: 'resize-handle resize-handle-top-left'
                    }}
                    onDragStop={(e: DraggableEvent, d: DraggableData) => {
                      handleAnnotationUpdate(index, { x: d.x, y: d.y });
                    }}
                    onResizeStop={(
                      e: DraggableEvent,
                      direction: string,
                      ref: HTMLElement,
                      delta: { width: number; height: number },
                      position: { x: number; y: number }
                    ) => {
                      handleAnnotationUpdate(index, {
                        x: position.x,
                        y: position.y,
                        width: parseInt(ref.style.width),
                        height: parseInt(ref.style.height),
                      });
                    }}
                    className={`border-2 transition-all duration-200 ${
                      selectedAnnotation === index
                        ? 'border-primary shadow-lg'
                        : 'border-transparent hover:border-primary/20'
                    } z-50`}
                    style={{ zIndex: 50 }}
                    onClick={() => setSelectedAnnotation(index)}
                  >
                    <div className="w-full h-full relative bg-white/80 backdrop-blur-sm rounded-lg overflow-hidden">
                      <style jsx>{`
                        .resize-handle {
                          width: 8px;
                          height: 8px;
                          background: white;
                          border: 2px solid #2563eb;
                          border-radius: 4px;
                          position: absolute;
                        }
                        .resize-handle-top {
                          top: 0;
                          left: 50%;
                          transform: translateX(-50%);
                          cursor: ns-resize;
                        }
                        .resize-handle-right {
                          right: 0;
                          top: 50%;
                          transform: translateY(-50%);
                          cursor: ew-resize;
                        }
                        .resize-handle-bottom {
                          bottom: 0;
                          left: 50%;
                          transform: translateX(-50%);
                          cursor: ns-resize;
                        }
                        .resize-handle-left {
                          left: 0;
                          top: 50%;
                          transform: translateY(-50%);
                          cursor: ew-resize;
                        }
                        .resize-handle-top-right {
                          top: 0;
                          right: 0;
                          cursor: nwse-resize;
                        }
                        .resize-handle-bottom-right {
                          bottom: 0;
                          right: 0;
                          cursor: nesw-resize;
                        }
                        .resize-handle-bottom-left {
                          bottom: 0;
                          left: 0;
                          cursor: nwse-resize;
                        }
                        .resize-handle-top-left {
                          top: 0;
                          left: 0;
                          cursor: nesw-resize;
                        }
                      `}</style>
                      <div className="absolute top-1 left-1 flex gap-1 drag-handle">
                        <div className="cursor-move text-gray-400 hover:text-gray-600 transition-colors duration-200">
                          <GripVertical className="w-4 h-4" />
                        </div>
                      </div>
                      {annotation.type === 'signature' ? (
                        <img
                          src={annotation.data}
                          alt="Signature"
                          className="w-full h-full object-contain"
                        />
                      ) : annotation.type === 'image' ? (
                        <img
                          src={annotation.data}
                          alt="Annotation"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-2">
                          <p
                            className="text-sm"
                            style={{
                              fontSize: `${annotation.fontSize || 14}px`,
                              color: annotation.color || '#000000'
                            }}
                          >
                            {annotation.text}
                          </p>
                        </div>
                      )}
                      {selectedAnnotation === index && (
                        <div className="absolute top-1 right-1 flex gap-1">
                          {annotation.type === 'text' && (
                              <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-6 w-6 hover:bg-gray-100"
                              onClick={(e) => {
                              e.stopPropagation();
                              handleEditAnnotation(index);
                            }}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 h-6 w-6 hover:bg-red-50 hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAnnotationDelete(index);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </Rnd>
                ))}
              </Document>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-900">No document selected</p>
              <p className="text-xs text-gray-500 mt-1">Select a document from the list to view</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 