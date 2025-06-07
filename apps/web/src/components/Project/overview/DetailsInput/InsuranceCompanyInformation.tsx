import { toast } from "sonner";
import { useParams } from "next/navigation";

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
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@lib/utils";
import { useState } from "react";
import { LoadingSpinner } from "@components/ui/spinner";
import {
  LossType,
  useGetProjectById,
  useUpdateProject,
} from "@service-geek/api-client";

const formSchema = z.object({
  insuranceCompanyName: z.string().optional(),
  adjusterName: z.string().optional(),
  adjusterPhoneNumber: z.string().optional(),
  adjusterEmail: z.string().optional(),
  insuranceClaimId: z.string().optional(),
  lossType: z.string().optional(),
  catCode: z.string().optional(),
});

export default function InsuranceCompanyInformation() {
  const [loading, setLoading] = useState(false);
  const { id } = useParams<{ id: string }>();
  const { data: projectData } = useGetProjectById(id as string);
  const updateProject = useUpdateProject();
  const project = projectData?.data;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      insuranceCompanyName: project?.insuranceCompanyName,
      adjusterName: project?.adjusterName,
      adjusterPhoneNumber: project?.adjusterPhoneNumber,
      adjusterEmail: project?.adjusterEmail,
      insuranceClaimId: project?.insuranceClaimId,
      lossType: project?.lossType,
      catCode: `${project?.catCode ?? ""}`,
    },
  });

  const onSave = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      await updateProject.mutateAsync({
        id: id as string,
        data: {
          ...data,
          catCode: data.catCode ? data.catCode : undefined,
          lossType: data.lossType ? (data.lossType as LossType) : undefined,
        },
      });

      toast.success("Project updated successfully!");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const lossTypes = Object.values(LossType);
  return (
    <Card className='w-full lg:col-span-2'>
      <div className='p-4'>
        <h3 className='text-lg font-medium'>Insurance Information</h3>
        <p className='text-sm text-muted-foreground'>
          The insurance company and adjuster information.
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSave)}
          className='grid grid-cols-1 space-x-2 space-y-5 p-3 lg:grid-cols-2'
        >
          <FormField
            control={form.control}
            name='insuranceCompanyName'
            render={({ field }) => (
              <FormItem className='mt-5'>
                <FormLabel>Insurance Company Name</FormLabel>
                <FormControl>
                  <Input placeholder='Insurance Company Name' {...field} />
                </FormControl>
                <FormDescription>
                  The name of the insurance company for the project.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='adjusterName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Insurance Adjuster Name</FormLabel>
                <FormControl>
                  <Input placeholder='Insurance Adjuster Name' {...field} />
                </FormControl>
                <FormDescription>
                  The name of the insurance adjuster for the project.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='adjusterEmail'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Insurance Adjuster Email</FormLabel>
                <FormControl>
                  <Input placeholder='Insurance Adjuster Email' {...field} />
                </FormControl>
                <FormDescription>
                  The email of the insurance adjuster for the project.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='adjusterPhoneNumber'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Insurance Adjuster Phone Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Insurance Adjuster Phone Number'
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The phone number of the insurance adjuster for the project.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='insuranceClaimId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Insurance Claim ID</FormLabel>
                <FormControl>
                  <Input placeholder='Insurance Claim ID' {...field} />
                </FormControl>
                <FormDescription>
                  The claim ID of the insurance for the project.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='lossType'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type of Loss</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild className='w-full'>
                      <Button
                        variant='outline'
                        role='combobox'
                        className='justify-between'
                      >
                        {field.value
                          ? lossTypes.find(
                              (framework) => framework === field.value
                            )
                          : "Select loss type..."}
                        <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-[200px] p-0'>
                      <Command>
                        <CommandInput placeholder='Search loss types...' />
                        <CommandList>
                          <CommandEmpty>No loss types found.</CommandEmpty>
                          <CommandGroup>
                            {lossTypes.map((framework) => (
                              <CommandItem
                                key={framework}
                                value={framework}
                                onSelect={(currentValue) => {
                                  field.onChange(
                                    currentValue === field.value
                                      ? ""
                                      : currentValue
                                  );
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === framework
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {framework}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormDescription>
                  The type of loss for the project.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='catCode'
            render={({ field }) => (
              <FormItem>
                <FormLabel>CAT Code</FormLabel>
                <FormControl>
                  <Input placeholder='CAT Code' {...field} />
                </FormControl>
                <FormDescription>The CAT code of the project.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='col-span-full mt-6 flex justify-end'>
            <Button type='submit' disabled={loading}>
              {loading ? <LoadingSpinner /> : "Save"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
