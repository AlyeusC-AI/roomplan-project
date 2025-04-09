import { Button } from '@components/ui/button';
import { Plus, X, Trash2, Check, PenLine } from 'lucide-react';
import { Signature, DeleteConfirmState } from '../types';

interface SignatureListModalProps {
  show: boolean;
  setShow: (show: boolean) => void;
  setShowSignaturePad: (show: boolean) => void;
  signatures: Signature[];
  selectedSignature: Signature | null;
  setSelectedSignature: (signature: Signature | null) => void;
  handleSelectSignature: (signature: Signature) => void;
  setShowDeleteConfirm: (state: DeleteConfirmState | null) => void;
}

export default function SignatureListModal({
  show,
  setShow,
  setShowSignaturePad,
  signatures,
  selectedSignature,
  setSelectedSignature,
  handleSelectSignature,
  setShowDeleteConfirm
}: SignatureListModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">Your Signatures</h3>
            <span className="text-sm text-gray-500">({signatures.length} total)</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShow(false);
                setShowSignaturePad(true);
              }}
              className="group"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShow(false)}
              className="hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {signatures.length === 0 ? (
            <div className="text-center py-12">
              <PenLine className="w-12 h-12 mx-auto text-gray-400" />
              <h4 className="mt-4 text-lg font-medium text-gray-900">No signatures yet</h4>
              <p className="mt-2 text-sm text-gray-500">
                Create your first signature to get started
              </p>
              <Button
                className="mt-4 group"
                onClick={() => {
                  setShow(false);
                  setShowSignaturePad(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Signature
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {signatures.map((signature) => (
                <div
                  key={signature.id}
                  className={`relative group border rounded-lg p-4 transition-all duration-200 ${
                    selectedSignature?.id === signature.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/20'
                  }`}
                >
                  <div 
                    className="aspect-[4/3] bg-white rounded-lg border flex items-center justify-center overflow-hidden cursor-pointer"
                    onClick={() => handleSelectSignature(signature)}
                  >
                    <img
                      src={signature.sign}
                      alt={signature.name}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {signature.name}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm({
                            type: 'signature',
                            id: signature.id,
                            name: signature.name
                          });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {selectedSignature?.id === signature.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Click on a signature to add it to your document
          </p>
          <Button
            variant="outline"
            onClick={() => setShow(false)}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
} 