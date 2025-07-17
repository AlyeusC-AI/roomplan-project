import { toast } from "sonner";
// import { AutoSaveTextInput } from '@components/components/input'
import { useParams } from "next/navigation";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { useState } from "react";
import { LoadingSpinner } from "@components/ui/spinner";
import {
  useActiveOrganization,
  useCurrentUser,
  useGetProjectById,
  useUpdateProject,
  uploadFile,
} from "@service-geek/api-client";
import { useRef } from "react";

const formSchema = z.object({
  name: z.string().min(1, "Project Name is required"),
  managerName: z.string().min(1, "Project Manager Name is required"),
  companyName: z.string().min(1, "Company Name is required"),
});

export default function ProjectInformation() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const { data: projectData } = useGetProjectById(id as string);
  const updateProject = useUpdateProject();

  const project = projectData?.data;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name || "",
      managerName: project?.managerName,
      companyName: project?.companyName || "",
    },
  });

  const [claimSummaryImages, setClaimSummaryImages] = useState<string[]>(
    project?.claimSummaryImages || []
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const response = await uploadFile(file, file.name);
      uploadedUrls.push(response.publicUrl);
    }
    setClaimSummaryImages((prev) => [...prev, ...uploadedUrls]);
  };

  const onSave = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      await updateProject.mutateAsync({
        id: id as string,
        data: {
          ...data,
          claimSummaryImages,
        },
      });

      toast.success("Project updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error(
        "Update Failed. If the error persists please contact support@restoregeek.app"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className='w-full'>
      <div className='p-4'>
        <h3 className='text-lg font-medium'>Project Information</h3>
        <p className='text-sm text-muted-foreground'>
          Your business and project manager information.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSave)} className='space-y-8 p-3'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input placeholder='shadcn' {...field} />
                </FormControl>
                <FormDescription>The name of the project.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='managerName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Manager Name</FormLabel>
                <FormControl>
                  <Input placeholder='shadcn' {...field} />
                </FormControl>
                <FormDescription>
                  The name of the project manager.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='companyName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder='shadcn' {...field} />
                </FormControl>
                <FormDescription>
                  The name of the company managing the project.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <div className='mt-6'>
           <label className='block text-sm font-medium text-gray-700'>
              Claim Summary Images
            </label>
            <input
              type='file'
              multiple
              accept='image/*'
              ref={fileInputRef}
              onChange={handleImageChange}
              className='mt-1 block w-full'
            />
            <div className='mt-2 flex flex-wrap'>
              {claimSummaryImages.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt='Claim Summary'
                  className='mb-2 mr-2 h-16 w-16 rounded object-cover'
                />
              ))}
            </div>
          </div> */}
          <div className='flex justify-end'>
            <Button type='submit' className='ml-auto'>
              {loading ? <LoadingSpinner /> : "Save"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
    // <FormContainer className='col-span-10 md:col-span-5'>
    //   <Form
    //     title='Project Information'
    //     description='Your business information and project manager information'
    //   >
    //     <>
    //       {/* <AutoSaveTextInput
    //         className="col-span-6"
    //         defaultValue={
    //           projectInfo.managerName ||
    //           `${userInfo?.firstName} ${userInfo?.lastName}`
    //         }
    //         onSave={(projectManagerName) => onSave({ projectManagerName })}
    //         name="projectManagerName"
    //         title="Project Manager Name"
    //         ignoreInvalid
    //       />

    //       <AutoSaveTextInput
    //         className="col-span-6"
    //         defaultValue={
    //           projectInfo.companyName || userInfo?.organizationName || ''
    //         }
    //         onSave={(companyName) => onSave({ companyName })}
    //         name="companyName"
    //         title="Company Name"
    //         ignoreInvalid
    //       /> */}
    //     </>
    //   </Form>
    // </FormContainer>
  );
}
