import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { FileText, Link as LinkIcon, Unlink, Search } from "lucide-react";
import { Form } from "@/app/(logged-in)/forms/types";
import { Input } from "@/components/ui/input";
import { connectFormToProject, disconnectFormFromProject, getFormConnections } from "../utils/formConnection";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";

interface FormConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionChange: () => void;
}

export function FormConnectionModal({
  isOpen,
  onClose,

  onConnectionChange,
}: FormConnectionModalProps) {
  const [forms, setForms] = useState<Form[]>([]);
  const [connections, setConnections] = useState<{ formId: number; projectId: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isConnecting, setIsConnecting] = useState<{ [key: number]: boolean }>({});
  const params = useParams();
  const projectId = params.id as string;
  useEffect(() => {
    if (isOpen) {
      fetchForms();
      fetchConnections();
    }
  }, [isOpen, projectId]);

  const fetchForms = async () => {
    try {
      const response = await fetch("/api/v1/organization/forms");
      if (!response.ok) throw new Error("Failed to fetch forms");
      const data = await response.json();
      setForms(data);
    } catch (error) {
      console.error("Error fetching forms:", error);
    }
  };

  const fetchConnections = async () => {
    try {
      const connections = await getFormConnections(projectId);
      setConnections(connections);
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleConnection = async (form: Form) => {
    if (!form.id) return;

    setIsConnecting(prev => ({ ...prev, [form.id!]: true }));
    try {
      const isConnected = connections.some(c => c.formId === form.id);

      if (isConnected) {
        await disconnectFormFromProject({ formId: form.id, projectId });
      } else {
        await connectFormToProject({ formId: form.id, projectId });
      }

      await fetchConnections();
      onConnectionChange();
    } catch (error) {
      console.error("Error toggling connection:", error);
    } finally {
      setIsConnecting(prev => ({ ...prev, [form.id!]: false }));
    }
  };

  const filteredForms = forms.filter(form => 
    form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    form.desc?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Connect Forms</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search forms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          ) : filteredForms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <FileText className="h-12 w-12 mb-4" />
              <p className="text-center">No forms found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredForms.map((form) => {
                const isConnected = connections.some(c => c.formId === form.id);
                const isProcessing = isConnecting[form.id!];

                return (
                  <Card
                    key={form.id}
                    className={cn(
                      "p-4 flex items-center justify-between group hover:shadow-sm transition-all",
                      isConnected && "border-primary/50 bg-primary/5"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm mb-1 truncate">{form.name}</h4>
                      {form.desc && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {form.desc}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "ml-4 gap-2",
                        isConnected ? "text-green-600 hover:text-red-600" : "text-muted-foreground hover:text-green-600"
                      )}
                      onClick={() => handleToggleConnection(form)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : isConnected ? (
                        <Unlink className="h-4 w-4" />
                      ) : (
                        <LinkIcon className="h-4 w-4" />
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