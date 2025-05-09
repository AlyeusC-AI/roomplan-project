"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  useGetOrganizations,
  useActiveOrganization,
  useSetActiveOrganization,
} from "@service-geek/api-client";
import { OrganizationModal } from "./modals/organization-modal";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface OrganizationSelectorProps {
  className?: string;
  showLabel?: boolean;
  buttonClassName?: string;
  dropdownClassName?: string;
  onSelect?: (organizationId: string) => void;
  readOnly?: boolean;
  variant?: "default" | "subtle";
  hideIfSingle?: boolean;
}

export function OrganizationSelector({
  className,
  showLabel = true,
  buttonClassName,
  dropdownClassName,
  onSelect,
  readOnly = false,
  variant = "default",
  hideIfSingle = false,
}: OrganizationSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  const { data: organizations } = useGetOrganizations();
  const activeOrganization = useActiveOrganization();
  const setActiveOrganization = useSetActiveOrganization();

  const handleOrganizationSelect = async (orgId: string) => {
    const selectedOrg = organizations?.find((org) => org.id === orgId);
    if (selectedOrg) {
      try {
        setActiveOrganization(selectedOrg);
        onSelect?.(orgId);
        toast.success(`Switched to ${selectedOrg.name}`);
      } catch (error) {
        console.error("Error setting active organization:", error);
        toast.error("Failed to switch organization");
      }
    }
  };

  useEffect(() => {
    const setActive = async () => {
      if (activeOrganization) {
        // Call the set-active endpoint
        const response = await fetch("/api/v1/organization/set-active", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ organizationId: activeOrganization.id }),
        });

        if (!response.ok) {
          throw new Error("Failed to set active organization");
        }
      }
    };
    setActive();
  }, [activeOrganization]);

  const handleEditClick = (org: any) => {
    if (readOnly) return;
    setSelectedOrg(org);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    if (readOnly) return;
    setSelectedOrg(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  // If hideIfSingle is true and there's only one organization, don't render the selector
  if (hideIfSingle && organizations?.length === 1) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {showLabel && (
        <h3 className='text-lg font-medium'>Select Organization</h3>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant === "subtle" ? "ghost" : "outline"}
            className={cn(
              "group w-[280px] justify-start transition-colors",
              variant === "subtle"
                ? "hover:bg-transparent hover:text-primary"
                : "hover:bg-accent/50",
              buttonClassName
            )}
          >
            <Building2
              className={cn(
                "mr-2 h-4 w-4 transition-colors",
                variant === "subtle"
                  ? "text-muted-foreground group-hover:text-primary"
                  : "text-muted-foreground group-hover:text-foreground"
              )}
            />
            <span
              className={cn(
                "font-medium",
                variant === "subtle" &&
                  "text-muted-foreground group-hover:text-primary"
              )}
            >
              {activeOrganization?.name || "Select Organization"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={cn("w-[280px] p-2", dropdownClassName)}>
          <DropdownMenuLabel className='text-sm font-medium'>
            Organizations
          </DropdownMenuLabel>
          <DropdownMenuSeparator className='my-2' />
          {organizations?.map((org) => (
            <div
              key={org.id}
              className='flex items-center justify-between px-2 py-1.5'
            >
              <DropdownMenuItem
                onClick={() => handleOrganizationSelect(org.id)}
                className={cn(
                  "flex-1 cursor-pointer rounded-md",
                  activeOrganization?.id === org.id && "bg-accent"
                )}
              >
                <div className='flex items-center gap-2'>
                  <Building2 className='h-4 w-4 text-muted-foreground' />
                  <span className='font-medium'>{org.name}</span>
                </div>
              </DropdownMenuItem>
              {!readOnly && (
                <Button
                  variant='ghost'
                  className='h-8 w-8 p-0'
                  onClick={() => handleEditClick(org)}
                >
                  <Pencil className='h-4 w-4' />
                </Button>
              )}
            </div>
          ))}
          {!readOnly && (
            <>
              <DropdownMenuSeparator className='my-2' />
              <DropdownMenuItem
                onClick={handleCreateClick}
                className='mt-2 cursor-pointer'
              >
                <Plus className='mr-2 h-4 w-4' />
                Create Organization
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <OrganizationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrg(null);
        }}
        organization={selectedOrg}
        mode={modalMode}
      />
    </div>
  );
}
