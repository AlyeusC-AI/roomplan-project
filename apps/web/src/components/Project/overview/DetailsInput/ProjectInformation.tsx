import { toast } from "sonner";
// import { AutoSaveTextInput } from '@components/components/input'
import { useParams } from "next/navigation";
import { projectStore } from "@atoms/project";
import { userInfoStore } from "@atoms/user-info";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orgStore } from "@atoms/organization";
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

const formSchema = z.object({
  name: z.string().min(1, "Project Name is required"),
  managerName: z.string().min(1, "Project Manager Name is required"),
  companyName: z.string().min(1, "Company Name is required"),
});

export default function ProjectInformation() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const { project: projectInfo, setProject } = projectStore((state) => state);
  const userInfo = userInfoStore((state) => state.user);
  const org = orgStore((state) => state.organization);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: projectInfo?.name || "",
      managerName:
        projectInfo?.managerName ||
        `${userInfo?.firstName} ${userInfo?.lastName}`,
      companyName: projectInfo?.companyName || org?.name || "",
    },
  });

  const onSave = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setProject({
          ...projectInfo!,
          ...data,
        });

        toast.success("Project updated successfully!");
      } else {
        toast.error(
          "Updated Failed. If the error persists please contact support@restoregeek.app"
        );
      }
    } catch (error) {
      console.error(error);
      toast.error(
        "Updated Failed. If the error persists please contact support@restoregeek.app"
      );
    }

    setLoading(false);
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
