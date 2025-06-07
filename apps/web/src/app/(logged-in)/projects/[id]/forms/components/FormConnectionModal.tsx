import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { FileText, Link as LinkIcon, Unlink, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import {
  Form,
  useAddFormToProject,
  useGetProjectForms,
  useGetForms,
  useRemoveFormFromProject,
} from "@service-geek/api-client";

interface FormConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FormConnectionModal({
  isOpen,
  onClose,
}: FormConnectionModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isConnecting, setIsConnecting] = useState<{ [key: string]: boolean }>(
    {}
  );

  const params = useParams();
  const projectId = params.id as string;
  // const { data: allForms } = useGetFormsByProject(projectId);
  const { data: connections, isLoading } = useGetProjectForms(projectId);
  const { data: forms } = useGetForms();
  const { mutate: connectFormToProject } = useAddFormToProject(projectId);
  const { mutate: disconnectFormFromProject } =
    useRemoveFormFromProject(projectId);

  // useEffect(() => {
  //   if (allForms) {
  //     setConnections(
  //       allForms
  //         .filter((form) =>
  //           form.projects.some((p) => p.projectId === projectId)
  //         )
  //         .map((form) => ({
  //           formId: form.id!,
  //           projectId: projectId,
  //           id: form.projects[0].id,
  //         }))
  //     );
  //   }
  // }, [allForms]);
  // const forms = allForms?.filter(
  //   (form) => !form.projects.some((p) => p.projectId === projectId)
  // );

  const handleToggleConnection = async (form: Form) => {
    if (!form.id) return;

    setIsConnecting((prev) => ({ ...prev, [form.id!]: true }));
    try {
      const isConnected = connections?.some((c) => c.formId === form.id);

      if (isConnected) {
        await disconnectFormFromProject(form.id);
      } else {
        await connectFormToProject(form.id);
      }
    } catch (error) {
      console.error("Error toggling connection:", error);
    } finally {
      setIsConnecting((prev) => ({ ...prev, [form.id!]: false }));
    }
  };

  const filteredForms = forms?.filter(
    (form) =>
      form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Connect Forms</DialogTitle>
        </DialogHeader>

        <div className='relative mb-4'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
          <Input
            placeholder='Search forms...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-9'
          />
        </div>

        <ScrollArea className='h-[400px] pr-4'>
          {isLoading ? (
            <div className='flex h-full items-center justify-center'>
              <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
            </div>
          ) : filteredForms?.length === 0 ? (
            <div className='flex h-64 flex-col items-center justify-center text-muted-foreground'>
              <FileText className='mb-4 h-12 w-12' />
              <p className='text-center'>No forms found</p>
            </div>
          ) : (
            <div className='space-y-2'>
              {filteredForms?.map((form) => {
                const isConnected = connections?.some(
                  (c) => c.formId === form.id
                );
                const isProcessing = isConnecting[form.id!];

                return (
                  <Card
                    key={form.id}
                    className={cn(
                      "group flex items-center justify-between p-4 transition-all hover:shadow-sm",
                      isConnected && "border-primary/50 bg-primary/5"
                    )}
                  >
                    <div className='min-w-0 flex-1'>
                      <h4 className='mb-1 truncate text-sm font-medium'>
                        {form.name}
                      </h4>
                      {form.description && (
                        <p className='line-clamp-1 text-sm text-muted-foreground'>
                          {form.description}
                        </p>
                      )}
                    </div>

                    <Button
                      variant='ghost'
                      size='sm'
                      className={cn(
                        "ml-4 gap-2",
                        isConnected
                          ? "text-green-600 hover:text-red-600"
                          : "text-muted-foreground hover:text-green-600"
                      )}
                      onClick={() => handleToggleConnection(form)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                      ) : isConnected ? (
                        <Unlink className='h-4 w-4' />
                      ) : (
                        <LinkIcon className='h-4 w-4' />
                      )}
                      {isConnected ? "Connected" : "Connect"}
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
