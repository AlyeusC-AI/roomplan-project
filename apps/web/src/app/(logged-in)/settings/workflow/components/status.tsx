import { useEffect, useState } from "react";
import ColorPicker, { STATUS_COLORS } from "./color-picker";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { useDebounce } from "@hooks/use-debounce";
import {
  useUpdateProjectStatus,
  useDeleteProjectStatus,
} from "@service-geek/api-client";
import type { ProjectStatus } from "@service-geek/api-client";
import { Button } from "@components/ui/button";
import { Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@components/ui/alert-dialog";

const WorkflowStatus = ({ label }: { label: ProjectStatus }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef,
  } = useSortable({ id: label.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [newLabel, setNewLabel] = useState<string>(label.label);
  const [newColor, setNewColor] = useState<string>(label.color || "");
  const [newDescription, setNewDescription] = useState<string>(
    label.description || ""
  );

  const debouncedLabel = useDebounce(newLabel, 1000);
  const debouncedDescription = useDebounce(newDescription, 1000);
  const updateStatus = useUpdateProjectStatus();
  const deleteStatus = useDeleteProjectStatus();

  useEffect(() => {
    if (
      debouncedLabel !== label.label ||
      debouncedDescription !== label.description ||
      newColor !== label.color
    ) {
      updateStatus.mutate(
        {
          id: label.id,
          data: {
            label: debouncedLabel,
            description: debouncedDescription,
            color: newColor,
          },
        },
        {
          onSuccess: () => {
            toast.success("Status updated successfully");
          },
          onError: () => {
            toast.error("Failed to update status");
          },
        }
      );
    }
  }, [debouncedLabel, debouncedDescription, newColor, label.id]);

  const handleDelete = () => {
    deleteStatus.mutate(label.id, {
      onSuccess: () => {
        toast.success("Status deleted successfully");
      },
      onError: () => {
        toast.error("Failed to delete status");
      },
    });
  };

  const selectedColor = STATUS_COLORS.find((s) => s.name === newColor);

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className='isolate flex -space-y-px rounded-md shadow-sm'>
        <div
          className={clsx(
            "flex items-center justify-center",
            "overflow-hidden rounded-l-md ring-1 ring-gray-300 hover:bg-gray-100",
            "cursor-grab active:cursor-grabbing"
          )}
          ref={setActivatorNodeRef}
          {...listeners}
        >
          <GripVertical className='h-5 w-5 text-gray-400' />
        </div>
        <div className='flex w-full flex-col'>
          <div className='relative rounded-md rounded-b-none rounded-tl-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-blue-600'>
            <label
              htmlFor='name'
              className='block text-xs font-medium text-foreground'
            >
              Label Name
            </label>
            <input
              type='text'
              value={newLabel}
              className='block w-full border-0 bg-transparent px-0 py-2 text-lg font-bold text-foreground placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6'
              placeholder='Label Name'
              onChange={(e) => setNewLabel(e.target.value)}
            />
          </div>
          <div className='relative rounded-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-blue-600'>
            <label
              htmlFor='job-title'
              className='block text-xs font-medium text-foreground'
            >
              Label Description
            </label>
            <input
              type='text'
              value={newDescription}
              className='block w-full border-0 bg-transparent px-0 py-2 text-foreground placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6'
              placeholder='Label Description'
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>
          <div className='relative rounded-md rounded-t-none rounded-bl-none px-3 pb-4 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-blue-600'>
            <div className='flex items-center justify-between'>
              <ColorPicker newColor={newColor} setNewColor={setNewColor} />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 text-destructive hover:text-destructive/90'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Status</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this status? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowStatus;
