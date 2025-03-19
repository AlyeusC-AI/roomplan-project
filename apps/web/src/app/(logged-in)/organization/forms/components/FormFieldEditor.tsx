"use client";

import { useState } from "react";
import { FormField, FormFieldType } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FormFieldEditorProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onDelete: () => void;
}

interface Option {
  name: string;
  value: string;
  order?: number;
}

export function FormFieldEditor({ field, onUpdate, onDelete }: FormFieldEditorProps) {
  console.log("🚀 ~ FormFieldEditor ~ field:", field)
  const [options, setOptions] = useState<Option[]>(
    field.options?.map(opt => 
      typeof opt === 'string' 
        ? { name: opt, value: opt } 
        : opt
    ) || []
  );

  const handleFieldChange = (key: keyof FormField, value: any) => {
    onUpdate({
      ...field,
      [key]: value,
    });
  };

  const handleAddOption = () => {
    const newOption: Option = {
      name: `Option ${options.length + 1}`,
      value: `option-${options.length + 1}`,
      order: options.length + 1
    };
    const newOptions = [...options, newOption];
    setOptions(newOptions);
    handleFieldChange("options", newOptions);
  };

  const handleUpdateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = {
      ...newOptions[index],
      name: value,
      value: value.toLowerCase().replace(/\s+/g, '-')
    };
    setOptions(newOptions);
    handleFieldChange("options", newOptions);
  };

  const handleDeleteOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    handleFieldChange("options", newOptions);
  };

  return (
    <div className="space-y-6 p-6 border rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <Label className="text-base font-medium">Field Name</Label>
          <Input
            value={field.name}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            placeholder="Enter field name"
            className="text-base"
          />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="ml-4 hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete field</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-2">
        <Label className="text-base font-medium">Field Type</Label>
        <Select
          value={field.type}
          onValueChange={(value: FormFieldType) => handleFieldChange("type", value)}
        >
          <SelectTrigger className="text-base">
            <SelectValue placeholder="Select field type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TEXT">Text</SelectItem>
            <SelectItem value="TEXTAREA">Text Area</SelectItem>
            <SelectItem value="NUMBER">Number</SelectItem>
            <SelectItem value="DATE">Date</SelectItem>
            <SelectItem value="RADIO">Radio</SelectItem>
            <SelectItem value="CHECKBOX">Checkbox</SelectItem>
            <SelectItem value="SELECT">Select</SelectItem>
            <SelectItem value="FILE">File</SelectItem>
            <SelectItem value="IMAGE">Image</SelectItem>
            <SelectItem value="RATING">Rating</SelectItem>
            <SelectItem value="SIGNATURE">Signature</SelectItem>
            <SelectItem value="TIME">Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-3">
        <Switch
          checked={field.isRequired}
          onCheckedChange={(checked) => handleFieldChange("isRequired", checked)}
          className="data-[state=checked]:bg-primary"
        />
        <Label className="text-base font-medium">Required Field</Label>
      </div>

      {(field.type === "RADIO" || field.type === "CHECKBOX" || field.type === "SELECT") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Options</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddOption}
              className="hover:bg-primary/5 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Option
            </Button>
          </div>
          <div className="space-y-3">
            {options.map((option, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-3 group"
              >
                <Input
                  value={option.name}
                  onChange={(e) => handleUpdateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteOption(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete option</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 