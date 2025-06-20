"use client";

/**
 * TagsModal Component
 *
 * Usage examples:
 *
 * // For managing project labels
 * <TagsModal tagType="PROJECT" />
 *
 * // For managing image tags
 * <TagsModal tagType="IMAGE" />
 *
 * // With custom trigger
 * <TagsModal
 *   tagType="PROJECT"
 *   trigger={<Button>Custom Label Button</Button>}
 * />
 *
 * // Controlled modal
 * <TagsModal
 *   tagType="IMAGE"
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 * />
 *
 * // For assigning tags to images
 * <TagsModal
 *   tagType="IMAGE"
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onAssignTags={handleAssignTags}
 *   isAssignMode={true}
 * />
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { Tag as TagIcon, Check } from "lucide-react";
import TagsPage from "../../app/(logged-in)/settings/tags/main";
import TagsManagment from "./tagsManagment";
import TagSelector from "./TagSelector";

interface TagsModalProps {
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  tagType?: "PROJECT" | "IMAGE";
  onAssignTags?: (tagNames: string[]) => void;
  isAssignMode?: boolean;
}

export default function TagsModal({
  trigger,
  title,
  description,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  tagType = "PROJECT",
  onAssignTags,
  isAssignMode = false,
}: TagsModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleOpenChange = controlledOnOpenChange || setInternalOpen;

  // Set default title and description based on tagType
  const defaultTitle = tagType === "PROJECT" ? "Manage Labels" : "Manage Tags";
  const defaultDescription =
    tagType === "PROJECT"
      ? "Create and manage your project labels"
      : "Create and manage your image tags";

  const modalTitle = title || defaultTitle;
  const modalDescription = description || defaultDescription;

  const handleAssignTags = (tagNames: string[]) => {
    onAssignTags?.(tagNames);
    handleOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {/* <DialogTrigger asChild>
        {trigger || (
          <Button variant='outline' size='sm'>
            <TagIcon className='mr-2 h-4 w-4' />
            {tagType === "PROJECT" ? "Manage Labels" : "Manage Tags"}
          </Button>
        )}
      </DialogTrigger> */}
      <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>{modalDescription}</DialogDescription>
        </DialogHeader>
        {isAssignMode ? (
          <TagSelector tagType={tagType} onAssignTags={handleAssignTags} />
        ) : (
          <TagsManagment initialTagType={tagType} />
        )}
      </DialogContent>
    </Dialog>
  );
}
