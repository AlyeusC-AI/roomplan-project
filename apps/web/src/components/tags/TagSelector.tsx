"use client";

import { useState } from "react";
import { Button } from "@components/ui/button";
import { LoadingPlaceholder } from "@components/ui/spinner";
import { Plus, Tag as TagIcon } from "lucide-react";
import { useGetTags } from "@service-geek/api-client";
import { Checkbox } from "@components/ui/checkbox";

interface TagSelectorProps {
  tagType: "PROJECT" | "IMAGE";
  onAssignTags: (tagNames: string[]) => void;
  currentTags?: Array<{ id: string; name: string; color?: string }>;
  setIsManageTagsOpen: (open: boolean) => void;
}

export default function TagSelector({
  tagType,
  onAssignTags,
  currentTags = [],
  setIsManageTagsOpen,
}: TagSelectorProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(
    currentTags.map((tag) => tag.name)
  );

  const { data: tags = [], isLoading } = useGetTags({ type: tagType });

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
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2  py-2'>
            {tags.map((tag) => {
              const isChecked = selectedTags.includes(tag.name);
              return (
                <label
                  key={tag.id}
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
                  <div className="flex items-center gap-3">

                    <span
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
                    />
                    <span className='text-sm'>{tag.name}</span>
                  </div>
                </label>
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
          onClick={() => setIsManageTagsOpen(true)}
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
