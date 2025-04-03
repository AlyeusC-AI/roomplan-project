import { useState } from "react";
import useAmplitudeTrack from "@utils/hooks/useAmplitudeTrack";
import { useRouter } from "next/navigation";
import { event } from "nextjs-google-analytics";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import AddressAutoComplete from "@components/ui/address-automplete";
import { LoadingPlaceholder } from "@components/ui/spinner";
import { DAMAGE_TYPES, DamageType } from "@types/damage";
import { Checkbox } from "@components/ui/checkbox";
import { cn } from "@lib/utils";


const CreateNewProject = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [projectName, setProjectName] = useState("");
  const [projectLocation, setProjectLocation] = useState<AddressType | null>(
    null
  );
  const [clientPhoneNumber, setClientPhoneNumber] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [damageType, setDamageType] = useState<DamageType | undefined>();
  const [searchInput, setSearchInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { track } = useAmplitudeTrack();
  const router = useRouter();

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectLocation || !projectName) {
      return toast.error("Please provide a name and location for the project.");
    }
    event("attempt_create_new_project", {
      category: "Project List",
    });

    setIsCreating(true);
    try {
      const res = await fetch("/api/v1/projects", {
        method: "POST",
        body: JSON.stringify({
          name: projectName,
          location: projectLocation,
          clientPhoneNumber: clientPhoneNumber,
          clientEmail: clientEmail,
          damageType: damageType,

        }),
      });
      if (res.ok) {
        const json = await res.json();
        event("create_new_project", {
          category: "Project List",
          projectId: json.projectId,
        });
        track("Project Created", { projectId: json.projectId });

        router.push(`/projects/${json.projectId}/overview`);
      } else {
        toast.error("Could not create project");
        console.error("Could not create project");
      }
    } catch (error) {
      toast.error("Could not create project");
      console.error(error);
    }
    setIsCreating(false);
  };

  if (isCreating) {
    <LoadingPlaceholder />;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        {isCreating ? (
          <DialogDescription>Creating project...</DialogDescription>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Provide a name for your new project and upload images of the job
                site
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='project-name' className='text-right'>
                  Client Name *
                </Label>
                <Input
                  id='project-name'
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className='col-span-3'
                  placeholder='Client Name'
                  required
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label
                  htmlFor='project-location'
                  className='whitespace-nowrap text-right'
                  
                >
                  Project Location *
                </Label>
                <div className='col-span-3'>
                  <AddressAutoComplete
                    address={projectLocation}
                    setAddress={setProjectLocation}
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    showInlineError={false}
                    dialogTitle='Enter project location'
                    placeholder='Enter address'
                  />
                </div>
                </div>

                <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='project-name' className='text-right' 
                
                >
                  Client Phone Number 
                </Label>
                <Input
                  id='project-name'
                  value={clientPhoneNumber}
                  onChange={(e) => setClientPhoneNumber(e.target.value)}
                  className='col-span-3'
                  placeholder='Client Phone Number'
                  required
                />
              </div>

              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='project-name' className='text-right'>
                  Client Email
                </Label>
                <Input
                  id='project-name'
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className='col-span-3'
                  placeholder='Client Email'
                  required
                />
              </div>
          
                <div className="space-y-2"> 
            <Label htmlFor="formDamageTypes" className="text-base font-medium dark:text-gray-100">Damage Types</Label>
            <div className="flex flex-wrap gap-2">
              {DAMAGE_TYPES.map((type) => (
                <div
                  key={type.value}
                  className={cn(
                    "flex items-center space-x-2 rounded-md border px-3 py-2 cursor-pointer transition-colors",
                    "hover:bg-gray-100 dark:hover:bg-gray-700",
                    damageType === type.value
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-gray-200 dark:border-gray-700"
                  )}
                  onClick={() => setDamageType(type.value as DamageType)}
                >
                  <Checkbox
                    id={`damage-type-${type.value}`}
                      checked={damageType === type.value}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label
                    className="text-sm font-medium cursor-pointer"
                  >
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>





            </div>
            <DialogFooter>
              <Button
                onClick={() => setOpen(false)}
                variant='secondary'
                className='mr-2'
              >
                Cancel
              </Button>
              <Button onClick={createProject} disabled={isCreating}>
                Create
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewProject;
