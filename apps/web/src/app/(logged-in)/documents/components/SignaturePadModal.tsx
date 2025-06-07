import { Button } from '@components/ui/button';
import { X, Save, RotateCcw } from 'lucide-react';
import SignaturePad from 'react-signature-canvas';

interface SignaturePadModalProps {
  show: boolean;
  setShow: (show: boolean) => void;
  signaturePadRef: React.RefObject<SignaturePad>;
  newSignatureName: string;
  setNewSignatureName?: (name: string) => void;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  handleSaveSignature: () => void;
  handleClearSignature: () => void;
}

export default function SignaturePadModal({
  show,
  setShow,
  signaturePadRef,
  newSignatureName,
  setNewSignatureName,
  isDrawing,
  setIsDrawing,
  handleSaveSignature,
  handleClearSignature
}: SignaturePadModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Create New Signature</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShow(false);
              setNewSignatureName && setNewSignatureName('');
              signaturePadRef.current?.clear();
            }}
            className="hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
         { setNewSignatureName && <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Signature Name
            </label>
            <input
              type="text"
              value={newSignatureName}
              onChange={(e) => setNewSignatureName && setNewSignatureName(e.target.value)}
              placeholder="Enter a name for your signature"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
            />
          </div>}
          <div className="relative">
            <div className="absolute inset-0 border-2 border-dashed border-gray-300 rounded-lg pointer-events-none" />
            <SignaturePad
              ref={signaturePadRef}
              canvasProps={{
                className: 'w-full h-48 bg-white rounded-lg',
              }}
              onBegin={() => setIsDrawing(true)}
              onEnd={() => setIsDrawing(false)}
            />
            {!isDrawing && !signaturePadRef.current?.isEmpty() && (
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearSignature}
                  className="bg-white/80 backdrop-blur-sm hover:bg-white"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="mt-4 text-sm text-gray-500">
            {isDrawing ? (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Drawing...
              </span>
            ) : signaturePadRef.current?.isEmpty() ? (
              "Draw your signature above"
            ) : (
              "Signature ready to save"
            )}
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShow(false);
              setNewSignatureName && setNewSignatureName('');
              signaturePadRef.current?.clear();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveSignature}
            disabled={ signaturePadRef.current?.isEmpty()}
            className="bg-primary text-white hover:bg-primary/90 transition-colors duration-200"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Signature
          </Button>
        </div>
      </div>
    </div>
  );
} 