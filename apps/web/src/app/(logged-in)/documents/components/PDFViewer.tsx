'use client'
import { Button } from '@components/ui/button';
import { Document, Page, pdfjs } from 'react-pdf';
import { Rnd } from 'react-rnd';
import type { DraggableEvent, DraggableData } from 'react-draggable';
import { PenLine, Type, Image, Save, Trash2, ChevronLeft, ChevronRight, Pencil, X, FileText, GripVertical, ZoomIn, ZoomOut, RotateCcw, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Document as DocumentType, Annotation } from '../types';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@components/ui/dialog';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import './pdfView.css';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  currentDocument: DocumentType | null;
  pageNumber: number;
  numPages: number | null;
  setPageNumber: (page: number) => void;
  setNumPages: (pages: number | null) => void;
  isLoading: boolean;
  setShowSignatureList?: (show: boolean) => void;
  setShowTextInput?: (show: boolean) => void;
  handleSaveDocument?: () => void;
  handleImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setShowDeleteConfirm?: (state: any) => void;
  pdfContainerRef: React.RefObject<HTMLDivElement>;
  annotations: Record<number, Annotation[]>;
  setAnnotations: (annotations: Record<number, Annotation[]>) => void;
  selectedAnnotation?: number | null;
  handleAnnotationUpdate?: (index: number, updates: Partial<Annotation>) => void;
  handleEditAnnotation?: (index: number) => void;
  pdfError: string | null;
  setPdfError: (error: string | null) => void;
  isViewing?: boolean;
  setShowSignaturePad?: ( annotation: Annotation) => void;
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
  setAnnotations,
  selectedAnnotation,
  handleAnnotationUpdate,
  handleEditAnnotation,
  pdfError,
  setPdfError,
  isViewing,
  setShowSignaturePad,
}: PDFViewerProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showNameInput, setShowNameInput] = useState(false);
  const [placeholderName, setPlaceholderName] = useState('');

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

  const handleAddClientSignaturePlaceholder = () => {
    setShowNameInput(true);
  };

  const handleConfirmPlaceholder = () => {
    if (!placeholderName.trim()) {
      toast.error('Please enter a name for the placeholder');
      return;
    }

    const newAnnotation: Annotation = {
      type: 'clientSignature',
      x: 100,
      y: 100,
      data: '',
      width: 200,
      height: 100,
      pageNumber: pageNumber,
      isPlaceholder: true,
      name: placeholderName
    };
    setAnnotations({
      ...annotations,
      [pageNumber]: [...(annotations[pageNumber] || []), newAnnotation]
    });
    setShowNameInput(false);
    setPlaceholderName('');
    toast.success('Client signature placeholder added');
  };

  return (
    <div className="col-span-9 resp-zoom">
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
              {!isViewing && <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isLoading}
                  className="hidden"
                  id="image-upload"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Annotation
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem
                      onClick={() => setShowSignatureList(true)}
                      className="flex items-center gap-2"
                    >
                      <PenLine className="w-4 h-4" />
                      Add Signature
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowTextInput(true)}
                      className="flex items-center gap-2"
                    >
                      <Type className="w-4 h-4" />
                      Add Text
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => document.getElementById('image-upload')?.click()}
                      className="flex items-center gap-2"
                    >
                      <Image className="w-4 h-4" />
                      Add Image
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleAddClientSignaturePlaceholder}
                      className="flex items-center gap-2"
                    >
                      <PenLine className="w-4 h-4" />
                      Add Client Signature Placeholder
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
              </div>}
            </div>

            <div ref={pdfContainerRef} className="relative bg-gray-50 rounded-lg p-4">
              {isViewing && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-lg z-50">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Find the next client signature placeholder
                      const allPages = Object.entries(annotations);
                      for (const [pageNum, pageAnnotations] of allPages) {
                        const placeholder = pageAnnotations.find(
                          (a) => a.type === 'clientSignature' && a.isPlaceholder
                        );
                        if (placeholder) {
                          setPageNumber(Number(pageNum));
                          setShowSignaturePad && setShowSignaturePad(placeholder);
                          break;
                        }
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <PenLine className="w-4 h-4" />
                    Sign Now
                  </Button>
                </div>
              )}

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-lg z-50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPageNumber(pageNumber - 1)}
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
                  onClick={() => setPageNumber(pageNumber + 1)}
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
                    key={index}
                    default={{
                      x: annotation.x,
                      y: annotation.y,
                      width: annotation.width || 200,
                      height: annotation.height || 100,
                    }}
                    bounds="parent" 
                    disableDragging={isViewing}
                    onDragStop={(e, d) => {
                      handleAnnotationUpdate && handleAnnotationUpdate(index, { x: d.x, y: d.y });
                    }}
                    onResizeStop={(e, direction, ref, delta, position) => {
                      handleAnnotationUpdate && handleAnnotationUpdate(index, {
                        x: position.x,
                        y: position.y,
                        width: parseInt(ref.style.width),
                        height: parseInt(ref.style.height),
                      });
                    }}
                    enableResizing={!isViewing}
                    className={`border-2 transition-all duration-200 ${
                      selectedAnnotation === index
                        ? 'border-primary shadow-lg'
                        : 'border-transparent hover:border-primary/20'
                    } z-50`}
                    style={{ zIndex: 50 }}
                  >
                    <div className="w-full h-full relative group">
                     
                     {!isViewing && <div className="absolute top-1 left-1 cursor-move text-gray-400 hover:text-gray-600 transition-colors duration-200">
                        <GripVertical className="w-4 h-4" />
                      </div>}

                      <div className="absolute top-1 right-1 flex gap-1">
                        {annotation.type === 'text' && handleEditAnnotation && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>   handleEditAnnotation(index)}
                            className="h-6 w-6 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                        )}
                        {setShowDeleteConfirm && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDeleteConfirm({
                              type: 'annotation',
                              id: index
                            })}
                            className="h-6 w-6 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
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
                      ) : annotation.type === 'clientSignature' ? (
                        <div 
                          className="w-full h-full flex items-center justify-center p-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary/50 transition-colors duration-200"
                          onClick={() => setShowSignaturePad && setShowSignaturePad(annotation)}
                        >
                          {annotation.isPlaceholder ? (
                            <div className="text-center">
                              <PenLine className="w-6 h-6 mx-auto text-gray-400" />
                              <p className="text-sm text-gray-500 mt-2">{annotation.name || 'Client Signature Placeholder'}</p>
                            </div>
                          ) : (
                            <div className="relative w-full h-full">
                              <img
                                src={annotation.data}
                                alt="Signature"
                                className="w-full h-full object-contain"
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/10 transition-opacity duration-200">
                                <PenLine className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : annotation.type === 'text' ? (
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
                      ) : null}
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

      <Dialog open={showNameInput} onOpenChange={setShowNameInput}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Client Signature Placeholder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Placeholder Name
              </label>
              <input
                type="text"
                value={placeholderName}
                onChange={(e) => setPlaceholderName(e.target.value)}
                placeholder="Enter placeholder name"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNameInput(false);
                setPlaceholderName('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPlaceholder}
              className="bg-primary text-white hover:bg-primary/90 transition-colors duration-200"
            >
              Add Placeholder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 