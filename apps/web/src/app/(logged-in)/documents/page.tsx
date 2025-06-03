"use client";

import { Button } from "@components/ui/button";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Document, Page, pdfjs } from "react-pdf";
import SignaturePad from "react-signature-canvas";
import { Rnd } from "react-rnd";
import type { DraggableEvent, DraggableData } from "react-draggable";
import {
  FileText,
  Image,
  PenLine,
  Plus,
  Trash2,
  X,
  Type,
  Palette,
  Pencil,
  Save,
  RotateCcw,
  Check,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";

// Components
import DocumentList from "./components/DocumentList";
import PDFViewer from "./components/PDFViewer";
import SignaturePadModal from "./components/SignaturePadModal";
import SignatureListModal from "./components/SignatureListModal";
import TextInputModal from "./components/TextInputModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import LoadingOverlay from "./components/LoadingOverlay";
import { uploadImage } from "@service-geek/api-client";

interface Document {
  id: number;
  name: string;
  url: string;
  json: string;
}

interface Annotation {
  type: "signature" | "image" | "text" | "clientSignature";
  x: number;
  y: number;
  data: string;
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  color?: string;
  pageNumber: number;
  isPlaceholder?: boolean;
  name?: string;
}

interface Signature {
  id: number;
  name: string;
  sign: string;
  orgId: number;
}

interface DeleteConfirmState {
  type: "document" | "signature" | "annotation";
  id: number;
  name?: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [annotations, setAnnotations] = useState<Record<number, Annotation[]>>(
    {}
  );
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const signaturePadRef = useRef<SignaturePad>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [selectedAnnotation, setSelectedAnnotation] = useState<number | null>(
    null
  );
  const [textSize, setTextSize] = useState(14);
  const [textColor, setTextColor] = useState("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingAnnotation, setEditingAnnotation] = useState<number | null>(
    null
  );
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [showSignatureList, setShowSignatureList] = useState(false);
  const [newSignatureName, setNewSignatureName] = useState("");
  const [selectedSignature, setSelectedSignature] = useState<Signature | null>(
    null
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [showSignatureActions, setShowSignatureActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState<DeleteConfirmState | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (currentDocument?.url) {
      loadPdf(currentDocument.url);
    }
  }, [currentDocument]);

  useEffect(() => {
    fetchSignatures();
  }, []);

  useEffect(() => {
    if (currentDocument?.json) {
      try {
        const documentData = JSON.parse(currentDocument.json);
        if (documentData.annotations) {
          setAnnotations(documentData.annotations);
        } else {
          setAnnotations({});
        }
      } catch (error) {
        console.error("Error parsing document JSON:", error);
        setAnnotations({});
      }
    } else {
      setAnnotations({});
    }
  }, [currentDocument]);

  const loadPdf = async (url: string) => {
    try {
      setIsLoading(true);
      // PDF loading is handled by react-pdf
    } catch (error) {
      console.error("Error loading PDF:", error);
      toast.error("Failed to load PDF. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF:", error);
    setPdfError("Failed to load PDF. Please try again.");
    toast.error("Failed to load PDF. Please try again.");
  };

  const handleSignatureSave = () => {
    if (signaturePadRef.current) {
      const signatureData = signaturePadRef.current.toDataURL();
      if (signatureData) {
        const newAnnotation: Annotation = {
          type: "signature",
          x: 100,
          y: 100,
          data: signatureData,
          pageNumber: pageNumber,
        };
        setAnnotations((prev) => ({
          ...prev,
          [pageNumber]: [...(prev[pageNumber] || []), newAnnotation],
        }));
        setShowSignaturePad(false);
        signaturePadRef.current.clear();
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const uploadResponse = await uploadImage(file, {
        folder: "documents/annotations",
        useUniqueFileName: true,
        responseFields: ["url"],
      });

      const newAnnotation: Annotation = {
        type: "image",
        x: 100,
        y: 100,
        data: uploadResponse.url,
        width: 200,
        height: 200,
        pageNumber: pageNumber,
      };
      setAnnotations((prev) => ({
        ...prev,
        [pageNumber]: [...(prev[pageNumber] || []), newAnnotation],
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDocument = async () => {
    if (!currentDocument) return;

    try {
      setIsLoading(true);
      const response = await fetch("/api/v1/organization/documents", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: currentDocument.id,
          json: JSON.stringify({
            annotations,
            fileId: JSON.parse(currentDocument.json).fileId,
            filePath: JSON.parse(currentDocument.json).filePath,
          }),
        }),
      });

      if (!response.ok) throw new Error("Failed to update document");

      const updatedDocument = await response.json();
      setDocuments(
        documents.map((doc) =>
          doc.id === updatedDocument.id ? updatedDocument : doc
        )
      );
      setCurrentDocument(updatedDocument);
      toast.success("Document saved successfully");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save document");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/v1/organization/documents");
      if (!response.ok) throw new Error("Failed to fetch documents");
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      toast.error("Failed to fetch documents");
      console.error(error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    try {
      setIsLoading(true);

      // Upload to ImageKit
      const uploadResponse = await uploadImage(file, {
        folder: "documents",
        useUniqueFileName: true,
        responseFields: ["url", "fileId", "name", "filePath"],
      });

      const response = await fetch("/api/v1/organization/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: file.name,
          url: uploadResponse.url,
          json: JSON.stringify({
            fileId: uploadResponse.fileId,
            filePath: uploadResponse.filePath,
            annotations: {},
          }),
        }),
      });

      if (!response.ok) throw new Error("Failed to save document");

      const savedDocument = await response.json();
      setDocuments([savedDocument, ...documents]);
      setCurrentDocument(savedDocument);
      toast.success("PDF uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload PDF");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/v1/organization/documents", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: documentId }),
      });

      if (!response.ok) throw new Error("Failed to delete document");

      setDocuments(documents.filter((doc) => doc.id !== documentId));
      if (currentDocument?.id === documentId) {
        setCurrentDocument(null);
      }
      toast.success("Document deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete document");
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(null);
    }
  };

  const handleAddText = () => {
    if (textInput.trim()) {
      const newAnnotation: Annotation = {
        type: "text",
        x: 100,
        y: 100,
        data: "",
        text: textInput,
        width: 200,
        height: 50,
        fontSize: textSize,
        color: textColor,
        pageNumber: pageNumber,
      };
      setAnnotations((prev) => ({
        ...prev,
        [pageNumber]: [...(prev[pageNumber] || []), newAnnotation],
      }));
      setTextInput("");
      setTextSize(14);
      setTextColor("#000000");
      setShowTextInput(false);
    }
  };

  const handleAnnotationUpdate = (
    index: number,
    updates: Partial<Annotation>
  ) => {
    setAnnotations((prev) => {
      const pageAnnotations = [...(prev[pageNumber] || [])];
      pageAnnotations[index] = { ...pageAnnotations[index], ...updates };
      return { ...prev, [pageNumber]: pageAnnotations };
    });
  };

  const handleAnnotationDelete = (index: number) => {
    setAnnotations((prev) => {
      const pageAnnotations = [...(prev[pageNumber] || [])];
      pageAnnotations.splice(index, 1);
      return { ...prev, [pageNumber]: pageAnnotations };
    });
    setShowDeleteConfirm(null);
    toast.success("Annotation removed");
  };

  const handleEditAnnotation = (index: number) => {
    const pageAnnotations = annotations[pageNumber] || [];
    const annotation = pageAnnotations[index];
    if (annotation.type === "text") {
      setTextInput(annotation.text || "");
      setTextSize(annotation.fontSize || 14);
      setTextColor(annotation.color || "#000000");
      setEditingAnnotation(index);
      setShowTextInput(true);
    }
  };

  const handleUpdateText = () => {
    if (textInput.trim() && editingAnnotation !== null) {
      setAnnotations((prev) => {
        const pageAnnotations = [...(prev[pageNumber] || [])];
        pageAnnotations[editingAnnotation] = {
          ...pageAnnotations[editingAnnotation],
          text: textInput,
          fontSize: textSize,
          color: textColor,
        };
        return { ...prev, [pageNumber]: pageAnnotations };
      });
      setTextInput("");
      setTextSize(14);
      setTextColor("#000000");
      setEditingAnnotation(null);
      setShowTextInput(false);
    }
  };

  const fetchSignatures = async () => {
    try {
      const response = await fetch("/api/v1/organization/signatures");
      if (!response.ok) throw new Error("Failed to fetch signatures");
      const data = await response.json();
      setSignatures(data);
    } catch (error) {
      console.error("Error fetching signatures:", error);
      toast.error("Failed to fetch signatures");
    }
  };

  const handleSaveSignature = async () => {
    if (!signaturePadRef.current || !newSignatureName.trim()) return;

    const signatureData = signaturePadRef.current.toDataURL();
    if (signatureData) {
      try {
        const response = await fetch("/api/v1/organization/signatures", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newSignatureName,
            sign: signatureData,
          }),
        });

        if (!response.ok) throw new Error("Failed to save signature");

        const newSignature = await response.json();
        setSignatures([newSignature, ...signatures]);
        setShowSignaturePad(false);
        setNewSignatureName("");
        signaturePadRef.current.clear();
        toast.success("Signature saved successfully");
      } catch (error) {
        console.error("Error saving signature:", error);
        toast.error("Failed to save signature");
      }
    }
  };

  const handleDeleteSignature = async (id: number) => {
    try {
      const response = await fetch("/api/v1/organization/signatures", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Failed to delete signature");

      setSignatures(signatures.filter((sig) => sig.id !== id));
      toast.success("Signature deleted successfully");
    } catch (error) {
      console.error("Error deleting signature:", error);
      toast.error("Failed to delete signature");
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const handleSignaturePadMouseDown = () => {
    setIsDrawing(true);
  };

  const handleSignaturePadMouseUp = () => {
    setIsDrawing(false);
  };

  const handleClearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  const handleSelectSignature = (signature: Signature) => {
    setSelectedSignature(signature);
    const newAnnotation: Annotation = {
      type: "signature",
      x: 100,
      y: 100,
      data: signature.sign,
      pageNumber: pageNumber,
    };
    setAnnotations((prev) => ({
      ...prev,
      [pageNumber]: [...(prev[pageNumber] || []), newAnnotation],
    }));
    setShowSignatureList(false);
    toast.success("Signature added to document");
  };

  const handleAddClientSignaturePlaceholder = () => {
    const newAnnotation: Annotation = {
      type: "clientSignature",
      x: 100,
      y: 100,
      data: "",
      width: 200,
      height: 100,
      pageNumber: pageNumber,
      isPlaceholder: true,
      name: `Client Signature ${Object.keys(annotations).length + 1}`,
    };
    setAnnotations((prev) => ({
      ...prev,
      [pageNumber]: [...(prev[pageNumber] || []), newAnnotation],
    }));
    toast.success("Client signature placeholder added");
  };

  return (
    <div className='container mx-auto max-w-7xl p-6'>
      <div className='flex flex-col gap-8'>
        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <h1 className='text-3xl font-bold text-gray-900'>Documents</h1>
            <p className='text-sm text-gray-500'>
              Manage and annotate your documents
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <input
              type='file'
              accept='.pdf'
              onChange={handleFileUpload}
              disabled={isLoading}
              className='hidden'
              id='pdf-upload'
            />
            <Button
              onClick={() => document.getElementById("pdf-upload")?.click()}
              disabled={isLoading}
              className='bg-primary text-white transition-colors duration-200 hover:bg-primary/90'
            >
              <Plus className='mr-2 h-4 w-4' />
              Upload PDF
            </Button>
          </div>
        </div>

        <div className='grid grid-cols-12 gap-8'>
          <DocumentList
            documents={documents}
            currentDocument={currentDocument}
            isLoading={isLoading}
            setCurrentDocument={setCurrentDocument}
            setShowDeleteConfirm={setShowDeleteConfirm}
            onRefetch={fetchDocuments}
          />

          <PDFViewer
            currentDocument={currentDocument}
            pageNumber={pageNumber}
            numPages={numPages}
            setPageNumber={setPageNumber}
            setNumPages={setNumPages}
            isLoading={isLoading}
            setShowSignatureList={setShowSignatureList}
            setShowTextInput={setShowTextInput}
            handleSaveDocument={handleSaveDocument}
            handleImageUpload={handleImageUpload}
            setShowDeleteConfirm={setShowDeleteConfirm}
            pdfContainerRef={pdfContainerRef}
            annotations={annotations}
            setAnnotations={setAnnotations}
            selectedAnnotation={selectedAnnotation}
            handleAnnotationUpdate={handleAnnotationUpdate}
            handleEditAnnotation={handleEditAnnotation}
            pdfError={pdfError}
            setPdfError={setPdfError}
          />
        </div>
      </div>

      <SignaturePadModal
        show={showSignaturePad}
        setShow={setShowSignaturePad}
        signaturePadRef={signaturePadRef}
        newSignatureName={newSignatureName}
        setNewSignatureName={setNewSignatureName}
        isDrawing={isDrawing}
        setIsDrawing={setIsDrawing}
        handleSaveSignature={handleSaveSignature}
        handleClearSignature={handleClearSignature}
      />

      <SignatureListModal
        show={showSignatureList}
        setShow={setShowSignatureList}
        setShowSignaturePad={setShowSignaturePad}
        signatures={signatures}
        selectedSignature={selectedSignature}
        setSelectedSignature={setSelectedSignature}
        handleSelectSignature={handleSelectSignature}
        setShowDeleteConfirm={setShowDeleteConfirm}
      />

      <TextInputModal
        show={showTextInput}
        setShow={setShowTextInput}
        textInput={textInput}
        setTextInput={setTextInput}
        textSize={textSize}
        setTextSize={setTextSize}
        textColor={textColor}
        setTextColor={setTextColor}
        showColorPicker={showColorPicker}
        setShowColorPicker={setShowColorPicker}
        editingAnnotation={editingAnnotation}
        handleAddText={handleAddText}
        handleUpdateText={handleUpdateText}
      />

      <DeleteConfirmModal
        show={showDeleteConfirm}
        setShow={setShowDeleteConfirm}
        handleDeleteDocument={handleDeleteDocument}
        handleDeleteSignature={handleDeleteSignature}
        handleAnnotationDelete={handleAnnotationDelete}
      />

      <LoadingOverlay show={isLoading} />
    </div>
  );
}
