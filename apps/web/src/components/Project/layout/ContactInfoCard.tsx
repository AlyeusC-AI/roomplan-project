import { useState, useEffect } from "react";
import { Card, CardContent } from "@components/ui/card";
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
import { Project, useUpdateProject } from "@service-geek/api-client";
import { toast } from "sonner";

export default function ContactInfoCard({
  projectData,
}: {
  projectData: Project;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const updateProject = useUpdateProject();

  const contactSchema = z.object({
    clientName: z.string().optional(),
    clientEmail: z.string().email().optional().or(z.literal("")),
    clientPhone: z.string().optional(),
  });

  const contactForm = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      clientName: projectData?.clientName || "",
      clientEmail: projectData?.clientEmail || "",
      clientPhone: projectData?.clientPhoneNumber || "",
    },
  });

  useEffect(() => {
    contactForm.reset({
      clientName: projectData?.clientName || "",
      clientEmail: projectData?.clientEmail || "",
      clientPhone: projectData?.clientPhoneNumber || "",
    });
  }, [projectData]);

  const onSubmit = async (data: any) => {
    if (!projectData?.id) return;

    try {
      await updateProject.mutateAsync({
        id: projectData.id,
        data: {
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          clientPhoneNumber: data.clientPhone,
        },
      });

      toast.success("Contact information updated successfully");
      setEditOpen(false);
    } catch (error) {
      toast.error("Failed to update contact information");
    }
  };

  return (
    <>
      <div
        className='cursor-pointer hover:text-blue-600'
        onClick={() => setEditOpen(true)}
      >
        <div className='mb-0 flex items-center justify-between'>
          <h3 className='text-lg font-medium'>Contact Info</h3>
          <Button variant='ghost' size='icon' onClick={() => setEditOpen(true)}>
            <Edit2 className='h-4 w-4 text-blue-600' />
          </Button>
        </div>
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <div className='text-xs text-gray-500'>
              {projectData?.clientName || "No name"}
            </div>
            <div className='text-xs text-gray-600'>
              • {projectData?.clientPhoneNumber || "No phone"}
            </div>
          </div>
          <div className='text-xs text-gray-600'>
            {projectData?.clientEmail || "No email"}
          </div>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact Info</DialogTitle>
          </DialogHeader>
          <Form {...contactForm}>
            <form
              onSubmit={contactForm.handleSubmit(onSubmit)}
              className='space-y-4'
            >
              <FormField
                control={contactForm.control}
                name='clientName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Enter client name' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={contactForm.control}
                name='clientEmail'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='email'
                        placeholder='Enter client email'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={contactForm.control}
                name='clientPhone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Enter client phone' />
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
