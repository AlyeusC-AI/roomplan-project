import { useState, useEffect } from "react";
import { Button } from "@components/ui/button";
import { Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateProject } from "@service-geek/api-client";
import { toast } from "sonner";

export default function AdjusterInfoCard({
  projectData,
}: {
  projectData: any;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const updateProject = useUpdateProject();

  const adjusterSchema = z.object({
    adjusterName: z.string().optional(),
    adjusterEmail: z.string().email().optional().or(z.literal("")),
    adjusterPhone: z.string().optional(),
    insuranceCompanyName: z.string().optional(),
    insuranceClaimId: z.string().optional(),
  });

  const adjusterForm = useForm({
    resolver: zodResolver(adjusterSchema),
    defaultValues: {
      adjusterName: projectData?.adjusterName || "",
      adjusterEmail: projectData?.adjusterEmail || "",
      adjusterPhone: projectData?.adjusterPhoneNumber || "",
      insuranceCompanyName: projectData?.insuranceCompanyName || "",
      insuranceClaimId: projectData?.insuranceClaimId || "",
    },
  });

  useEffect(() => {
    adjusterForm.reset({
      adjusterName: projectData?.adjusterName || "",
      adjusterEmail: projectData?.adjusterEmail || "",
      adjusterPhone: projectData?.adjusterPhoneNumber || "",
      insuranceCompanyName: projectData?.insuranceCompanyName || "",
      insuranceClaimId: projectData?.insuranceClaimId || "",
    });
  }, [projectData]);

  const onSubmit = async (data: any) => {
    if (!projectData?.id) return;

    try {
      await updateProject.mutateAsync({
        id: projectData.id,
        data: {
          adjusterName: data.adjusterName,
          adjusterEmail: data.adjusterEmail,
          adjusterPhoneNumber: data.adjusterPhone,
          insuranceCompanyName: data.insuranceCompanyName,
          insuranceClaimId: data.insuranceClaimId,
        },
      });

      toast.success("Adjuster information updated successfully");
      setEditOpen(false);
    } catch (error) {
      toast.error("Failed to update adjuster information");
    }
  };

  return (
    <>
      <div
        className='cursor-pointer hover:text-blue-600'
        onClick={() => setEditOpen(true)}
      >
        <div className='mb-0 flex items-center justify-between'>
          <h3 className='  font-medium'>Adjuster Info</h3>
          <Button variant='ghost' size='icon' onClick={() => setEditOpen(true)}>
            <Edit2 className='h-4 w-4 text-blue-600' />
          </Button>
        </div>
        <div className='grid grid-cols-2 '>
          <div className='flex items-center gap-2'>
            <div className='text-xs text-gray-500'>
              {projectData?.adjusterName || "No name"}
            </div>
            <div className='text-xs text-gray-600'>
              • {projectData?.adjusterPhoneNumber || "No phone"}
            </div>
          </div>
          <div className='text-xs text-gray-600'>
            {projectData?.adjusterEmail || "No email"}
          </div>
          <div className='text-xs text-gray-600'>
            {projectData?.insuranceCompanyName || "No company"}
          </div>
          <div className='text-xs text-gray-600'>
            {projectData?.insuranceClaimId || "No claim ID"}
          </div>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Adjuster Info</DialogTitle>
          </DialogHeader>
          <Form {...adjusterForm}>
            <form
              onSubmit={adjusterForm.handleSubmit(onSubmit)}
              className='space-y-4'
            >
              <FormField
                control={adjusterForm.control}
                name='adjusterName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Enter adjuster name' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={adjusterForm.control}
                name='adjusterEmail'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='email'
                        placeholder='Enter adjuster email'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={adjusterForm.control}
                name='adjusterPhone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Enter adjuster phone' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={adjusterForm.control}
                name='insuranceCompanyName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Enter insurance company name'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={adjusterForm.control}
                name='insuranceClaimId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Claim ID</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Enter insurance claim ID'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={updateProject.isPending}>
                  {updateProject.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
