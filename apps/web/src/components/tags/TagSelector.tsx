"use client";

import { useState } from "react";
import { Button } from "@components/ui/button";
import { LoadingPlaceholder } from "@components/ui/spinner";
import {
  EllipsisVertical,
  Plus,
  Tag as TagIcon,
  X,
  Pencil,
  Trash,
  Ellipsis,
} from "lucide-react";
import { useDeleteTag, useGetTags } from "@service-geek/api-client";
import { Checkbox } from "@components/ui/checkbox";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@components/ui/popover";
import {
  AlertDialog,
  AlertDialogFooter,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction,
} from "@components/ui/alert-dialog";
import { toast } from "sonner";

interface TagSelectorProps {
  tagType: "PROJECT" | "IMAGE";
  onAssignTags: (tagNames: string[]) => void;
  currentTags?: Array<{ id: string; name: string; color?: string }>;
  setIsManageTagsOpen: (open: boolean) => void;
  setSelectedTagEdit: (tag: any) => void;
}

export default function TagSelector({
  tagType,
  onAssignTags,
  currentTags = [],
  setIsManageTagsOpen,
  setSelectedTagEdit,
}: TagSelectorProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(
    currentTags.map((tag) => tag.name)
  );

  const { data: tags = [], isLoading } = useGetTags({ type: tagType });
  const deleteTag = useDeleteTag();

  const handleTagToggle = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((tag) => tag !== tagName)
        : [...prev, tagName]
    );
  };

  const handleAssign = () => {
    onAssignTags(selectedTags);
  };

  if (isLoading) {
    return <LoadingPlaceholder />;
  }

  const handleDeleteTag = (tagId: string) => {
    deleteTag.mutate(tagId, {
      onSuccess: () => {
        toast.success(
          tagType === "PROJECT"
            ? "Label deleted successfully"
            : "Tag deleted successfully"
        );
      },
      onError: () => {
        toast.error(
          tagType === "PROJECT"
            ? "Failed to delete label"
            : "Failed to delete tag"
        );
      },
    });
  };

  return (
    <div className='space-y-6'>
      {/* Tag Checkbox Group */}
      <div >
        {/* <h3 className='text-sm font-medium text-gray-900'>
          {tagType === "PROJECT" ? "Labels" : "Tags"}
        </h3> */}
        {tags.length === 0 ? (
          <div className='py-8 text-center text-muted-foreground'>
            <TagIcon className='mx-auto mb-2 h-8 w-8 opacity-50' />
            <p className='text-sm'>
              No {tagType === "PROJECT" ? "labels" : "tags"} found
            </p>
            <p className='text-xs text-muted-foreground'>
              Create tags in the settings to assign them here
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-y-4 gap-x-12 py-2 sm:grid-cols-2'>
            {tags.map((tag) => {
              const isChecked = selectedTags.includes(tag.name);
              return (
                <div key={tag.id} className='flex items-center justify-between'>
                  <label
                    className='flex cursor-pointer items-center gap-3'
                    style={{
                      borderColor:
                        tagType === "PROJECT" && tag.color
                          ? tag.color
                          : undefined,
                    }}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => handleTagToggle(tag.name)}
                      style={{
                        accentColor:
                          tagType === "PROJECT" && tag.color
                            ? tag.color
                            : undefined,
                      }}
                    />
                    <div className='flex items-center gap-3'>
                      {tagType === "PROJECT" && <span
                        className='inline-block size-6 rounded-full border'
                        style={{
                          backgroundColor:
                            tagType === "PROJECT" && tag.color
                              ? tag.color
                              : undefined,
                          borderColor:
                            tagType === "PROJECT" && tag.color
                              ? tag.color
                              : undefined,
                        }}
                      />}
                      <span className='text-sm'>{tag.name}</span>
                    </div>
                  </label>
                  <Popover>
                    <PopoverTrigger>
                      <Ellipsis />
                    </PopoverTrigger>
                    <PopoverContent className='w-36 p-2' align='end'>
                      <button
                        className='flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-muted'
                        onClick={() => {
                          setSelectedTagEdit(tag);
                          setIsManageTagsOpen(true);
                        }}
                      >
                        <Pencil className='h-4 w-4' />
                        Edit
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className='flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-muted'>
                            <Trash className='h-4 w-4' />
                            Delete
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete {tagType === "PROJECT" ? "Label" : "Tag"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {`Are you sure you want to delete the ${tagType === "PROJECT" ? "label" : "tag"} "${tag.name}"? This action cannot be undone.`}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTag(tag.id)}
                              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </PopoverContent>
                  </Popover>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className='flex justify-between gap-3 border-t pt-4'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => {
            setIsManageTagsOpen(true);
            setSelectedTagEdit(null);
          }}
          className='flex items-center gap-2'
        >
          <Plus className='h-4 w-4' />
          Manage {tagType === "PROJECT" ? "Labels" : "Tags"}
        </Button>
        <div className='flex justify-end gap-3'>
          <Button
            variant='outline'
            onClick={() => setSelectedTags(currentTags.map((tag) => tag.name))}
            disabled={
              selectedTags.length === currentTags.length &&
              currentTags.every((tag) => selectedTags.includes(tag.name))
            }
          >
            Reset
          </Button>
          <Button
            onClick={handleAssign}
            disabled={selectedTags.length === 0 && currentTags.length === 0}
          >
            Save {tagType === "PROJECT" ? "Labels" : "Tags"}
          </Button>
        </div>
      </div>
    </div>
  );
}
