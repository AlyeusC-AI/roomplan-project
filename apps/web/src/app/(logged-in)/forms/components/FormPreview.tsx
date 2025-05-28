"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Star,
  StarHalf,
  FileText,
  Upload,
  Image,
  Trash2,
  Undo2,
} from "lucide-react";
import SignaturePad from "react-signature-canvas";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Form, uploadImage } from "@service-geek/api-client";

interface FormPreviewProps {
  form: Form | null;
  onSubmit?: (formData: any) => Promise<void>;
  isSubmitting?: boolean;
  initialValues?: { [key: string]: any };
}

export function FormPreview({
  form,
  onSubmit,
  isSubmitting,
  initialValues = {},
}: FormPreviewProps) {
  console.log("🚀 ~ FormPreview ~ form:", initialValues);
  const signaturePadRefs = useRef<{ [key: string]: SignaturePad | null }>({});
  const [formData, setFormData] = useState<{ [key: string]: any }>(
    initialValues
  );
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [uploadErrors, setUploadErrors] = useState<{ [key: string]: string }>(
    {}
  );

  const handleClear = (fieldId: string) => {
    signaturePadRefs.current[fieldId]?.clear();
  };

  const handleUndo = (fieldId: string) => {
    const pad = signaturePadRefs.current[fieldId];
    if (pad) {
      const data = pad.toData();
      if (data.length > 0) {
        pad.fromData(data.slice(0, -1));
      }
    }
  };

  const setSignaturePadRef =
    (fieldId: string) => (ref: SignaturePad | null) => {
      signaturePadRefs.current[fieldId] = ref;
    };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleFileUpload = async (fieldId: string, file: File) => {
    try {
      setUploadProgress((prev) => ({ ...prev, [fieldId]: 0 }));
      setUploadErrors((prev) => ({ ...prev, [fieldId]: "" }));

      // For images, optimize before upload
      let fileToUpload: File | Blob = file;
      // if (file.type.startsWith("image/")) {
      //   const optimizedBlob = await optimizeImage(file);
      //   // Convert Blob to File to maintain filename
      //   fileToUpload = new File([optimizedBlob], file.name, {
      //     type: optimizedBlob.type,
      //   });
      // }

      const result = await uploadImage(fileToUpload, {
        folder: "form-uploads",
        useUniqueFileName: true,
        tags: ["form-submission"],
      });

      // Store file data in a format that can be easily displayed
      const fileData = {
        url: result.url,
        name: file.name,
        size: result.size,
        type: file.type,
        fileId: result.fileId,
        filePath: result.filePath,
      };

      return fileData;
      // setFormData(prev => ({
      //   ...prev,
      //   [fieldId]: fileData
      // }));

      setUploadProgress((prev) => ({ ...prev, [fieldId]: 100 }));
    } catch (error) {
      console.error("Upload error:", error);
      setUploadErrors((prev) => ({
        ...prev,
        [fieldId]: "Failed to upload file. Please try again.",
      }));
      setUploadProgress((prev) => ({ ...prev, [fieldId]: 0 }));
    }
  };

  const handleSubmit = async () => {
    if (!onSubmit) return;

    // Collect all form data
    const finalFormData = { ...formData };

    // Add signature data
    Object.entries(signaturePadRefs.current).forEach(([fieldId, pad]) => {
      if (pad && !pad.isEmpty()) {
        finalFormData[fieldId] = pad.toDataURL();
      }
    });

    await onSubmit(finalFormData);
  };

  if (!form) {
    return (
      <div className='flex h-full flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400'>
        <FileText className='mb-4 h-12 w-12 animate-pulse' />
        <p className='text-lg'>Select a form to preview</p>
        <p className='mt-2 text-sm'>
          Choose a form from the list to see how it looks
        </p>
      </div>
    );
  }

  const ViewImage = ({ fieldId }: { fieldId: string }) => {
    const images =
      typeof formData[fieldId] === "string"
        ? JSON.parse(formData[fieldId])
        : formData[fieldId];

    return (
      <div>
        {Array.isArray(images) && images.length > 0 ? (
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4'>
              {images.map((image: any, index: number) => (
                <div key={index} className='group relative'>
                  <div className='aspect-square overflow-hidden rounded-lg border border-border'>
                    <img
                      src={
                        typeof image === "string"
                          ? JSON.parse(image).url
                          : image.url
                      }
                      alt={
                        typeof image === "string"
                          ? JSON.parse(image).name
                          : image.name
                      }
                      className='h-full w-full object-cover'
                    />
                  </div>
                  <button
                    type='button'
                    onClick={(e) => {
                      e.preventDefault();
                      const newImages = [...images];
                      newImages.splice(index, 1);
                      handleInputChange(fieldId!, newImages);
                    }}
                    className='absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100'
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                </div>
              ))}
            </div>
            {uploadProgress[fieldId] < 100 && (
              <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200'>
                <div
                  className='h-full bg-primary transition-all duration-300'
                  style={{ width: `${uploadProgress[fieldId]}%` }}
                />
              </div>
            )}
            {uploadErrors[fieldId] && (
              <p className='text-sm text-red-500'>{uploadErrors[fieldId]}</p>
            )}
          </div>
        ) : (
          <div className='space-y-2'>
            <Image className='mx-auto h-6 w-6 sm:h-8 sm:w-8' />
            <p className='text-sm sm:text-base'>
              Click to upload or drag and drop
            </p>
            <p className='text-xs text-gray-500'>PNG, JPG, GIF up to 10MB</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='mx-auto max-w-2xl space-y-6 px-4 sm:space-y-8 sm:px-0'>
      <div className='space-y-2'>
        <h2 className='text-xl font-bold dark:text-gray-100 sm:text-2xl'>
          {form.name}
        </h2>
        {form.description && (
          <p className='text-gray-600 dark:text-gray-300'>{form.description}</p>
        )}
      </div>

      <div className='space-y-4 sm:space-y-6'>
        {form.sections?.map((section, sectionIndex) => (
          <Card
            key={sectionIndex}
            className='p-4 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 sm:p-6'
          >
            <h3 className='mb-4 text-base font-semibold text-gray-900 dark:text-gray-100 sm:mb-6 sm:text-lg'>
              {section.name}
            </h3>
            <div className='space-y-4 sm:space-y-6'>
              {section.fields?.map((field, fieldIndex) => (
                <div key={fieldIndex} className='group space-y-2 sm:space-y-3'>
                  <Label className='flex items-center gap-2 text-sm dark:text-gray-100 sm:text-base'>
                    {field.name}
                    {field.isRequired && (
                      <span className='text-xs font-normal text-red-500 sm:text-sm'>
                        (required)
                      </span>
                    )}
                  </Label>

                  <div className='relative'>
                    {field.type === "TEXT" && (
                      <Input
                        className='transition-all duration-200 focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
                        onChange={(e) =>
                          handleInputChange(field.id!, e.target.value)
                        }
                        value={formData[field.id!] || ""}
                      />
                    )}

                    {field.type === "TEXTAREA" && (
                      <Textarea
                        className='min-h-[100px] transition-all duration-200 focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
                        onChange={(e) =>
                          handleInputChange(field.id!, e.target.value)
                        }
                        value={formData[field.id!] || ""}
                      />
                    )}

                    {field.type === "NUMBER" && (
                      <Input
                        type='number'
                        className='transition-all duration-200 focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
                        onChange={(e) =>
                          handleInputChange(field.id!, e.target.value)
                        }
                        value={formData[field.id!] || ""}
                      />
                    )}

                    {field.type === "DATE" && (
                      <Input
                        type='date'
                        className='transition-all duration-200 focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
                        onChange={(e) =>
                          handleInputChange(field.id!, e.target.value)
                        }
                        value={formData[field.id!] || ""}
                      />
                    )}

                    {field.type === "TIME" && (
                      <Input
                        type='time'
                        className='transition-all duration-200 focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
                        onChange={(e) =>
                          handleInputChange(field.id!, e.target.value)
                        }
                        value={formData[field.id!] || ""}
                      />
                    )}

                    {field.type === "RADIO" && (
                      <RadioGroup
                        className='space-y-2 sm:space-y-3'
                        value={formData[field.id!] || ""}
                        onValueChange={(value) =>
                          handleInputChange(field.id!, value)
                        }
                      >
                        {field.options?.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className='flex items-center space-x-3 rounded-md p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          >
                            <RadioGroupItem
                              value={option}
                              id={`${field.id}-${optionIndex}`}
                              className='border-gray-300 dark:border-gray-600'
                            />
                            <Label
                              htmlFor={`${field.id}-${optionIndex}`}
                              className='cursor-pointer text-gray-700 dark:text-gray-200'
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {field.type === "CHECKBOX" && (
                      <div className='space-y-2 sm:space-y-3'>
                        {field.options?.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className='flex items-center space-x-3 rounded-md p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          >
                            <Checkbox
                              id={`${field.id}-${optionIndex}`}
                              className='border-gray-300 dark:border-gray-600'
                              checked={formData[field.id!]?.includes(option)}
                              onCheckedChange={(checked) => {
                                const currentValues: string[] =
                                  formData[field.id!] || [];
                                const newValues = checked
                                  ? [...currentValues, option]
                                  : currentValues.filter((v) => v !== option);
                                handleInputChange(field.id!, newValues);
                              }}
                            />
                            <Label
                              htmlFor={`${field.id}-${optionIndex}`}
                              className='cursor-pointer text-gray-700 dark:text-gray-200'
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}

                    {field.type === "SELECT" && (
                      <Select
                        value={formData[field.id!] || ""}
                        onValueChange={(value) =>
                          handleInputChange(field.id!, value)
                        }
                      >
                        <SelectTrigger className='transition-all duration-200 focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'>
                          <SelectValue placeholder='Select an option' />
                        </SelectTrigger>
                        <SelectContent className='dark:border-gray-700 dark:bg-gray-800'>
                          {field.options?.map((option, optionIndex) => (
                            <SelectItem
                              key={optionIndex}
                              value={option}
                              className='cursor-pointer hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-700/50'
                            >
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {field.type === "FILE" && (
                      <div className='rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:border-primary/50 dark:border-gray-600 dark:hover:border-primary/30 sm:p-6'>
                        <Input
                          type='file'
                          className='hidden'
                          id={`file-${field.id}`}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const res = await handleFileUpload(
                                field.id!,
                                file
                              );
                              console.log("🚀 ~ FormPreview ~ file:", file);
                              setFormData((prev) => ({
                                ...prev,
                                [field.id!]: res,
                              }));
                            }
                          }}
                        />
                        <Label
                          htmlFor={`file-${field.id}`}
                          className='cursor-pointer text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary'
                        >
                          {(
                            typeof formData[field.id!] === "string"
                              ? JSON.parse(formData[field.id!]).url
                              : formData[field.id!]?.url
                          ) ? (
                            <div className='space-y-2'>
                              <div className='flex items-center justify-center gap-2'>
                                <FileText className='h-6 w-6' />
                                <span>{formData[field.id!].name}</span>
                                <a
                                  href={
                                    typeof formData[field.id!] === "string"
                                      ? JSON.parse(formData[field.id!]).url
                                      : ""
                                  }
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='ml-2 text-sm text-primary hover:text-primary/80'
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View
                                </a>
                              </div>
                              {uploadProgress[field.id!] < 100 && (
                                <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200'>
                                  <div
                                    className='h-full bg-primary transition-all duration-300'
                                    style={{
                                      width: `${uploadProgress[field.id!]}%`,
                                    }}
                                  />
                                </div>
                              )}
                              {uploadErrors[field.id!] && (
                                <p className='text-sm text-red-500'>
                                  {uploadErrors[field.id!]}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className='space-y-2'>
                              <Upload className='mx-auto h-6 w-6 sm:h-8 sm:w-8' />
                              <p className='text-sm sm:text-base'>
                                Click to upload or drag and drop
                              </p>
                            </div>
                          )}
                        </Label>
                      </div>
                    )}

                    {field.type === "IMAGE" && (
                      <div className='rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:border-primary/50 dark:border-gray-600 dark:hover:border-primary/30 sm:p-6'>
                        <Input
                          type='file'
                          accept='image/*'
                          multiple
                          className='hidden'
                          id={`image-${field.id}`}
                          onChange={async (e) => {
                            const files = Array.from(e.target.files || []);
                            console.log("🚀 ~ FormPreview ~ files:", files);
                            if (files.length > 0) {
                              // If it's the first upload, initialize as array
                              if (!Array.isArray(formData[field.id!])) {
                                handleInputChange(field.id!, []);
                              }
                              // Upload each file
                              for (const file of files) {
                                console.log("🚀 ~ FormPreview ~ file:", file);

                                const res = await handleFileUpload(
                                  field.id!,
                                  file
                                );

                                const newImages = [
                                  ...(formData[field.id!] || []),
                                  res,
                                ];
                                handleInputChange(field.id!, newImages);

                                console.log("🚀 ~ FormPreview ~ res:", res);
                              }
                            }
                          }}
                        />
                        <Label
                          htmlFor={`image-${field.id}`}
                          className='cursor-pointer text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary'
                        >
                          <ViewImage fieldId={field.id!} />
                        </Label>
                      </div>
                    )}

                    {field.type === "RATING" && (
                      <div className='flex space-x-1'>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "h-5 w-5 cursor-pointer transition-transform hover:scale-110 sm:h-6 sm:w-6",
                              star <= (formData[field.id!] || 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            )}
                            onClick={() => handleInputChange(field.id!, star)}
                          />
                        ))}
                      </div>
                    )}

                    {field.type === "SIGNATURE" && field.id && (
                      <div className='rounded-lg border-2 border-dashed border-gray-300 p-4 transition-colors hover:border-primary/50 dark:border-gray-600 dark:hover:border-primary/30 sm:p-6'>
                        <div className='space-y-4'>
                          <div className='h-24 overflow-hidden rounded-md bg-white dark:bg-gray-700 sm:h-32'>
                            <SignaturePad
                              ref={setSignaturePadRef(field.id)}
                              canvasProps={{
                                className: "w-full h-full",
                              }}
                              backgroundColor='rgb(255, 255, 255)'
                              penColor='rgb(0, 0, 0)'
                              minWidth={0.5}
                              maxWidth={2.5}
                              throttle={16}
                            />
                          </div>
                          <div className='flex justify-end gap-2'>
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              onClick={() => field.id && handleUndo(field.id)}
                              className='text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                            >
                              <Undo2 className='mr-2 h-4 w-4' />
                              Undo
                            </Button>
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              onClick={() => field.id && handleClear(field.id)}
                              className='text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                            >
                              <Trash2 className='mr-2 h-4 w-4' />
                              Clear
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {onSubmit && (
        <Button
          className='w-full bg-primary py-4 text-base font-medium transition-colors hover:bg-primary/90 sm:py-6 sm:text-lg'
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
              Submitting...
            </>
          ) : (
            "Submit Form"
          )}
        </Button>
      )}
    </div>
  );
}
