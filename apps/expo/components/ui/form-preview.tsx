import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text } from "./text";
import { Input } from "./input";
import { Button } from "./button";
import { Card } from "./card";
import { Label } from "./label";
import { Textarea } from "./textarea";
import { RadioGroup } from "./radio-group";
import { Checkbox } from "./checkbox";
import { Select } from "./select";
import { FileText, Upload, Image as ImageIcon, Star } from "lucide-react-native";
import { cn } from "@/lib/utils";
import * as ImagePicker from 'expo-image-picker';
// import { DocumentResult, getDocumentAsync } from 'expo-document-picker';
import { uploadImage } from "@/lib/imagekit";

interface Form {
  id: string;
  name: string;
  desc?: string;
  sections?: Array<{
    id: string;
    name: string;
    fields: Array<{
      id: number;
      type: string;
      name: string;
      isRequired: boolean;
      options?: Array<{ value: string; name: string; }>;
    }>;
  }>;
}

interface FormPreviewProps {
  form: Form | null;
  onSubmit?: (formData: Record<string, any>) => Promise<void>;
  isSubmitting?: boolean;
  initialValues?: Record<string, any>;
}

export function FormPreview({ form, onSubmit, isSubmitting, initialValues = {} }: FormPreviewProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialValues);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<number, string>>({});

  const handleInputChange = (fieldId: number, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleFileUpload = async (fieldId: number, type: 'file' | 'image') => {
    try {
      let result: ImagePicker.ImagePickerResult 
      // | DocumentResult;
      
      if (type === 'image') {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (permissionResult.granted === false) {
          throw new Error('Permission to access media library is required!');
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });
      } else {
        // result = await getDocumentAsync({
        //   type: '*/*',
        //   copyToCacheDirectory: true,
        // });
      }

      if ('canceled' in result && result.canceled) {
        return;
      }

      const asset = type === 'image' 
        ? (result as ImagePicker.ImagePickerResult).assets[0]
        : (result as DocumentResult);

      setUploadProgress(prev => ({ ...prev, [fieldId]: 0 }));
      setUploadErrors(prev => ({ ...prev, [fieldId]: "" }));

      try {
        const uploadResult = await uploadImage(asset, {
          folder: "form-uploads",
          useUniqueFileName: true,
          tags: ["form-submission"]
        });

        const fileData = {
          url: uploadResult.url,
          name: uploadResult.name,
          size: uploadResult.size,
          fileId: uploadResult.fileId,
          filePath: uploadResult.filePath
        };

        setFormData(prev => ({
          ...prev,
          [fieldId]: fileData
        }));

        setUploadProgress(prev => ({ ...prev, [fieldId]: 100 }));
      } catch (error) {
        console.error("Upload error:", error);
        setUploadErrors(prev => ({
          ...prev,
          [fieldId]: "Failed to upload file. Please try again."
        }));
        setUploadProgress(prev => ({ ...prev, [fieldId]: 0 }));
      }
    } catch (error) {
      console.error("File selection error:", error);
      setUploadErrors(prev => ({
        ...prev,
        [fieldId]: "Failed to select file. Please try again."
      }));
    }
  };

  const handleSubmit = async () => {
    if (!onSubmit) return;
    await onSubmit(formData);
  };

  if (!form) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <FileText className="w-12 h-12 mb-4 text-muted-foreground" />
        <Text className="text-lg text-muted-foreground">Select a form to preview</Text>
        <Text className="text-sm text-muted-foreground mt-2">Choose a form from the list to see how it looks</Text>
      </View>
    );
  }

  const sections = form.sections ?? [];

  return (
    <ScrollView className="flex-1">
      <View className="space-y-6 px-4 py-6">
        <View className="space-y-2">
          <Text className="text-xl font-bold">{form.name}</Text>
          {form.desc && (
            <Text className="text-muted-foreground">{form.desc}</Text>
          )}
        </View>

        <View className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <Card key={section.id} className="p-4">
              <Text className="text-lg font-semibold mb-4">{section.name}</Text>
              <View className="space-y-4">
                {section.fields.map((field, fieldIndex) => (
                  <View key={field.id} className="space-y-2">
                    <Label className="flex-row items-center gap-2">
                      <Text>{field.name}</Text>
                      {field.isRequired && (
                        <Text className="text-xs text-destructive">(required)</Text>
                      )}
                    </Label>

                    <View>
                      {field.type === "TEXT" && (
                        <Input
                          value={formData[field.id] || ""}
                          onChangeText={(value: string) => handleInputChange(field.id, value)}
                          placeholder="Enter text"
                        />
                      )}

                      {field.type === "TEXTAREA" && (
                        <Textarea
                          value={formData[field.id] || ""}
                          onChangeText={(value: string) => handleInputChange(field.id, value)}
                          placeholder="Enter text"
                          className="min-h-[100px]"
                        />
                      )}

                      {field.type === "NUMBER" && (
                        <Input
                          keyboardType="numeric"
                          value={formData[field.id]?.toString() || ""}
                          onChangeText={(value: string) => handleInputChange(field.id, value)}
                          placeholder="Enter number"
                        />
                      )}

                      {field.type === "DATE" && (
                        <Input
                          value={formData[field.id] || ""}
                          onChangeText={(value: string) => handleInputChange(field.id, value)}
                          placeholder="Select date"
                        />
                      )}

                      {field.type === "TIME" && (
                        <Input
                          value={formData[field.id] || ""}
                          onChangeText={(value: string) => handleInputChange(field.id, value)}
                          placeholder="Select time"
                        />
                      )}

                      {field.type === "RADIO" && (
                        <RadioGroup
                          value={formData[field.id] || ""}
                          onValueChange={(value: string) => handleInputChange(field.id, value)}
                          options={field.options || []}
                        />
                      )}

                      {field.type === "CHECKBOX" && field.options && (
                        <View className="space-y-2">
                          {field.options.map((option, optionIndex) => (
                            <Checkbox
                              key={optionIndex}
                              checked={formData[field.id]?.includes(option.value)}
                              onCheckedChange={(checked) => {
                                const currentValues: string[] = formData[field.id] || [];
                                const newValues = checked
                                  ? [...currentValues, option.value]
                                  : currentValues.filter(v => v !== option.value);
                                handleInputChange(field.id, newValues);
                              }}
                            >
                              <Text className="ml-2">{option.name}</Text>
                            </Checkbox>
                          ))}
                        </View>
                      )}

                      {field.type === "SELECT" && (
                        <Select
                          value={formData[field.id] || ""}
                          onValueChange={(value: string) => handleInputChange(field.id, value)}
                          placeholder="Select an option"
                          options={field.options || []}
                        />
                      )}

                      {field.type === "FILE" && (
                        <TouchableOpacity
                          onPress={() => handleFileUpload(field.id, 'file')}
                          className="border-2 border-dashed border-border rounded-lg p-4 items-center"
                        >
                          {formData[field.id]?.url ? (
                            <View className="space-y-2 w-full">
                              <View className="flex-row items-center justify-center gap-2">
                                <FileText className="w-6 h-6 text-foreground" />
                                <Text className="text-foreground">{formData[field.id].name}</Text>
                              </View>
                              {uploadProgress[field.id] < 100 && (
                                <View className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                  <View
                                    className="h-full bg-primary"
                                    style={{ width: `${uploadProgress[field.id]}%` }}
                                  />
                                </View>
                              )}
                              {uploadErrors[field.id] && (
                                <Text className="text-sm text-destructive">{uploadErrors[field.id]}</Text>
                              )}
                            </View>
                          ) : (
                            <View className="space-y-2">
                              <Upload className="w-8 h-8 text-muted-foreground" />
                              <Text className="text-muted-foreground">Tap to upload file</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      )}

                      {field.type === "IMAGE" && (
                        <TouchableOpacity
                          onPress={() => handleFileUpload(field.id, 'image')}
                          className="border-2 border-dashed border-border rounded-lg p-4 items-center"
                        >
                          {formData[field.id]?.url ? (
                            <View className="space-y-2 w-full">
                              <View className="w-full aspect-video">
                                <Image
                                  source={{ uri: formData[field.id].url }}
                                  className="rounded-lg w-full h-full"
                                  resizeMode="cover"
                                />
                              </View>
                              {uploadProgress[field.id] < 100 && (
                                <View className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                  <View
                                    className="h-full bg-primary"
                                    style={{ width: `${uploadProgress[field.id]}%` }}
                                  />
                                </View>
                              )}
                              {uploadErrors[field.id] && (
                                <Text className="text-sm text-destructive">{uploadErrors[field.id]}</Text>
                              )}
                            </View>
                          ) : (
                            <View className="space-y-2">
                              <ImageIcon className="w-8 h-8 text-muted-foreground" />
                              <Text className="text-muted-foreground">Tap to upload image</Text>
                              <Text className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      )}

                      {field.type === "RATING" && (
                        <View className="flex-row gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                              key={star}
                              onPress={() => handleInputChange(field.id, star)}
                            >
                              <Star
                                className={cn(
                                  "w-6 h-6",
                                  star <= (formData[field.id] || 0)
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-muted"
                                )}
                              />
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          ))}
        </View>

        {onSubmit && (
          <Button
            onPress={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4"
          >
            <Text className="text-white text-base font-medium">
              {isSubmitting ? "Submitting..." : "Submit Form"}
            </Text>
          </Button>
        )}
      </View>
    </ScrollView>
  );
} 