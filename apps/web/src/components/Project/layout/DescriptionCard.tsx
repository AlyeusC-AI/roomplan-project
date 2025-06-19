import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { FileText, Edit2, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@components/ui/dialog";
import { Textarea } from "@components/ui/textarea";
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

export default function DescriptionCard({ projectData }: { projectData: any }) {
  const [editOpen, setEditOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const updateProject = useUpdateProject();

  const descriptionSchema = z.object({
    description: z.string().optional(),
  });

  const descriptionForm = useForm({
    resolver: zodResolver(descriptionSchema),
    defaultValues: {
      description: projectData?.description || "",
    },
  });

  useEffect(() => {
    descriptionForm.reset({
      description: projectData?.description || "",
    });
  }, [projectData]);

  const handleCopy = async (text: string, field: string) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const onSubmit = async (data: any) => {
    if (!projectData?.id) return;

    try {
      await updateProject.mutateAsync({
        id: projectData.id,
        data: {
          description: data.description,
        },
      });

      toast.success("Description updated successfully");
      setEditOpen(false);
    } catch (error) {
      toast.error("Failed to update description");
    }
  };

  const hasDescription = !!projectData?.description;
  const isCopied = copiedField === "description";

  return (
    <>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <FileText className='h-5 w-5 text-purple-600' /> Description
          </CardTitle>
          <div className='flex gap-1'>
            {hasDescription && (
              <Button
                variant='ghost'
                size='icon'
                onClick={() =>
                  handleCopy(projectData.description, "description")
                }
                title='Copy to clipboard'
              >
                {isCopied ? (
                  <Check className='h-4 w-4 text-green-600' />
                ) : (
                  <Copy className='h-4 w-4 text-gray-400 hover:text-gray-600' />
                )}
              </Button>
            )}
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setEditOpen(true)}
            >
              <Edit2 className='h-4 w-4 text-gray-400' />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='min-h-[48px] whitespace-pre-line text-sm text-gray-700'>
            {projectData?.description || (
              <span className='text-gray-400'>No description</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Edit Description</DialogTitle>
          </DialogHeader>
          <Form {...descriptionForm}>
            <form
              onSubmit={descriptionForm.handleSubmit(onSubmit)}
              className='space-y-4'
            >
              <FormField
                control={descriptionForm.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder='Enter description details...'
                        className='min-h-[120px] resize-none'
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
