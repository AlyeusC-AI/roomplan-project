"use client";

import { useState } from "react";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { LoadingPlaceholder } from "@components/ui/spinner";
import { Tag as TagIcon, Check } from "lucide-react";
import { useGetTags } from "@service-geek/api-client";

interface TagSelectorProps {
  tagType: "PROJECT" | "IMAGE";
  onAssignTags: (tagNames: string[]) => void;
  currentTags?: Array<{ id: string; name: string; color?: string }>;
}

export default function TagSelector({
  tagType,
  onAssignTags,
  currentTags = [],
}: TagSelectorProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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

  // Get current tag names for easy comparison
  const currentTagNames = currentTags.map((tag) => tag.name);

  if (isLoading) {
    return <LoadingPlaceholder />;
  }

  return (
    <div className='space-y-6'>
      {/* Current Tags Display */}
      {currentTags.length > 0 && (
        <div className='space-y-3'>
          <h3 className='text-sm font-medium text-gray-900'>Current Tags:</h3>
          <div className='flex flex-wrap gap-2'>
            {currentTags.map((tag) => (
              <Badge
                key={tag.id}
                variant='secondary'
                className='cursor-default'
                style={
                  tagType === "PROJECT" && tag.color
                    ? {
                        backgroundColor: `${tag.color}15`,
                        borderColor: tag.color,
                        color: tag.color,
                      }
                    : {}
                }
              >
                {tag.name}
                <Check className='ml-1 h-3 w-3' />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Selected New Tags Display */}
      {selectedTags.length > 0 && (
        <div className='space-y-3'>
          <h3 className='text-sm font-medium text-gray-900'>Tags to Add:</h3>
          <div className='flex flex-wrap gap-2'>
            {selectedTags.map((tagName) => {
              const tag = tags.find((t) => t.name === tagName);
              return (
                <Badge
                  key={tagName}
                  variant='secondary'
                  className='cursor-pointer bg-blue-100 text-blue-800 hover:bg-blue-200'
                  onClick={() => handleTagToggle(tagName)}
                  style={
                    tagType === "PROJECT" && tag?.color
                      ? {
                          backgroundColor: `${tag.color}15`,
                          borderColor: tag.color,
                          color: tag.color,
                        }
                      : {}
                  }
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
        </div>

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
          <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4'>
            {tags.map((tag) => {
              const isCurrentTag = currentTagNames.includes(tag.name);
              const isSelected = selectedTags.includes(tag.name);

              return (
                <Button
                  key={tag.id}
                  variant={
                    isCurrentTag
                      ? "default"
                      : isSelected
                        ? "default"
                        : "outline"
                  }
                  size='sm'
                  className={`justify-start ${
                    isCurrentTag
                      ? "cursor-default opacity-60"
                      : "cursor-pointer"
                  }`}
                  onClick={() => !isCurrentTag && handleTagToggle(tag.name)}
                  disabled={isCurrentTag}
                  style={
                    tagType === "PROJECT" && tag.color
                      ? isCurrentTag || isSelected
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
                  {isCurrentTag && <Check className='ml-1 h-3 w-3' />}
                </Button>
              );
            })}
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
          Add {selectedTags.length > 0 ? `(${selectedTags.length})` : ""}{" "}
          {tagType === "PROJECT" ? "Labels" : "Tags"}
        </Button>
      </div>
    </div>
  );
}
