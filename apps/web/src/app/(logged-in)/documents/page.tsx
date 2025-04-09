'use client';

import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '@components/ui/button';
import { toast } from 'sonner';
import { uploadImage } from '@lib/imagekit';
import { PDFDocument } from 'pdf-lib';

// Set up PDF.js worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

interface Document {
  id: number;
  name: string;
  url: string;
  json: string;
}

const DraggablePage = ({ pageNumber, index, movePage }: { pageNumber: number; index: number; movePage: (fromIndex: number, toIndex: number) => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({
    type: 'PAGE',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'PAGE',
    hover: (item: { index: number }, monitor) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      movePage(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        marginBottom: '1rem',
      }}
    >
      <Page pageNumber={pageNumber} width={200} />
    </div>
  );
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (currentDocument?.url) {
      loadPdf(currentDocument.url);
    }
  }, [currentDocument]);

  const loadPdf = async (url: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      setPdfBytes(bytes);
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error('Failed to load PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/v1/organization/documents');
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      toast.error('Failed to fetch documents');
      console.error(error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    try {
      setIsLoading(true);
      
      // Upload to ImageKit
      const uploadResponse = await uploadImage(file, {
        folder: 'documents',
        useUniqueFileName: true,
        responseFields: ['url', 'fileId', 'name', 'filePath'],
      });

      const response = await fetch('/api/v1/organization/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: file.name,
          url: uploadResponse.url,
          json: JSON.stringify({
            fileId: uploadResponse.fileId,
            filePath: uploadResponse.filePath,
          }),
        }),
      });

      if (!response.ok) throw new Error('Failed to save document');

      const savedDocument = await response.json();
      setDocuments([savedDocument, ...documents]);
      setCurrentDocument(savedDocument);
      toast.success('PDF uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const movePage = (fromIndex: number, toIndex: number) => {
    const newOrder = [...pageOrder];
    const [movedPage] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedPage);
    setPageOrder(newOrder);
  };

  const handleSaveDocument = async () => {
    if (!pdfBytes || !currentDocument) return;

    try {
      setIsLoading(true);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const newPdfDoc = await PDFDocument.create();
      
      // Reorder pages based on pageOrder
      const pages = await Promise.all(
        pageOrder.map(async (pageIndex) => {
          const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageIndex]);
          return copiedPage;
        })
      );
      
      pages.forEach((page) => newPdfDoc.addPage(page));
      
      const modifiedPdfBytes = await newPdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });

      // Upload to ImageKit
      const uploadResponse = await uploadImage(blob, {
        folder: 'documents',
        useUniqueFileName: true,
        responseFields: ['url', 'fileId', 'name', 'filePath'],
      });

      // Update document in database
      const response = await fetch('/api/v1/organization/documents', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: currentDocument.id,
          url: uploadResponse.url,
          json: JSON.stringify({
            fileId: uploadResponse.fileId,
            filePath: uploadResponse.filePath,
          }),
        }),
      });

      if (!response.ok) throw new Error('Failed to update document');

      const updatedDocument = await response.json();
      setDocuments(documents.map(doc => 
        doc.id === updatedDocument.id ? updatedDocument : doc
      ));
      setCurrentDocument(updatedDocument);
      toast.success('Document saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/v1/organization/documents', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: documentId }),
      });

      if (!response.ok) throw new Error('Failed to delete document');

      setDocuments(documents.filter(doc => doc.id !== documentId));
      if (currentDocument?.id === documentId) {
        setCurrentDocument(null);
      }
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex gap-4">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          disabled={isLoading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {currentDocument && (
          <>
            <Button onClick={handleSaveDocument} disabled={isLoading}>Save Document</Button>
            <Button 
              variant="destructive" 
              onClick={() => handleDeleteDocument(currentDocument.id)}
              disabled={isLoading}
            >
              Delete Document
            </Button>
          </>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1">
          <h2 className="text-lg font-semibold mb-2">Documents</h2>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={`p-2 rounded cursor-pointer ${
                  currentDocument?.id === doc.id
                    ? 'bg-violet-100'
                    : 'hover:bg-gray-100'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !isLoading && setCurrentDocument(doc)}
              >
                {doc.name}
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-3 relative">
          {currentDocument && pdfBytes && (
            <DndProvider backend={HTML5Backend}>
              <Document
                file={new Blob([pdfBytes], { type: 'application/pdf' })}
                onLoadSuccess={({ numPages }: { numPages: number }) => {
                  setNumPages(numPages);
                  setPageOrder(Array.from({ length: numPages }, (_, i) => i));
                }}
                loading={
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-700"></div>
                  </div>
                }
              >
                <div className="space-y-4">
                  {pageOrder.map((pageIndex, index) => (
                    <DraggablePage
                      key={pageIndex}
                      pageNumber={pageIndex + 1}
                      index={index}
                      movePage={movePage}
                    />
                  ))}
                </div>
              </Document>
            </DndProvider>
          )}
          {isLoading && !pdfBytes && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-700"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
