import { Button } from '@components/ui/button';
import { X } from 'lucide-react';
import { Document } from '../types';
import { toast } from 'sonner';

interface EditDocumentNameModalProps {
  show: boolean;
  setShow: (show: boolean) => void;
  document: Document | null;
  onSuccess: (updatedDoc: Document) => void;
}

export default function EditDocumentNameModal({
  show,
  setShow,
  document,
  onSuccess,
}: EditDocumentNameModalProps) {
  if (!show || !document) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newName = formData.get('name') as string;

    if (!newName.trim()) {
      toast.error('Document name cannot be empty');
      return;
    }

    try {
      const response = await fetch('/api/v1/organization/documents', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: document.id,
          name: newName,
        }),
      });

      if (!response.ok) throw new Error('Failed to update document name');

      const updatedDoc = await response.json();
      onSuccess(updatedDoc);
      setShow(false);
      toast.success('Document name updated successfully');
    } catch (error) {
      console.error('Error updating document name:', error);
      toast.error('Failed to update document name');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Edit Document Name</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShow(false)}
            className="p-1 h-6 w-6"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Document Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={document.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShow(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 