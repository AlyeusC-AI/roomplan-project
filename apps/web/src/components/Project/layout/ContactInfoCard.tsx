import { useState, useEffect } from "react";
import { Card } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Edit2, Phone, Mail, MessageSquareText, MapPin } from "lucide-react";
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
  const [streetViewImageUrl, setStreetViewImageUrl] = useState<string | null>(
    null
  );
  const [isLoadingStreetView, setIsLoadingStreetView] = useState(false);
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
    } catch {
      toast.error("Failed to update contact information");
    }
  };

  // Action handlers
  const handleCall = () => {
    if (projectData?.clientPhoneNumber)
      window.open(`tel:${projectData.clientPhoneNumber}`);
  };
  const handleEmail = () => {
    if (projectData?.clientEmail)
      window.open(`mailto:${projectData.clientEmail}`);
  };
  const handleSMS = () => {
    if (projectData?.clientPhoneNumber)
      window.open(`sms:${projectData.clientPhoneNumber}`);
  };

  const lat = 40.689247;
  const lng = -74.044502;
  // Google Street View image URL and link logic (lat/lng preferred)

  const getStreetViewImage = async () => {
    if (
      !projectData?.location ||
      !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    ) {
      return;
    }

    try {
      setIsLoadingStreetView(true);
      let streetViewUrl = "";
      if (projectData.lat && projectData.lng) {
        streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${projectData.lat},${projectData.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      } else {
        streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${encodeURIComponent(projectData.location)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      }
      console.log("Street View URL:", streetViewUrl);
      setStreetViewImageUrl(streetViewUrl);
    } catch (error) {
      console.error("Error getting street view image:", error);
    } finally {
      setIsLoadingStreetView(false);
    }
  };

  useEffect(() => {
    if (projectData?.location) {
      getStreetViewImage();
    }
  }, [projectData?.location]);
  console.log(
    "🚀 ~ projectData:",
    projectData,
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    streetViewImageUrl,
    process.env
  );
  return (
    <>
      <div className='rounded-lg border border-border bg-background p-4'>
        {/* Street View Image */}
        <div className='relative'>
          {streetViewImageUrl ? (
            <a
              href={streetViewImageUrl}
              target='_blank'
              rel='noopener noreferrer'
              style={{ display: "block" }}
            >
              <img
                src={streetViewImageUrl}
                alt='Street View'
                className='h-40 w-full object-cover'
                style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
              />
            </a>
          ) : (
            <div className='flex h-40 w-full items-center justify-center bg-gray-200 text-4xl font-bold text-gray-400'>
              {projectData?.clientName?.[0] || "?"}
            </div>
          )}
          {/* Overlay: House Details in bottom right */}
          <div className='absolute bottom-0 right-0 z-10 flex items-center gap-6 rounded-lg bg-white/20 px-4 py-2'>
            {/* Beds */}
            <div className='flex min-w-[40px] flex-col items-center'>
              <span className='text-base font-bold'>
                {projectData?.beds ?? "-"}
              </span>
              <span className='text-xs text-gray-500'>Beds</span>
            </div>
            {/* Divider */}
            <div className='h-7 w-px bg-gray-200' />
            {/* Baths */}
            <div className='flex min-w-[40px] flex-col items-center'>
              <span className='text-base font-bold'>
                {projectData?.baths ?? "-"}
              </span>
              <span className='text-xs text-gray-500'>Baths</span>
            </div>
            {/* Divider */}
            <div className='h-7 w-px bg-gray-200' />
            {/* Sq. Ft. */}
            <div className='flex min-w-[50px] flex-col items-center'>
              <span className='text-base font-bold'>
                {projectData?.squareFeet ?? "-"}
              </span>
              <span className='text-xs text-gray-500'>Sq. Ft.</span>
            </div>
          </div>
        </div>
        <div className='p-4'>
          <div className='mb-2 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='text-xl font-bold'>
                {projectData?.clientName || "No name"}
              </div>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setEditOpen(true)}
                title='Edit'
                className='w-fit'
              >
                <Edit2 className='h-5 w-5 text-blue-600' />
              </Button>
            </div>
            <div className='mt-1 flex items-center gap-2'>
              {projectData?.clientPhoneNumber && (
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={handleSMS}
                  title='SMS'
                  className='w-fit'
                >
                  <MessageSquareText className='h-5 w-5 text-blue-600' />
                </Button>
              )}
              {projectData?.clientEmail && (
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={handleEmail}
                  title='Email'
                  className='w-fit'
                >
                  <Mail className='h-5 w-5 text-blue-600' />
                </Button>
              )}
              {projectData?.clientPhoneNumber && (
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={handleCall}
                  title='Call'
                  className='w-fit'
                >
                  <Phone className='h-5 w-5 text-blue-600' />
                </Button>
              )}
            </div>
          </div>
          {/* <div className='mb-1 text-sm text-gray-600'>
            {projectData?.clientEmail || "No email"}
          </div>
          <div className='mb-1 text-sm text-gray-600'>
            {projectData?.clientPhoneNumber || "No phone"}
          </div> */}
          {projectData?.location && (
            <div className='mt-2 flex items-center justify-between text-sm text-gray-600'>
              <span>{projectData.location}</span>
              <a
                href={
                  projectData.lat && projectData.lng
                    ? `https://www.google.com/maps/search/?api=1&query=${projectData.lat},${projectData.lng}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(projectData.location)}`
                }
                target='_blank'
                rel='noopener noreferrer'
                title='Open in Google Maps'
                className='ml-2'
              >
                <MapPin className='h-5 w-5 text-blue-600 transition-colors hover:text-blue-800' />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
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
