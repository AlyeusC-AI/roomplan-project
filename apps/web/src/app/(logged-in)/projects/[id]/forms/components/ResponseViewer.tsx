import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Form } from "@/app/(logged-in)/forms/types";
import { FileText, Image as ImageIcon } from "lucide-react";

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
          }
          return (
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <img 
                src={imageUrl} 
                alt={field.field.name}
                className="max-h-[200px] object-contain rounded border border-border"
              />
            </div>
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