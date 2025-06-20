"use client";

import { toast } from "sonner";
import { Plus, Tag as TagIcon, Edit, X, ChevronDown } from "lucide-react";
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
  useDeleteTag,
  type Tag,
} from "@service-geek/api-client";

import { Badge } from "@components/ui/badge";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";

const tagSchema = z.object({
  name: z.string().min(2, "Tag name must be at least 2 characters"),
  color: z.string(),
});

type TagFormValues = z.infer<typeof tagSchema>;

const TAG_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#6366F1",
  "#6B7280",
  "#F97316",
  "#14B8A6",
];

interface TagsManagmentProps {
  initialTagType?: "PROJECT" | "IMAGE";
}

export default function TagsManagment({ initialTagType }: TagsManagmentProps) {
  const [selectedType, setSelectedType] = useState<"PROJECT" | "IMAGE">(
    initialTagType || "PROJECT"
  );
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  //   const [editColorPickerOpen, setEditColorPickerOpen] = useState(false);
  const [inputWidth, setInputWidth] = useState(80);
  const hiddenSpanRef = useRef<HTMLSpanElement>(null);

  const { data: tags = [], isLoading: fetching } = useGetTags({
    type: selectedType,
  });
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();
  const [editTag, setEditTag] = useState<string | null>(null);

  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: "",
      color: TAG_COLORS[0],
    },
  });

  const filteredTags = tags.filter((tag) => tag.type === selectedType);

  // Function to calculate input width based on text
  const calculateInputWidth = (text: string) => {
    if (hiddenSpanRef.current) {
      hiddenSpanRef.current.textContent = text || " ";
      const width = hiddenSpanRef.current.offsetWidth;
      return Math.max(width + 20, 80); // Add padding and minimum width
    }
    return 80;
  };

  const handleCreateTag = async (data: TagFormValues) => {
    try {
      setIsAdding(true);
      await createTag.mutateAsync({
        name: data.name,
        type: selectedType,
        color: selectedType === "PROJECT" ? data.color : "#6B7280", // Default gray for image tags
      });
      toast.success(
        selectedType === "PROJECT"
          ? "Label created successfully"
          : "Tag created successfully"
      );
      form.reset({ name: "", color: TAG_COLORS[0] });
    } catch (error) {
      toast.error(
        selectedType === "PROJECT"
          ? "Failed to create label"
          : "Failed to create tag"
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateTag = async (
    tagId: string,
    newName: string,
    newColor: string
  ) => {
    try {
      await updateTag.mutateAsync({
        id: tagId,
        data: {
          name: newName,
          color: selectedType === "PROJECT" ? newColor : "#6B7280", // Keep gray for image tags
        },
      });
      toast.success(
        selectedType === "PROJECT"
          ? "Label updated successfully"
          : "Tag updated successfully"
      );
      setEditingTagId(null);
    } catch (error) {
      toast.error(
        selectedType === "PROJECT"
          ? "Failed to update label"
          : "Failed to update tag"
      );
    }
  };

  const handleDeleteTag = (tagId: string) => {
    deleteTag.mutate(tagId, {
      onSuccess: () => {
        toast.success(
          selectedType === "PROJECT"
            ? "Label deleted successfully"
            : "Tag deleted successfully"
        );
      },
      onError: () => {
        toast.error(
          selectedType === "PROJECT"
            ? "Failed to delete label"
            : "Failed to delete tag"
        );
      },
    });
  };

  const startEditing = (tag: Tag) => {
    setEditingTagId(tag.id);
    setEditTag(tag.name);
    setInputWidth(calculateInputWidth(tag.name));
  };

  const cancelEditing = () => {
    setEditingTagId(null);
    setEditTag(null);
  };

  // Update input width when editTag changes
  useEffect(() => {
    if (editTag !== null) {
      setInputWidth(calculateInputWidth(editTag));
    }
  }, [editTag]);

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
              onClick={() => setSelectedType(tab.value as any)}
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
      <div className='mb-6'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreateTag)}
            className='flex items-center gap-3'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='flex-1'>
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
                    <Popover
                      open={colorPickerOpen}
                      onOpenChange={setColorPickerOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          size='sm'
                          className='h-9 w-9 p-0'
                          style={{ backgroundColor: field.value }}
                        >
                          <ChevronDown className='h-3 w-3 text-white drop-shadow-sm' />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-48 p-3' align='end'>
                        <div className='grid grid-cols-5 gap-2'>
                          {TAG_COLORS.map((color) => (
                            <button
                              key={color}
                              type='button'
                              onClick={() => {
                                field.onChange(color);
                                setColorPickerOpen(false);
                              }}
                              className={`h-8 w-8 rounded-full border-2 transition-all hover:scale-110 ${
                                field.value === color
                                  ? "border-gray-900 ring-2 ring-gray-300"
                                  : "border-gray-300"
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type='submit' size='sm' disabled={isAdding} className='h-9'>
              <Plus className='h-4 w-4' />
            </Button>
          </form>
        </Form>
      </div>

      {/* Tags Display */}
      <div className='flex flex-wrap gap-2'>
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
              {editingTagId === tag.id ? (
                <div className='flex items-center gap-2'>
                  <Input
                    value={editTag || ""}
                    onChange={(e: any) => setEditTag(e.target.value)}
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
                    {/* Only show color picker for project tags */}
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
      </div>
    </div>
  );
}
