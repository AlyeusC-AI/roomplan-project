"use client";

import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@components/ui/form";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { LoadingPlaceholder } from "@components/ui/spinner";
import {
  useCreateTag,
  useGetTags,
  useUpdateTag,
  type Tag,
} from "@service-geek/api-client";

import { Badge } from "@components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
} from "@components/ui/alert-dialog";

const tagSchema = z.object({
  name: z.string().min(2, "Tag name must be at least 2 characters"),
  color: z.string(),
});

type TagFormValues = z.infer<typeof tagSchema>;

// const TAG_COLORS = [
//   "#3B82F6",
//   "#10B981",
//   "#F59E0B",
//   "#EF4444",
//   "#8B5CF6",
//   "#EC4899",
//   "#6366F1",
//   "#6B7280",
//   "#F97316",
//   "#14B8A6",
// ];

const TAG_COLORS = [
  {
    name: "Green",
    color: "#10B981",
  },
  {
    name: "Blue",
    color: "#3B82F6",
  },
  {
    name: "Purple",
    color: "#8B5CF6",
  },
  {
    name: "Navy",
    color: "#1E3A8A",
  },
  {
    name: "Yellow",
    color: "#F59E0B",
  },
  {
    name: "Orange",
    color: "#F97316",
  },
  {
    name: "Red",
    color: "#EF4444",
  },
  {
    name: "Light Gray",
    color: "#828c95"
  },
  {
    name: "Dark Gray",
    color: "#374151",
  },
];

interface TagsManagmentProps {
  initialTagType?: "PROJECT" | "IMAGE";
  tagToEdit?: Tag | null;
  onClose?: () => void;
}

