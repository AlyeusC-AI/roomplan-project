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
import { Checkbox } from "@components/ui/checkbox";
import { cn } from "@lib/utils";
import {
  useCreateProject,
  useActiveOrganization,
} from "@service-geek/api-client";
import { LossType } from "@service-geek/api-client";

const DAMAGE_TYPES = [
  { value: LossType.FIRE, label: "Fire" },
  { value: LossType.WATER, label: "Water" },
  { value: LossType.WIND, label: "Wind" },
  { value: LossType.HAIL, label: "Hail" },
  { value: LossType.MOLD, label: "Mold" },
  { value: LossType.OTHER, label: "Other" },
] as const;

interface AddressType {
  formattedAddress: string;
  lat: number;
  lng: number;
}

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
  const [damageType, setDamageType] = useState<LossType>();
  const [searchInput, setSearchInput] = useState("");
  const { track } = useAmplitudeTrack();
  const router = useRouter();
  const createProject = useCreateProject();

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectLocation || !projectName) {
      return toast.error("Please provide a name and location for the project.");
    }
    event("attempt_create_new_project", {
      category: "Project List",
    });

    try {
      const result = await createProject.mutateAsync({
        name: projectName,
        location: projectLocation.formattedAddress,
        clientPhoneNumber,
        clientEmail,
        lossType: damageType,
        lat: projectLocation.lat.toString(),
        lng: projectLocation.lng.toString(),
      });

      event("create_new_project", {
        category: "Project List",
        projectId: result.data.id,
      });
      track("Project Created", { projectId: result.data.id });

      router.push(`/projects/${result.data.id}/overview`);
      setOpen(false);
    } catch (error) {
      toast.error("Could not create project");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='max-w-2xl'>
        {createProject.isPending ? (
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
                <Label htmlFor='client-phone' className='text-right'>
                  Client Phone Number
                </Label>
                <Input
                  id='client-phone'
                  value={clientPhoneNumber}
                  onChange={(e) => setClientPhoneNumber(e.target.value)}
                  className='col-span-3'
                  placeholder='Client Phone Number'
                />
              </div>

              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='client-email' className='text-right'>
                  Client Email
                </Label>
                <Input
                  id='client-email'
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className='col-span-3'
                  placeholder='Client Email'
                />
              </div>

              <div className='space-y-2'>
                <Label
                  htmlFor='formDamageTypes'
                  className='text-base font-medium dark:text-gray-100'
                >
                  Damage Types
                </Label>
                <div className='flex flex-wrap gap-2'>
                  {DAMAGE_TYPES.map((type) => (
                    <div
                      key={type.value}
                      className={cn(
                        "flex cursor-pointer items-center space-x-2 rounded-md border px-3 py-2 transition-colors",
                        "hover:bg-gray-100 dark:hover:bg-gray-700",
                        damageType === type.value
                          ? "border-primary bg-primary/5 dark:bg-primary/10"
                          : "border-gray-200 dark:border-gray-700"
                      )}
                      onClick={() => setDamageType(type.value)}
                    >
                      <Checkbox
                        id={`damage-type-${type.value}`}
                        checked={damageType === type.value}
                        className='data-[state=checked]:border-primary data-[state=checked]:bg-primary'
                      />
                      <Label className='cursor-pointer text-sm font-medium'>
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
              <Button
                onClick={handleCreateProject}
                disabled={createProject.isPending}
              >
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
