'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Document as DocumentType, Annotation } from '../../../(logged-in)/documents/types';
import PublicPDFViewer from '../components/PublicPDFViewer';
import SignaturePadModal from '../../../(logged-in)/documents/components/SignaturePadModal';
import LoadingOverlay from '../../../(logged-in)/documents/components/LoadingOverlay';
import PDFViewer from '../../../(logged-in)/documents/components/PDFViewer';
import { useParams, useSearchParams } from 'next/navigation';
export default function PublicDocumentPage() {
    const params = useParams();
    const id = params.id;
    const searchParams = useSearchParams();
    const projectId = searchParams.get('projectId');
    console.log("🚀 ~ PublicDocumentPage ~ id:", id)
  const [document, setDocument] = useState<DocumentType | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [annotations, setAnnotations] = useState<Record<number, Annotation[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState<Annotation | null>(null);
  const signaturePadRef = useRef<any>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    id&&  fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const response = await fetch(`/api/v1/public/documents/${id}?projectId=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch document');
      const data = await response.json();
      setDocument(data);
      
      if (data.json) {
        try {
          const documentData = JSON.parse(data.json);
          if (documentData.annotations) {
            setAnnotations(documentData.annotations);
          }
        } catch (error) {
          console.error('Error parsing document JSON:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      toast.error('Failed to load document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignatureSave = async (annotation: Annotation) => {
    if (!signaturePadRef.current || !document) return;

    const signatureData = signaturePadRef.current.toDataURL();
    if (signatureData) {
      try {
        const updatedAnnotations = { ...annotations };
        const pageAnnotations = [...(updatedAnnotations[pageNumber] || [])];
        const annotationIndex = pageAnnotations.findIndex(a => a.name === annotation.name);
        
        if (annotation.type === 'clientSignature') {
          if (annotationIndex === -1) {
            // New signature
            pageAnnotations.push({
              ...annotation,
              data: signatureData,
              isPlaceholder: false
            });
          } else {
            // Update existing signature
            pageAnnotations[annotationIndex] = {
              ...annotation,
              data: signatureData,
              isPlaceholder: false
            };
          }
          updatedAnnotations[pageNumber] = pageAnnotations;

          const response = await fetch(`/api/v1/public/documents/${id}?projectId=${projectId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ json: JSON.stringify({
                annotations:updatedAnnotations,
                fileId: JSON.parse(document.json).fileId,
                filePath: JSON.parse(document.json).filePath,
              }), projectId: projectId }),
          });

          if (!response.ok) throw new Error('Failed to save signature');

          setAnnotations(updatedAnnotations);
          setShowSignaturePad(null);
          signaturePadRef.current.clear();
          toast.success('Signature saved successfully');
        }
      } catch (error) {
        console.error('Error saving signature:', error);
        toast.error('Failed to save signature');
      }
    }
  };

  const handleClearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };



  if (isLoading) {
    return <LoadingOverlay show={true} />;
  }

  if (!document) {
    return <div className="flex items-center justify-center min-h-screen">Document not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-2xl font-bold">{document.name}</h1>
        
        <PDFViewer
        currentDocument={document}
        pageNumber={pageNumber}
        numPages={numPages}
        setPageNumber={setPageNumber}
        setNumPages={setNumPages}
        isLoading={isLoading}
        isViewing={true}
        pdfContainerRef={pdfContainerRef}
        annotations={annotations}
        setAnnotations={setAnnotations}

        pdfError={pdfError}
        setPdfError={setPdfError}
        setShowSignaturePad={setShowSignaturePad}

        />

        <SignaturePadModal
          show={showSignaturePad !== null}
          setShow={() => setShowSignaturePad(null)}
          signaturePadRef={signaturePadRef}
          newSignatureName=""
          isDrawing={false}
          setIsDrawing={() => {}}
          handleSaveSignature={() => showSignaturePad !== null && handleSignatureSave(showSignaturePad)}
          handleClearSignature={handleClearSignature}
        />
      </div>
    </div>
  );
} 