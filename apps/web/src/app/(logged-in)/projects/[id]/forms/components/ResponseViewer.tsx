import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Image as ImageIcon, Maximize2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FormResponse, FormResponseField } from "@service-geek/api-client";

export function ResponseViewer({ response }: { response: FormResponse }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const renderValue = (field: FormResponseField) => {
    try {
      const type = field.field.type.toLowerCase();
      const value = field.value;

      // Handle empty values
      if (!value) {
        return (
          <span className='text-sm italic text-muted-foreground'>
            No response provided
          </span>
        );
      }

      // Handle images and signatures
      if (
        type === "image" ||
        type === "signature" ||
        value.startsWith("data:image")
      ) {
        try {
          let imageUrl = value;
          if (!value.startsWith("data:image")) {
            const data = JSON.parse(value);
            imageUrl = data.url || value;
            if (Array.isArray(data)) {
              return (
                <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4'>
                  {data.map(({ url }, index) => (
                    <Dialog key={index}>
                      <DialogTrigger asChild>
                        <div className='group relative cursor-pointer'>
                          <div className='aspect-square overflow-hidden rounded-lg border border-border'>
                            <img
                              src={url}
                              alt={`${field.field.name} ${index + 1}`}
                              className='h-full w-full max-w-[400px] object-contain'
                            />
                          </div>
                          <div className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100'>
                            <Maximize2 className='h-6 w-6 text-white' />
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className='max-w-4xl p-0'>
                        <img
                          src={url}
                          alt={`${field.field.name} ${index + 1}`}
                          className='max-h-[600px] w-full object-contain'
                        />
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              );
            }
          }
          return (
            <Dialog key={field.id}>
              <DialogTrigger asChild>
                <div className='group relative max-w-[400px] cursor-pointer'>
                  <div className='aspect-square overflow-hidden rounded-lg border border-border'>
                    <img
                      src={imageUrl}
                      alt={field.field.name}
                      className='h-full w-full max-w-[400px] object-contain'
                    />
                  </div>
                  <div className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100'>
                    <Maximize2 className='h-6 w-6 text-white' />
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className='max-w-4xl p-0'>
                <img
                  src={imageUrl}
                  alt={field.field.name}
                  className='h-auto max-h-[600px] w-full object-contain'
                />
              </DialogContent>
            </Dialog>
          );
        } catch {
          return (
            <span className='text-sm italic text-muted-foreground'>
              Invalid image data
            </span>
          );
        }
      }

      // Handle files
      if (type === "file" || value.startsWith("http")) {
        try {
          let fileUrl = value;
          let fileName = "Download File";
          if (!value.startsWith("http")) {
            const data = JSON.parse(value);
            fileUrl = data.url;
            fileName = data.name || fileName;
          }
          return (
            <div className='flex items-center gap-2'>
              <FileText className='h-4 w-4 flex-shrink-0 text-primary' />
              <a
                href={fileUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='text-sm text-primary hover:underline'
              >
                {fileName}
              </a>
            </div>
          );
        } catch {
          return (
            <span className='text-sm italic text-muted-foreground'>
              Invalid file data
            </span>
          );
        }
      }

      // Handle arrays (lists, checkboxes)
      try {
        const items = JSON.parse(value);
        if (Array.isArray(items)) {
          return (
            <div className='space-y-1 text-sm'>
              {items.map((item, index) => (
                <div key={index} className='flex items-center gap-2'>
                  <span className='text-muted-foreground'>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          );
        }
      } catch {}

      // Default text display
      return <span className='text-sm'>{value}</span>;
    } catch (error) {
      return (
        <span className='text-sm italic text-destructive'>
          Error displaying value
        </span>
      );
    }
  };

  return (
    <div className='divide-y divide-border'>
      {response.formResponseFields.map((field) => (
        <div key={field.id} className='py-3 first:pt-0 last:pb-0'>
          <div className='flex items-start justify-between gap-4'>
            <div className='min-w-0 flex-1'>
              <div className='mb-1.5 flex items-center gap-2'>
                <h3 className='truncate text-sm font-medium'>
                  {field.field.name}
                </h3>
                <Badge
                  variant='secondary'
                  className='text-xs font-normal capitalize'
                >
                  {field.field.type}
                </Badge>
              </div>
              <div className='text-foreground'>{renderValue(field)}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
