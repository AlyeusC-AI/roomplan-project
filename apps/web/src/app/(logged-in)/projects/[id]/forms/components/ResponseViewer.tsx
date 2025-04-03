import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Form } from "@/app/(logged-in)/forms/types";
import { FileText, Image as ImageIcon, Maximize2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ResponseViewerProps {
  response: {
    id: number;
    fields: {
      id: number;
      value: string;
      field: {
        id: number;
        name: string;
        type: string;
      };
    }[];
  };
}

export function ResponseViewer({ response }: ResponseViewerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const renderValue = (field: ResponseViewerProps['response']['fields'][0]) => {
    try {
      const type = field.field.type.toLowerCase();
      const value = field.value;

      // Handle empty values
      if (!value) {
        return <span className="text-muted-foreground text-sm italic">No response provided</span>;
      }

      // Handle images and signatures
      if (type === 'image' || type === 'signature' || value.startsWith('data:image')) {
        try {
          let imageUrl = value;
          if (!value.startsWith('data:image')) {
            const data = JSON.parse(value);
            imageUrl = data.url || value;
            if(Array.isArray(data)) {
              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {data.map(({url}, index) => (
                    <Dialog key={index}>
                      <DialogTrigger asChild>
                        <div className="relative group cursor-pointer">
                          <div className="aspect-square rounded-lg border border-border overflow-hidden">
                            <img 
                              src={url} 
                              alt={`${field.field.name} ${index + 1}`}
                              className="w-full h-full object-contain max-w-[400px]"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Maximize2 className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl p-0">
                        <img 
                          src={url} 
                          alt={`${field.field.name} ${index + 1}`}
                          className="w-full max-h-[600px] object-contain "
                        />
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              );
            }
          }
          return (
            <Dialog key={field.id} >
              <DialogTrigger asChild >
                <div className="relative group cursor-pointer max-w-[400px]">
                  <div className="aspect-square rounded-lg border border-border overflow-hidden">
                    <img 
                      src={imageUrl} 
                      alt={field.field.name}
                      className="w-full h-full object-contain    max-w-[400px]"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-0">
                <img 
                  src={imageUrl} 
                  alt={field.field.name}
                  className="w-full h-auto object-contain max-h-[600px]"
                />
              </DialogContent>
            </Dialog>
          );
        } catch {
          return <span className="text-muted-foreground text-sm italic">Invalid image data</span>;
        }
      }

      // Handle files
      if (type === 'file' || value.startsWith('http')) {
        try {
          let fileUrl = value;
          let fileName = 'Download File';
          if (!value.startsWith('http')) {
            const data = JSON.parse(value);
            fileUrl = data.url;
            fileName = data.name || fileName;
          }
          return (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary flex-shrink-0" />
              <a 
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm"
              >
                {fileName}
              </a>
            </div>
          );
        } catch {
          return <span className="text-muted-foreground text-sm italic">Invalid file data</span>;
        }
      }

      // Handle arrays (lists, checkboxes)
      try {
        const items = JSON.parse(value);
        if (Array.isArray(items)) {
          return (
            <div className="text-sm space-y-1">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          );
        }
      } catch {}

      // Default text display
      return <span className="text-sm">{value}</span>;
    } catch (error) {
      return <span className="text-destructive text-sm italic">Error displaying value</span>;
    }
  };

  return (
    <div className="divide-y divide-border">
      {response.fields.map((field) => (
        <div key={field.id} className="py-3 first:pt-0 last:pb-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="font-medium text-sm truncate">
                  {field.field.name}
                </h3>
                <Badge 
                  variant="secondary" 
                  className="text-xs font-normal capitalize"
                >
                  {field.field.type}
                </Badge>
              </div>
              <div className="text-foreground">
                {renderValue(field)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 