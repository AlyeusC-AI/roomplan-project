"use client";

import React from "react";
import { CirclePlus, FolderPlus, MapPinPlus, UserPlus, Users } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface CreateOptionsPopoverProps {
  onCreateProject?: () => void;
  onInviteUser?: () => void;
  onCreateGroup?: () => void;
}

const CreateOptionsPopover: React.FC<CreateOptionsPopoverProps> = ({
  onCreateProject,
  onInviteUser,
  onCreateGroup,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className=" px-4 py-2">
          <CirclePlus size={32} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48" align="start">
     
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={onCreateProject}
          >
            
            <MapPinPlus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={onInviteUser}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={onCreateGroup}
          >
            <Users className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CreateOptionsPopover; 