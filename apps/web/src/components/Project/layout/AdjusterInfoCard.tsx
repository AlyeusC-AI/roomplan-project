import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import {
  Shield,
  Edit2,
  UserCheck,
  Mail,
  Phone,
  Building,
  FileText,
  Copy,
  ExternalLink,
  Check,
} from "lucide-react";
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
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  const handleCall = (phoneNumber: string) => {
    if (!phoneNumber) return;
    window.open(`tel:${phoneNumber}`, "_self");
  };

  const handleEmail = (email: string) => {
    if (!email) return;
    window.open(`mailto:${email}`, "_self");
  };

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

  const AdjusterItem = ({
    icon: Icon,
    value,
    placeholder,
    field,
    actionType = "copy",
  }: {
    icon: any;
    value?: string;
    placeholder: string;
    field: string;
    actionType?: "copy" | "call" | "email";
  }) => {
    const hasValue = !!value;
    const isCopied = copiedField === field;

    const handleAction = () => {
      if (!hasValue) return;

      switch (actionType) {
        case "copy":
          handleCopy(value!, field);
          break;
        case "call":
          handleCall(value!);
          break;
        case "email":
          handleEmail(value!);
          break;
      }
    };

    return (
      <div className='group flex items-center justify-between'>
        <div className='flex flex-1 items-center gap-2 text-sm'>
          <Icon className='h-4 w-4 text-gray-500' />
          <span className={!hasValue ? "text-gray-400" : ""}>
            {value || placeholder}
          </span>
        </div>
        {hasValue && (
          <div className='flex gap-1'>
            <Button
              variant='ghost'
              size='sm'
              className='h-6 w-6 p-0'
              onClick={() => handleCopy(value!, field)}
              title='Copy to clipboard'
            >
              {isCopied ? (
                <Check className='h-3 w-3 text-green-600' />
              ) : (
                <Copy className='h-3 w-3 text-gray-400 hover:text-gray-600' />
              )}
            </Button>
            {actionType !== "copy" && (
              <Button
                variant='ghost'
                size='sm'
                className='h-6 w-6 p-0'
                onClick={handleAction}
                title={actionType === "call" ? "Call" : "Send email"}
              >
                <ExternalLink className='h-3 w-3 text-gray-400 hover:text-gray-600' />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Shield className='h-5 w-5 text-green-600' /> Adjuster Info
          </CardTitle>
          <Button variant='ghost' size='icon' onClick={() => setEditOpen(true)}>
            <Edit2 className='h-4 w-4 text-gray-400' />
          </Button>
        </CardHeader>
        <CardContent className='space-y-3'>
          <AdjusterItem
            icon={UserCheck}
            value={projectData?.adjusterName}
            placeholder='No name'
            field='name'
          />
          <AdjusterItem
            icon={Mail}
            value={projectData?.adjusterEmail}
            placeholder='No email'
            field='email'
            actionType='email'
          />
          <AdjusterItem
            icon={Phone}
            value={projectData?.adjusterPhoneNumber}
            placeholder='No phone'
            field='phone'
            actionType='call'
          />
          <AdjusterItem
            icon={Building}
            value={projectData?.insuranceCompanyName}
            placeholder='No company'
            field='company'
          />
          <AdjusterItem
            icon={FileText}
            value={projectData?.insuranceClaimId}
            placeholder='No claim ID'
            field='claimId'
          />
        </CardContent>
      </Card>

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
