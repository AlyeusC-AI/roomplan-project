import { useState } from "react";
import { format, formatDistance } from "date-fns";
import { Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@components/ui/button";
import { LoadingSpinner, LoadingPlaceholder } from "@components/ui/spinner";
import { Textarea } from "@components/ui/textarea";
import ImageGallery from "./ImageGallery";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@components/ui/alert-dialog";
import {
  Note as NoteType,
  Room,
  useGetNotes,
  useUpdateNote,
  useDeleteNote,
} from "@service-geek/api-client";
import {
  TableProvider,
  TableHeader,
  TableHeaderGroup,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/roadmap-ui/table";
import type { Row } from "@tanstack/react-table";

const Notes = ({ room }: { room: Room }) => {
  const { data: notes, isLoading } = useGetNotes(room.id as string);
  const { mutate: updateNote } = useUpdateNote();
  const { mutate: deleteNote } = useDeleteNote();
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Open dialog for editing
  const openEditDialog = (note: NoteType) => {
    setEditingNoteId(note.id);
    setEditValue(note.body);
  };

  // Save note from dialog
  const handleSave = async () => {
    if (!editingNoteId) return;
    setSaving(true);
    try {
      updateNote({ id: editingNoteId, data: { body: editValue } });
      toast.success("Note updated");
      setEditingNoteId(null);
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingNoteId(null);
  };

  // Delete note
  const onDeleteNote = async (id: string) => {
    setDeleting((prev) => ({ ...prev, [id]: true }));
    try {
      deleteNote(id);
      toast.success("Note deleted");
    } finally {
      setDeleting((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Table columns
  const columns = [
    {
      accessorKey: "createdAt",
      header: () => "Created",
      cell: ({ row }: { row: Row<NoteType> }) =>
        format(new Date(row.original.createdAt), "PPp"),
    },
    {
      accessorKey: "body",
      header: () => "Note",
      cell: ({ row }: { row: Row<NoteType> }) => {
        const note = row.original as NoteType;
        return <div className='whitespace-pre-line'>{note.body}</div>;
      },
    },
    {
      accessorKey: "updatedAt",
      header: () => "Last Updated",
      cell: ({ row }: { row: Row<NoteType> }) =>
        row.original.updatedAt
          ? `Last updated ${formatDistance(new Date(row.original.updatedAt), Date.now(), { addSuffix: true })}`
          : null,
    },
    {
      accessorKey: "images",
      header: () => "Images",
      cell: ({ row }: { row: Row<NoteType> }) => {
        const note = row.original as NoteType;
        return note.images && note.images.length > 0 ? (
          <ImageGallery images={note.images} />
        ) : null;
      },
    },
    {
      id: "actions",
      header: () => "Actions",
      cell: ({ row }: { row: Row<NoteType> }) => {
        const note = row.original as NoteType;
        const isDeleting = deleting[note.id] || false;
        return (
          <div className='flex items-center gap-2'>
            <Button variant='outline' onClick={() => openEditDialog(note)}>
              <Pencil className='h-4' />
            </Button>
            <Button
              variant='destructive'
              onClick={() => setConfirmDeleteId(note.id)}
              disabled={isDeleting}
            >
              {isDeleting ? <LoadingSpinner /> : <Trash className='h-4' />}
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoading) return <LoadingPlaceholder />;
  if (!notes || notes.length === 0)
    return (
      <div className='ml-2 mt-4 flex items-center justify-start'>
        <div className='max-w-[35%] border-l-2 border-l-gray-400 px-2'>
          <h5 className='text-lg font-semibold'>No Notes</h5>
          <p className='text-gray-500'>
            Click &quot;Add Note&quot; to add notes to this room
          </p>
        </div>
      </div>
    );

  return (
    <>
      <TableProvider columns={columns} data={notes} className='mt-4'>
        <TableHeader>
          {({ headerGroup }) => (
            <TableHeaderGroup headerGroup={headerGroup}>
              {({ header }) => <TableHead header={header} />}
            </TableHeaderGroup>
          )}
        </TableHeader>
        <TableBody>
          {({ row }) => (
            <TableRow row={row}>
              {({ cell }) => <TableCell cell={cell} />}
            </TableRow>
          )}
        </TableBody>
      </TableProvider>
      <Dialog open={!!editingNoteId} onOpenChange={handleCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Update the note and click Save to apply changes.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className='mt-2'
            rows={6}
            autoFocus
          />
          <DialogFooter>
            <Button onClick={handleSave} disabled={saving || !editValue.trim()}>
              {saving ? <LoadingSpinner /> : "Save"}
            </Button>
            <DialogClose asChild>
              <Button variant='outline' type='button' disabled={saving}>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!confirmDeleteId}
        onOpenChange={() => setConfirmDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>

            <Button
              type='button'
              disabled={deleting[confirmDeleteId ?? ""]}
              onClick={() => setConfirmDeleteId(null)}
            >
              Cancel
            </Button>

            <Button
              variant='destructive'
              onClick={async () => {
                if (confirmDeleteId) {
                  await onDeleteNote(confirmDeleteId);
                  setConfirmDeleteId(null);
                }
              }}
              disabled={deleting[confirmDeleteId ?? ""]}
            >
              {deleting[confirmDeleteId ?? ""] ? (
                <LoadingSpinner />
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Notes;
