import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  show: boolean;
}

export default function LoadingOverlay({ show }: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
} 