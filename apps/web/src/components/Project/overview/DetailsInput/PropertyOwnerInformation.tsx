import { useState } from "react";
import { toast } from "sonner";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@components/ui/button";
import validator from "validator";
import { Textarea } from "@components/ui/textarea";
import AddressAutoComplete from "@components/ui/address-automplete";
import { Card } from "@components/ui/card";
import { Label } from "@components/ui/label";
import { PhoneInput } from "@components/ui/phone-input";
import { LoadingSpinner } from "@components/ui/spinner";
import { useGetProjectById, useUpdateProject } from "@service-geek/api-client";

const propertyOwnerData = z.object({
  clientName: z.string().optional(),
  clientEmail: z.string().optional(),
  clientPhoneNumber: z
    .string()
    .refine(validator.isMobilePhone, "Invalid phone number.")
    .optional(),
  assignmentNumber: z.string().optional(),
  claimSummary: z.string().optional(),
});

type PropertyOwnerValues = z.infer<typeof propertyOwnerData> & {
  lat?: string;
  lng?: string;
  location?: string;
};

export default function ProjectOwnerInformation() {
  const { id } = useParams();
  const { data: projectData } = useGetProjectById(id as string);
  const updateProject = useUpdateProject();
  const [loading, setLoading] = useState(false);
  const project = projectData?.data;

  const onSave = async (data: PropertyOwnerValues) => {
    try {
      setLoading(true);
      await updateProject.mutateAsync({
        id: id as string,
        data,
      });

      toast.success("Project updated successfully!");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const form = useForm<PropertyOwnerValues>({
    resolver: zodResolver(propertyOwnerData),
    mode: "onChange",
    defaultValues: {
      clientPhoneNumber:
        project?.clientPhoneNumber?.length === 0
          ? "+1"
          : (project?.clientPhoneNumber ?? "+1"),
      clientEmail: project?.clientEmail,
      clientName: project?.clientName,
      claimSummary: project?.claimSummary,
      assignmentNumber: project?.assignmentNumber,
    },
  });

  const [newAddress, setAddress] = useState<AddressType | null>(null);
  const [searchInput, setSearchInput] = useState("");

  return (
    <div className='flex w-full space-x-4'>
      <Card className='w-full p-6'>
        <div className='-mt-2 mb-4'>
          <h3 className='text-lg font-medium'>Client Information</h3>
          <p className='text-sm text-muted-foreground'>
            Information about the property owner related to the project.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className='space-y-8'>
            <div className='grid grid-cols-2 space-x-3'>
              <FormField
                control={form.control}
                name='clientName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Client Name' {...field} />
                    </FormControl>
                    <FormDescription>The name of your client.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='assignmentNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignment Number</FormLabel>
                    <FormControl>
                      <Input placeholder='Assignment Number' {...field} />
                    </FormControl>
                    <FormDescription>
                      Your assignment number for this project.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid grid-cols-2 space-x-3'>
              <FormField
                control={form.control}
                name='clientPhoneNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Phone Number</FormLabel>
                    <FormControl>
                      <PhoneInput placeholder={"(123) 456-7890"} {...field} />
                    </FormControl>
                    <FormDescription>
                      Your client's phone number.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='clientEmail'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Email</FormLabel>
                    <FormControl>
                      <Input placeholder={"example@company.com"} {...field} />
                    </FormControl>
                    <FormDescription>Your client's email.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <Label>Property Address</Label>
              <AddressAutoComplete
                address={newAddress}
                setAddress={(address) => {
                  setAddress(address);
                  onSave({
                    location: address.formattedAddress,
                    lat: `${address.lat}`,
                    lng: `${address.lng}`,
                  });
                }}
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                placeholder={project?.location ?? ""}
                dialogTitle='Enter Property Address'
              />
            </div>
            {/* <FormField
              control={form.control}
              name='referral'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referral</FormLabel>
                  <FormControl>
                    <Textarea
                      defaultValue={project?. ?? ""}
                      placeholder='Please enter your refferal here...'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Your client's refferal.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <FormField
              control={form.control}
              name='claimSummary'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Claim Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Please enter your claim summary here...'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your client's claim summary.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex w-full flex-row items-end justify-end'>
              <Button disabled={loading} type='submit'>
                {loading ? <LoadingSpinner /> : "Update Info"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
      {/* {project?.lat && project?.lng && <LocationData />} */}
    </div>
  );
}
