import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import debounce from "lodash.debounce";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { projectStore } from "@atoms/project";

import FormContainer from "./FormContainer";
import InputLabel from "./InputLabel";
import LocationData from "./LocationData";
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

const propertyOwnerData = z.object({
  clientName: z
    .string()
    .min(2, {
      message: "Client name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name name must not be longer than 30 characters.",
    }),
  clientEmail: z
    .string()
    .email({
      message: "Invalid email address.",
    })
    .optional(),
  clientPhoneNumber: z
    .string()
    .refine(validator.isMobilePhone, "Invalid phone number."),
  assignmentNumber: z.string().optional(),
  referral: z.string().optional(),
  claimSummary: z.string().optional(),
});

type PropertyOwnerValues = z.infer<typeof propertyOwnerData>;

interface PropertyOwnerData {
  clientName?: string;
  clientEmail?: string;
  clientPhoneNumber?: string;
  location?: string;
  assignmentNumber?: string;
  refferal?: string;
  claimSummary?: string;
}

export default function ProjectOwnerInformation() {
  const { id } = useParams();
  const projectInfo = projectStore((state) => state.project);

  const onSave = async (data: PropertyOwnerData) => {
    try {
      const res = await fetch(`/api/project/${id}/client-information`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (res.ok) {
        // @ts-ignore
        projectStore.getState().setProject(data);
      } else {
        toast.error(
          "Updated Failed. If the error persists please contact support@servicegeek.app"
        );
      }
    } catch (error) {
      console.error(error);
      toast.error(
        "Updated Failed. If the error persists please contact support@servicegeek.app"
      );
    }
  };
  const form = useForm<PropertyOwnerValues>({
    resolver: zodResolver(propertyOwnerData),
    mode: "onChange",
  });

  function onSubmit(data: PropertyOwnerData) {
    toast("You submitted the following values:", {
      description: (
        <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
          <code className='text-white'>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  const [newAddress, setAddress] = useState<AddressType>({
    address: "",
    address2: "",
    formattedAddress: "",
    city: "",
    region: "",
    postalCode: "",
    country: "",
    lat: 0,
    lng: 0,
  });
  const [searchInput, setSearchInput] = useState("");

  return (
    // <>
    //   <FormContainer className="col-span-10 lg:col-span-6">
    //     <Form
    //       title="Assignment Details"
    //       description="Record the property location as well as point of contact information
    //         for your records."
    //     >
    //       {/* <AutoSaveTextInput
    //         className="col-span-6 sm:col-span-3"
    //         defaultValue={projectInfo.clientName}
    //         onSave={(clientName) => onSave({ clientName })}
    //         name="clientName"
    //         title="Client Name"
    //         ignoreInvalid
    //       />

    //       <AutoSaveTextInput
    //         className="col-span-6 sm:col-span-3"
    //         defaultValue={`${projectInfo.assignmentNumber || ''}`}
    //         onSave={(assignmentNumber) => onSave({ assignmentNumber })}
    //         name="assignmentNumber"
    //         title="Assignment Number"
    //         ignoreInvalid
    //       />

    //       <AutoSaveTextInput
    //         className="col-span-6 sm:col-span-3"
    //         defaultValue={projectInfo.clientPhoneNumber}
    //         onSave={(clientPhoneNumber) => onSave({ clientPhoneNumber })}
    //         name="clientPhoneNumber"
    //         title="Client Phone number"
    //         ignoreInvalid
    //         isPhonenumber
    //       />

    //       <AutoSaveTextInput
    //         className="col-span-6 sm:col-span-3"
    //         defaultValue={projectInfo.clientEmail}
    //         onSave={(clientEmail) => onSave({ clientEmail })}
    //         name="clientEmail"
    //         title="Client Email"
    //         ignoreInvalid
    //       />

    //       <AutoSaveTextInput
    //         className="col-span-6"
    //         defaultValue={projectInfo.refferal ?? ''}
    //         onSave={(refferal) => onSave({ refferal })}
    //         name="Refferal"
    //         isTextArea={true}
    //         title="Refferal"
    //       />

    //       <AutoSaveTextInput
    //         className="col-span-6"
    //         defaultValue={projectInfo.claimSummary}
    //         onSave={(claimSummary) => onSave({ claimSummary })}
    //         name="claimSummary"
    //         isTextArea={true}
    //         title="Claim summary"
    //       /> */}

    //       <div className="col-span-6 flex flex-col justify-between">
    //         <InputLabel htmlFor="propertyAddress" className="mb-2">
    //           Property Address
    //         </InputLabel>

    //         <div className="flex">
    //           <GooglePlacesAutocomplete
    //             apiKey={process.env.GOOGLE_MAPS_API_KEY}
    //             language="en"
    //             style={{ boxShadow: 'none' }}
    //             className="block w-full rounded-md border-[1px] border-gray-300 px-2 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
    //             options={{
    //               types: [],
    //             }}
    //             id="propertyAddress"
    //             defaultValue={projectInfo.location}
    //             onPlaceSelected={(place) => {
    //               if (place && place.formatted_address) {
    //                 onSave({ location: place.formatted_address })
    //               }
    //             }}
    //             onChange={(e: ChangeEvent<HTMLInputElement>) => {
    //               e.preventDefault()
    //               if (e.target.value) {
    //                 debouncedChangeHandler({ location: e.target.value })
    //               }
    //             }}
    //           />
    //         </div>
    //       </div>
    //     </Form>
    //   </FormContainer>
    //   <FormContainer className="col-span-10 lg:col-span-4">
    //     {/* <LocationData /> */}
    //   </FormContainer>
    // </>
    <div className='flex w-full space-x-4'>
      <Card className='w-full p-6'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <div className='grid grid-cols-2 space-x-3'>
              <FormField
                control={form.control}
                name='clientName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input
                        defaultValue={projectInfo.clientName}
                        placeholder='Client Name'
                        {...field}
                      />
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
                      <Input
                        defaultValue={projectInfo.assignmentNumber}
                        placeholder='Assignment Number'
                        {...field}
                      />
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
                      <Input
                        placeholder={"(123) 456-7890"}
                        defaultValue={projectInfo.clientPhoneNumber}
                        {...field}
                      />
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
                      <Input
                        defaultValue={projectInfo.clientEmail}
                        placeholder={"example@company.com"}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Your client's email.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='referral'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referral</FormLabel>
                  <FormControl>
                    <Textarea
                      defaultValue={projectInfo.refferal}
                      placeholder='Please enter your refferal here...'
                      {...field}
                    />
                    {/* <Input
                  placeholder={"example@company.com"}
                  {...field}
                /> */}
                  </FormControl>
                  <FormDescription>Your client's refferal.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='claimSummary'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Claim Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      defaultValue={projectInfo.claimSummary}
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

            <Button type='submit'>Update Info</Button>
          </form>
        </Form>
        <div className='mt-4'>
          <AddressAutoComplete
            address={newAddress}
            setAddress={setAddress}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            dialogTitle='Enter Proerty Address'
          />
        </div>
      </Card>
      <LocationData />
    </div>
  );
}
