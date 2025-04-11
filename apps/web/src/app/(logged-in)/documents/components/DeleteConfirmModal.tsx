import { Button } from '@components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import { DeleteConfirmState } from '../types';

interface DeleteConfirmModalProps {
  show: DeleteConfirmState | null;
  setShow: (state: DeleteConfirmState | null) => void;
  handleDeleteDocument: (id: number) => void;
  handleDeleteSignature: (id: number) => void;
  handleAnnotationDelete: (index: number) => void;
}

export default function DeleteConfirmModal({
  show,
  setShow,
  handleDeleteDocument,
  handleDeleteSignature,
  handleAnnotationDelete
}: DeleteConfirmModalProps) {
  if (!show) return null;

  const getTitle = () => {
    switch (show.type) {
      case 'document':
        return 'Delete Document';
      case 'signature':
        return 'Delete Signature';
      case 'annotation':
        return 'Delete Annotation';
      default:
        return 'Delete Item';
    }
  };

  const getMessage = () => {
    switch (show.type) {
      case 'document':
        return `Are you sure you want to delete the document "${show.name}"? This action cannot be undone.`;
      case 'signature':
        return `Are you sure you want to delete the signature "${show.name}"? This action cannot be undone.`;
      case 'annotation':
        return 'Are you sure you want to delete this annotation? This action cannot be undone.';
      default:
        return 'Are you sure you want to delete this item? This action cannot be undone.';
    }
  };

  const handleConfirm = () => {
    switch (show.type) {
      case 'document':
        handleDeleteDocument(show.id);
        break;
      case 'signature':
        handleDeleteSignature(show.id);
        break;
      case 'annotation':
        handleAnnotationDelete(show.id);
        break;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">{getTitle()}</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShow(null)}
            className="hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-6">
          <p className="text-gray-600">{getMessage()}</p>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setShow(null)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
} 