export default function TagsManagment({
  initialTagType,
  tagToEdit,
  onClose,
}: TagsManagmentProps) {
  // console.log("tagToEdit", tagToEdit);
  const [selectedType, setSelectedType] = useState<"PROJECT" | "IMAGE">(
    initialTagType || "PROJECT"
  );
  const [isAdding, setIsAdding] = useState(false);
  const hiddenSpanRef = useRef<HTMLSpanElement>(null);

  const { isLoading: fetching } = useGetTags({
    type: selectedType,
  });
  const createTag = useCreateTag();
  // Removed unused setEditTag state

  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: tagToEdit?.name || "",
      color: tagToEdit?.color || TAG_COLORS[0].color,
    },
    values: tagToEdit
      ? { name: tagToEdit.name, color: tagToEdit.color ?? TAG_COLORS[0].color }
      : undefined,
  });

  // If editing, use updateTag
  const updateTag = useUpdateTag();

  const handleCreateOrUpdateTag = async (data: TagFormValues) => {
    try {
      setIsAdding(true);
      if (tagToEdit) {
        // Update mode
        await updateTag.mutateAsync({
          id: tagToEdit.id,
          data: {
            name: data.name,
            color: selectedType === "PROJECT" ? data.color : "#6B7280",
          },
        });
        toast.success(
          selectedType === "PROJECT"
            ? "Label updated successfully"
            : "Tag updated successfully"
        );
      } else {
        // Create mode
        await createTag.mutateAsync({
          name: data.name,
          type: selectedType,
          color: selectedType === "PROJECT" ? data.color : "#6B7280",
        });
        toast.success(
          selectedType === "PROJECT"
            ? "Label created successfully"
            : "Tag created successfully"
        );
        form.reset({ name: "", color: TAG_COLORS[0].color });
      }
      if (onClose) onClose();
    } catch {
      toast.error(
        selectedType === "PROJECT"
          ? tagToEdit
            ? "Failed to update label"
            : "Failed to create label"
          : tagToEdit
            ? "Failed to update tag"
            : "Failed to create tag"
      );
    } finally {
      setIsAdding(false);
    }
  };

  // Removed unused startEditing and cancelEditing

  // Update input width when editTag changes
  useEffect(() => {
    // No-op: input width calculation removed
  }, []);

  if (fetching) {
    return <LoadingPlaceholder />;
  }

  return (
    <div className='space-y-6'>
      {/* Hidden span for measuring text width */}
      <span
        ref={hiddenSpanRef}
        className='invisible absolute left-[-9999px] top-[-9999px] text-sm font-medium'
        style={{ fontFamily: "inherit" }}
      />

      {/* Type Filter Tabs */}
      {!initialTagType && (
        <div className='mb-6 flex space-x-1 rounded-lg bg-muted p-1'>
          {[
            { value: "PROJECT", label: "Labels" },
            { value: "IMAGE", label: "Tags" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedType(tab.value as "PROJECT" | "IMAGE")}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                selectedType === tab.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Add New Tag - Compact */}
      <div className=''>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreateOrUpdateTag)}
            className='space-y-3'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='flex-1'>
                  <label className='mb-1 block text-sm font-medium'>
                    {selectedType === "PROJECT" ? "Label name" : "Tag name"}
                  </label>
                  <FormControl>
                    <Input
                      placeholder={
                        selectedType === "PROJECT"
                          ? "Label name..."
                          : "Tag name..."
                      }
                      {...field}
                      className='h-9'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Only show color picker for project tags */}
            {selectedType === "PROJECT" && (
              <FormField
                control={form.control}
                name='color'
                render={({ field }) => (
                  <FormItem>
                    <label className='mb-1 block text-sm font-medium'>
                      Color
                    </label>
                    <div className='flex flex-wrap gap-2'>
                      {TAG_COLORS.map((color) => (
                        <label
                          key={color.color}
                          className='flex cursor-pointer items-center gap-1 text-white'
                          
                        >
                          <input
                            type='radio'
                            name='color'
                            value={color.color}
                            checked={field.value === color.color}
                            onChange={() => field.onChange(color.color)}
                            className='h-4 w-4 border-gray-300 accent-black focus:ring-2 focus:ring-black focus:ring-offset-2'
                          />
                          <span
                            className='inline-block rounded-lg px-2'
                            style={{ backgroundColor: color.color }}
                          >

                          <span className='text-xs'>{color.name}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className='flex gap-2 pt-4'>
              <Button
                type='submit'
                size='sm'
                disabled={isAdding}
                className='h-9'
              >
                Save
              </Button>
              <Button
                type='button'
                size='sm'
                variant='outline'
                className='h-9'
                onClick={() => {
                  if (onClose) onClose();
                  else form.reset({ name: "", color: TAG_COLORS[0].color });
                }}
                disabled={isAdding}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Tags Display */}
      {/* <div className='flex flex-wrap gap-2'>
        {filteredTags.length === 0 ? (
          <div className='w-full py-8 text-center text-muted-foreground'>
            <TagIcon className='mx-auto mb-2 h-8 w-8 opacity-50' />
            <p className='text-sm'>
              No {selectedType === "PROJECT" ? "labels" : "tags"} found
            </p>
          </div>
        ) : (
          filteredTags.map((tag) => (
            <div
              key={tag.id}
              className={`group relative inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-all hover:shadow-sm ${
                selectedType === "IMAGE"
                  ? "border-gray-300 bg-gray-100 text-gray-700"
                  : ""
              }`}
              style={
                selectedType === "PROJECT"
                  ? {
                      backgroundColor: `${tag.color}15`,
                      borderColor: tag.color,
                      color: tag.color,
                    }
                  : {}
              }
            >
              {editTag === tag.id ? (
                <div className='flex items-center gap-2'>
                  <Input
                    value={editTag || ""}
                    // onChange handler removed since setEditTag is not used
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUpdateTag(tag.id, editTag || "", tag.color || "");
                      } else if (e.key === "Escape") {
                        cancelEditing();
                      }
                    }}
                    onBlur={(e) => {
                      handleUpdateTag(tag.id, editTag || "", tag.color || "");
                    }}
                    style={{ width: `${inputWidth}px` }}
                    className='h-6 border-none bg-transparent p-0 text-sm focus-visible:ring-0'
                    autoFocus
                  />
                </div>
              ) : (
                <div className='flex items-center gap-1'>
                  <span
                    onClick={() => {
                      startEditing(tag);
                    }}
                    className='cursor-pointer font-medium'
                  >
                    {tag.name}
                  </span>
                  <div className='flex items-center gap-1'>
                    
                    {selectedType === "PROJECT" && (
                      <Popover
                      // open={editColorPickerOpen}
                      // onOpenChange={setEditColorPickerOpen}
                      >
                        <PopoverTrigger asChild>
                          <button
                            type='button'
                            className='h-4 w-4 rounded border'
                            // onClick={(e) => {
                            //   e.stopPropagation();
                            //   setEditColorPickerOpen(true);
                            // }}
                            style={{ backgroundColor: tag.color }}
                          />
                        </PopoverTrigger>
                        <PopoverContent className='w-40 p-2' align='end'>
                          <div className='grid grid-cols-5 gap-1'>
                            {TAG_COLORS.map((color) => (
                              <button
                                key={color}
                                type='button'
                                onClick={() => {
                                  handleUpdateTag(tag.id, tag.name, color);
                                  //   setEditColorPickerOpen(false);
                                }}
                                className={`h-6 w-6 rounded-full border ${
                                  tag.color === color
                                    ? "border-gray-900 ring-1 ring-gray-300"
                                    : "border-gray-300"
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className='rounded-full p-0.5 hover:bg-black/10'>
                          <X className='h-3 w-3' />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete{" "}
                            {selectedType === "PROJECT" ? "Label" : "Tag"}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the{" "}
                            {selectedType === "PROJECT" ? "label" : "tag"} "
                            {tag.name}
                            "? This action cannot be undone.
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
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div> */}
    </div>
  );
}
