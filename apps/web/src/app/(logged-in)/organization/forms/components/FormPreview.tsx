"use client";

import { Form } from "../types";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Star, StarHalf, FileText, Upload, Image, Trash2, Undo2 } from "lucide-react";
import SignaturePad from "react-signature-canvas";
import { useRef } from "react";

interface FormPreviewProps {
  form: Form | null;
}

export function FormPreview({ form }: FormPreviewProps) {
  const signaturePadRefs = useRef<{ [key: number]: SignaturePad | null }>({});

  const handleClear = (fieldId: number) => {
    signaturePadRefs.current[fieldId]?.clear();
  };

  const handleUndo = (fieldId: number) => {
    const pad = signaturePadRefs.current[fieldId];
    if (pad) {
      const data = pad.toData();
      if (data.length > 0) {
        pad.fromData(data.slice(0, -1));
      }
    }
  };

  const setSignaturePadRef = (fieldId: number) => (ref: SignaturePad | null) => {
    signaturePadRefs.current[fieldId] = ref;
  };

  if (!form) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
        <FileText className="w-12 h-12 mb-4 animate-pulse" />
        <p className="text-lg">Select a form to preview</p>
        <p className="text-sm mt-2">Choose a form from the list to see how it looks</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{form.name}</h2>
        {form.desc && (
          <p className="text-gray-600">{form.desc}</p>
        )}
      </div>

      <div className="space-y-6">
        {form.sections?.map((section, sectionIndex) => (
          <Card 
            key={sectionIndex} 
            className="p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <h3 className="text-lg font-semibold mb-6 text-gray-900">{section.name}</h3>
            <div className="space-y-6">
              {section.fields?.map((field, fieldIndex) => (
                <div 
                  key={fieldIndex} 
                  className="space-y-3 group"
                >
                  <Label className="flex items-center gap-2 text-base">
                    {field.name}
                    {field.isRequired && (
                      <span className="text-red-500 text-sm font-normal">(required)</span>
                    )}
                  </Label>

                  <div className="relative">
                    {field.type === "TEXT" && (
                      <Input className="transition-all duration-200 focus:ring-2 focus:ring-primary/20" />
                    )}

                    {field.type === "TEXTAREA" && (
                      <Textarea className="min-h-[100px] transition-all duration-200 focus:ring-2 focus:ring-primary/20" />
                    )}

                    {field.type === "NUMBER" && (
                      <Input 
                        type="number" 
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    )}

                    {field.type === "DATE" && (
                      <Input 
                        type="date" 
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    )}

                    {field.type === "TIME" && (
                      <Input 
                        type="time" 
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    )}

                    {field.type === "RADIO" && (
                      <RadioGroup className="space-y-3">
                        {field.options?.map((option, optionIndex) => (
                          <div 
                            key={optionIndex} 
                            className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-md transition-colors"
                          >
                            <RadioGroupItem 
                              value={option.value} 
                              id={`${field.id}-${optionIndex}`}
                              className="border-gray-300"
                            />
                            <Label 
                              htmlFor={`${field.id}-${optionIndex}`}
                              className="text-gray-700 cursor-pointer"
                            >
                              {option.name}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {field.type === "CHECKBOX" && (
                      <div className="space-y-3">
                        {field.options?.map((option, optionIndex) => (
                          <div 
                            key={optionIndex} 
                            className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-md transition-colors"
                          >
                            <Checkbox 
                              id={`${field.id}-${optionIndex}`}
                              className="border-gray-300"
                            />
                            <Label 
                              htmlFor={`${field.id}-${optionIndex}`}
                              className="text-gray-700 cursor-pointer"
                            >
                              {option.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}

                    {field.type === "SELECT" && (
                      <Select>
                        <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option, optionIndex) => (
                            <SelectItem 
                              key={optionIndex} 
                              value={option.value}
                              className="cursor-pointer hover:bg-gray-50"
                            >
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {field.type === "FILE" && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                        <Input type="file" className="hidden" id={`file-${field.id}`} />
                        <Label 
                          htmlFor={`file-${field.id}`}
                          className="cursor-pointer text-gray-600 hover:text-primary"
                        >
                          <div className="space-y-2">
                            <Upload className="w-8 h-8 mx-auto" />
                            <p>Click to upload or drag and drop</p>
                          </div>
                        </Label>
                      </div>
                    )}

                    {field.type === "IMAGE" && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                        <Input type="file" accept="image/*" className="hidden" id={`image-${field.id}`} />
                        <Label 
                          htmlFor={`image-${field.id}`}
                          className="cursor-pointer text-gray-600 hover:text-primary"
                        >
                          <div className="space-y-2">
                            <Image className="w-8 h-8 mx-auto" />
                            <p>Click to upload or drag and drop</p>
                          </div>
                        </Label>
                      </div>
                    )}

                    {field.type === "RATING" && (
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className="w-6 h-6 text-yellow-400 cursor-pointer hover:scale-110 transition-transform" 
                          />
                        ))}
                      </div>
                    )}

                    {field.type === "SIGNATURE" && field.id && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary/50 transition-colors">
                        <div className="space-y-4">
                          <div className="h-32 bg-white rounded-md overflow-hidden">
                            <SignaturePad
                              ref={setSignaturePadRef(field.id)}
                              canvasProps={{
                                className: "w-full h-full"
                              }}
                              backgroundColor="rgb(255, 255, 255)"
                              penColor="rgb(0, 0, 0)"
                              minWidth={0.5}
                              maxWidth={2.5}
                              throttle={16}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => field.id && handleUndo(field.id)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Undo2 className="w-4 h-4 mr-2" />
                              Undo
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => field.id && handleClear(field.id)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
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

      <Button 
        className="w-full py-6 text-lg font-medium bg-primary hover:bg-primary/90 transition-colors"
      >
        Submit Form
      </Button>
    </div>
  );
} 