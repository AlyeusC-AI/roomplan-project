import { Document, Page, pdfjs } from 'react-pdf';
import { Document as DocumentType, Annotation } from '../../../(logged-in)/documents/types';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@components/ui/button';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PublicPDFViewerProps {
  currentDocument: DocumentType | null;
  pageNumber: number;
  numPages: number | null;
  setPageNumber: (page: number) => void;
  setNumPages: (pages: number | null) => void;
  isLoading: boolean;
  pdfContainerRef: React.RefObject<HTMLDivElement>;
  annotations: Record<number, Annotation[]>;
  selectedAnnotation: number | null;
  setSelectedAnnotation: (index: number | null) => void;
  pdfError: string | null;
  setPdfError: (error: string | null) => void;
}

export default function PublicPDFViewer({
  currentDocument,
  pageNumber,
  numPages,
  setPageNumber,
  setNumPages,
  isLoading,
  pdfContainerRef,
  annotations,
  selectedAnnotation,
  setSelectedAnnotation,
  pdfError,
  setPdfError,
}: PublicPDFViewerProps) {
  const [scale, setScale] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setPdfError('Failed to load PDF. Please try again.');
  };

  const renderAnnotations = () => {
    const pageAnnotations = annotations[pageNumber] || [];
    return pageAnnotations.map((annotation, index) => {
      if (annotation.type === 'clientSignature') {
        return (
          <div
            key={index}
            className="absolute"
            style={{
              left: `${annotation.x}px`,
              top: `${annotation.y}px`,
              width: annotation.width,
              height: annotation.height,
              border: selectedAnnotation === index ? '2px solid blue' : '1px dashed gray',
              cursor: annotation.isPlaceholder ? 'pointer' : 'default'
            }}
            onClick={() => annotation.isPlaceholder && setSelectedAnnotation(index)}
          >
            {annotation.isPlaceholder ? (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Click to sign here
              </div>
            ) : (
              <img
                src={annotation.data}
                alt="Signature"
                className="w-full h-full object-contain"
              />
            )}
          </div>
        );
      }
      return null;
    });
  };

  if (!currentDocument) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {currentDocument.name}
            </h3>
            <p className="text-sm text-gray-500">Page {pageNumber} of {numPages}</p>
          </div>
        </div>

        <div className="relative" ref={pdfContainerRef}>
          <Document
            file={currentDocument.url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading="Loading PDF..."
          >
            <Page
              pageNumber={pageNumber}
              width={800}
              renderAnnotationLayer={true}
              renderTextLayer={true}
            />
            {renderAnnotations()}
          </Document>
        </div>
{/* 
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
            disabled={pageNumber <= 1}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button
            onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages || 1))}
            disabled={pageNumber >= (numPages || 1)}
            variant="outline"
            size="sm"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div> */}
      </div>
    </div>
  );
} 