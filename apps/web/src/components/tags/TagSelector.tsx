"use client";

import { useState } from "react";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { LoadingPlaceholder } from "@components/ui/spinner";
import { Tag as TagIcon, Plus } from "lucide-react";
import { useGetTags } from "@service-geek/api-client";
import TagsModal from "./TagsModal";

interface TagSelectorProps {
  tagType: "PROJECT" | "IMAGE";
  onAssignTags: (tagNames: string[]) => void;
}

export default function TagSelector({
  tagType,
  onAssignTags,
}: TagSelectorProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isManageTagsOpen, setIsManageTagsOpen] = useState(false);

  const { data: tags = [], isLoading } = useGetTags({ type: tagType });

  const handleTagToggle = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((tag) => tag !== tagName)
        : [...prev, tagName]
    );
  };

  const handleAssign = () => {
    if (selectedTags.length > 0) {
      onAssignTags(selectedTags);
    }
  };

  const handleManageTags = () => {
    setIsManageTagsOpen(true);
  };

  if (isLoading) {
    return <LoadingPlaceholder />;
  }

  return (
    <div className='space-y-6'>
      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className='space-y-3'>
          <h3 className='text-sm font-medium text-gray-900'>Selected Tags:</h3>
          <div className='flex flex-wrap gap-2'>
            {selectedTags.map((tagName) => {
              const tag = tags.find((t) => t.name === tagName);
              return (
                <Badge
                  key={tagName}
                  variant='secondary'
                  className='cursor-pointer'
                  style={
                    tagType === "PROJECT" && tag?.color
                      ? {
                          backgroundColor: `${tag.color}15`,
                          borderColor: tag.color,
                          color: tag.color,
                        }
                      : {}
                  }
                  onClick={() => handleTagToggle(tagName)}
                >
                  {tagName}
                  <span className='ml-1 text-xs'>×</span>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Tags */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <h3 className='text-sm font-medium text-gray-900'>
            Available {tagType === "PROJECT" ? "Labels" : "Tags"}:
          </h3>
          <Button
            variant='outline'
            size='sm'
            onClick={handleManageTags}
            className='flex items-center gap-2'
          >
            <Plus className='h-4 w-4' />
            Manage {tagType === "PROJECT" ? "Labels" : "Tags"}
          </Button>
        </div>

        {tags.length === 0 ? (
          <div className='py-8 text-center text-muted-foreground'>
            <TagIcon className='mx-auto mb-2 h-8 w-8 opacity-50' />
            <p className='text-sm'>
              No {tagType === "PROJECT" ? "labels" : "tags"} found
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={handleManageTags}
              className='mt-2'
            >
              Create {tagType === "PROJECT" ? "Label" : "Tag"}
            </Button>
          </div>
        ) : (
          <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4'>
            {tags.map((tag) => (
              <Button
                key={tag.id}
                variant={
                  selectedTags.includes(tag.name) ? "default" : "outline"
                }
                size='sm'
                className='justify-start'
                onClick={() => handleTagToggle(tag.name)}
                style={
                  tagType === "PROJECT" && tag.color
                    ? selectedTags.includes(tag.name)
                      ? {
                          backgroundColor: tag.color,
                          borderColor: tag.color,
                          color: "white",
                        }
                      : {
                          backgroundColor: `${tag.color}15`,
                          borderColor: tag.color,
                          color: tag.color,
                        }
                    : {}
                }
              >
                {tag.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className='flex justify-end gap-3 border-t pt-4'>
        <Button
          variant='outline'
          onClick={() => setSelectedTags([])}
          disabled={selectedTags.length === 0}
        >
          Clear Selection
        </Button>
        <Button onClick={handleAssign} disabled={selectedTags.length === 0}>
          Assign {selectedTags.length > 0 ? `(${selectedTags.length})` : ""}{" "}
          {tagType === "PROJECT" ? "Labels" : "Tags"}
        </Button>
      </div>

      {/* Manage Tags Modal */}
      <TagsModal
        tagType={tagType}
        open={isManageTagsOpen}
        onOpenChange={setIsManageTagsOpen}
        isAssignMode={false}
      />
    </div>
  );
}
