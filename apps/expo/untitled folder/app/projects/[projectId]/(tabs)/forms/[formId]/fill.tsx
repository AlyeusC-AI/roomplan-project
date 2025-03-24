import React, { useEffect, useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Pressable, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, Button, Card, VStack, HStack, Icon, useToast, Box, FormControl } from 'native-base';
import { useFormsStore, Form, FormField } from '@/lib/state/forms';
import { Calendar, CheckSquare, Radio, Type, Hash, FileText, Image as ImageIcon, Star, PenTool, ChevronLeft, ChevronRight, X, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import SignatureCanvas from 'react-native-signature-canvas';
import { api } from '@/lib/api';
import DateTimePicker, { DateType, useDefaultStyles } from 'react-native-ui-datepicker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Modal } from '@/components/ui/modal';
import dayjs from 'dayjs';
import { uploadImage } from '@/lib/imagekit';

interface FormResponse {
  formId: string;
  projectId: string;
  data: Record<string, any>;
  submittedAt: string;
}

interface FormSection {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
}

interface FormOption {
  value: string;
  name: string;
}

const DateInput: React.FC<{
  label?: string;
  value: DateType;
  onChange: (date: DateType) => void;
  error?: string;
}> = ({ label, value, onChange, error }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<DateType>(value);
  const defaultStyles = useDefaultStyles();

  useEffect(() => {
    setTempDate(value);
  }, [value]);

  const handleConfirm = () => {
    onChange(tempDate);
    setShowPicker(false);
  };

  return (
    <Box>
    {label && <FormControl.Label>{label}</FormControl.Label>}
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'white',
          borderRadius: 8,
          padding: 12,
          borderWidth: 1,
          borderColor: error ? '#ef4444' : '#e2e8f0',
        }}
      >
        <Text style={{ fontSize: 16, color: '#1d1d1d' }}>
          {dayjs(value).format('MMM D, YYYY')}
        </Text>
        <Calendar color="#64748b" size={20} />
      </TouchableOpacity>

      <Modal isOpen={showPicker} onClose={() => setShowPicker(false)}>
        <Box style={{
          padding: 16,
          backgroundColor: 'white',
          borderRadius: 12,
        }}>
          <HStack justifyContent="space-between" alignItems="center" mb={4}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1d1d1d' }}>
              {label}
            </Text>
            <Pressable onPress={() => setShowPicker(false)}>
              <X color="#64748b" size={20} />
            </Pressable>
          </HStack>
          <Box style={{
            backgroundColor: 'white',
            borderRadius: 8,
            height: 350,
          }}>
            <DateTimePicker
              use12Hours={true}
              mode="single"
              minDate={dayjs().toDate()}
              maxDate={dayjs().endOf('year').toDate()}
              components={{
                IconNext: <ChevronRight color="#1d4ed8" size={28} />,
                IconPrev: <ChevronLeft color="#1d4ed8" size={28} />,
              }}
              onChange={(params: { date: DateType }) => {
                setTempDate(params.date);
              }}
              styles={{
                ...defaultStyles,
                selected: {
                  ...defaultStyles.selected,
                  color: '#1d4ed8',
                  backgroundColor: '#1d4ed8',
                },
                selected_month: {
                  ...defaultStyles.selected_month,
                  color: '#1d4ed8',
                  backgroundColor: '#1d4ed8',
                },
                selected_year: {
                  ...defaultStyles.selected_year,
                  color: '#1d4ed8',
                  backgroundColor: '#1d4ed8',
                },
              }}
              date={tempDate}
            />
          </Box>
          <HStack space={2} mt={4}>
            <Button
              variant="outline"
              onPress={() => setShowPicker(false)}
              style={{
                flex: 1,
                height: 45,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#1d4ed8',
              }}
            >
              <Text style={{ color: '#1d4ed8', fontSize: 16, fontWeight: '600' }}>
                Cancel
              </Text>
            </Button>
            <Button
              onPress={handleConfirm}
              style={{
                flex: 1,
                height: 45,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 8,
                backgroundColor: '#1d4ed8',
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                Confirm
              </Text>
            </Button>
          </HStack>
        </Box>
      </Modal>
    </Box>
  );
};

const TimeInput: React.FC<{
  label?: string;
  value: DateType;
  onChange: (date: DateType) => void;
  error?: string;
}> = ({ label, value, onChange, error }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempTime, setTempTime] = useState<DateType>(value);
  const defaultStyles = useDefaultStyles();

  useEffect(() => {
    setTempTime(value);
  }, [value]);

  const handleConfirm = () => {
    onChange(tempTime);
    setShowPicker(false);
  };

  return (
    <Box>
      {label && <FormControl.Label>{label}</FormControl.Label>}
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'white',
          borderRadius: 8,
          padding: 12,
          borderWidth: 1,
          borderColor: error ? '#ef4444' : '#e2e8f0',
        }}
      >
        <Text style={{ fontSize: 16, color: '#1d1d1d' }}>
          {dayjs(value).format('h:mm A')}
        </Text>
        <Calendar color="#64748b" size={20} />
      </TouchableOpacity>

      <Modal isOpen={showPicker} onClose={() => setShowPicker(false)}>
        <Box style={{
          padding: 16,
          backgroundColor: 'white',
          borderRadius: 12,
        }}>
          <HStack justifyContent="space-between" alignItems="center" mb={4}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1d1d1d' }}>
              {label}
            </Text>
            <Pressable onPress={() => setShowPicker(false)}>
              <X color="#64748b" size={20} />
            </Pressable>
          </HStack>
          <Box style={{
            backgroundColor: 'white',
            borderRadius: 8,
            height: 350,
          }}>
            <DateTimePicker
              use12Hours={true}
              mode="single"
              timePicker
              minDate={dayjs().toDate()}
              maxDate={dayjs().endOf('day').toDate()}
              components={{
                IconNext: <ChevronRight color="#1d4ed8" size={28} />,
                IconPrev: <ChevronLeft color="#1d4ed8" size={28} />,
              }}
              onChange={(params: { date: DateType }) => {
                setTempTime(params.date);
              }}
              styles={{
                ...defaultStyles,
                selected: {
                  ...defaultStyles.selected,
                  color: '#1d4ed8',
                  backgroundColor: '#1d4ed8',
                },
                selected_month: {
                  ...defaultStyles.selected_month,
                  color: '#1d4ed8',
                  backgroundColor: '#1d4ed8',
                },
                selected_year: {
                  ...defaultStyles.selected_year,
                  color: '#1d4ed8',
                  backgroundColor: '#1d4ed8',
                },
              }}
              date={tempTime}
            />
          </Box>
          <HStack space={2} mt={4}>
            <Button
              variant="outline"
              onPress={() => setShowPicker(false)}
              style={{
                flex: 1,
                height: 45,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#1d4ed8',
              }}
            >
              <Text style={{ color: '#1d4ed8', fontSize: 16, fontWeight: '600' }}>
                Cancel
              </Text>
            </Button>
            <Button
              onPress={handleConfirm}
              style={{
                flex: 1,
                height: 45,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 8,
                backgroundColor: '#1d4ed8',
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                Confirm
              </Text>
            </Button>
          </HStack>
        </Box>
      </Modal>
    </Box>
  );
};

export default function FormFillScreen() {
  const { formId, projectId, responseId, cameraResult } = useLocalSearchParams();
  const router = useRouter();
  const toast = useToast();
  const { getForm } = useFormsStore();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const isEditMode = !!responseId;

  // Handle camera result
  useEffect(() => {
    if (cameraResult) {
      const { fieldId, imageData } = JSON.parse(cameraResult as string);
      if (fieldId && imageData) {
        handleInputChange(fieldId, imageData);
      }
    }
  }, [cameraResult]);

  useEffect(() => {
    loadForm();
  }, [formId]);

  const loadForm = async () => {
    try {
      const formData = await getForm(projectId as string, formId as string);
      setForm(formData);
      
      // If in edit mode, load the existing response data
      if (isEditMode) {
        const response = await api.get(`/api/v1/projects/${projectId}/forms/responses/${responseId}`);
        setFormData(response.data.data);
      }
      
      setLoading(false);
    } catch (error) {
      toast.show({
        title: 'Error',
        description: 'Failed to load form',
        variant: 'error',
      });
      router.back();
    }
  };

  const handleInputChange = (fieldId: number, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    setErrors(prev => ({ ...prev, [fieldId]: '' }));
  };

  const handleImagePick = async (fieldId: number) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const image = result.assets[0];
        setUploadProgress(prev => ({ ...prev, [fieldId]: 0 }));
        
        // Upload to ImageKit
        const uploadResult = await uploadImage({
          uri: image.uri,
          type: 'image/jpeg',
          name: 'image.jpg',
        }, {
          folder: 'form-uploads',
          useUniqueFileName: true,
          tags: ['form-submission']
        }, (progress) => {
          setUploadProgress(prev => ({ ...prev, [fieldId]: progress }));
        });

        // Store file data in a format that can be easily displayed
        const fileData = {
          url: uploadResult.url,
          name: 'image.jpg',
          size: uploadResult.size,
          type: 'image/jpeg',
          fileId: uploadResult.fileId,
          filePath: uploadResult.filePath
        };

        handleInputChange(fieldId, fileData);
        setUploadProgress(prev => ({ ...prev, [fieldId]: 100 }));
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to upload image. Please try again.',
        variant: 'error',
      });
      setUploadProgress(prev => ({ ...prev, [fieldId]: 0 }));
    }
  };

  const handleDocumentPick = async (fieldId: number) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
      });

      if (!result.canceled) {
        handleInputChange(fieldId, {
          uri: result.assets[0].uri,
          type: result.assets[0].mimeType,
          name: result.assets[0].name,
        });
      }
    } catch (error) {
      toast.show({
        title: 'Error',
        description: 'Failed to pick document',
        variant: 'error',
      });
    }
  };

  const handleSignatureSave = (signature: string) => {
    const fieldId = Object.keys(formData).find(key => formData[key] === undefined);
    if (fieldId) {
      handleInputChange(parseInt(fieldId), signature);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    form?.sections?.forEach((section: FormSection) => {
      section.fields.forEach((field: FormField) => {
        if (field.isRequired && !formData[field.id]) {
          newErrors[field.id] = 'This field is required';
        }
      });
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.show({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'error',
      });
      return;
    }

    setSubmitting(true);
    try {
      const response: FormResponse = {
        formId: formId as string,
        // projectId: projectId as string,
        data: formData,
        // submittedAt: new Date().toISOString(),
      };

      if (isEditMode) {
        // Update existing response
        await api.put(`/api/v1/projects/${projectId}/forms/responses/${responseId}`, {
          data: formData,
        });
        toast.show({
          title: 'Success',
          description: 'Form response updated successfully',
          variant: 'success',
        });
      } else {
        // Create new response
        await api.post(`/api/v1/projects/${projectId}/forms/responses`, response);
        toast.show({
          title: 'Success',
          description: 'Form submitted successfully',
          variant: 'success',
        });
      }
      
      router.back();
    } catch (error) {
      console.log("🚀 ~ handleSubmit ~ error:", error.response)
      toast.show({
        title: 'Error',
        description: isEditMode ? 'Failed to update form' : 'Failed to submit form',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const error = errors[field.id];
    const value = formData[field.id];

    switch (field.type) {
      case 'TEXT':
        return (
          <Input
            value={value}
            onChangeText={(text) => handleInputChange(field.id, text)}
            placeholder="Enter text"
            className={error ? "border-red-500" : ""}
          />
        );

      case 'TEXTAREA':
        return (
          <Textarea
            value={value}
            onChangeText={(text) => handleInputChange(field.id, text)}
            placeholder="Enter text"
            className={error ? "border-red-500" : ""}
          />
        );

      case 'NUMBER':
        return (
          <Input
            value={value}
            onChangeText={(text) => handleInputChange(field.id, text)}
            placeholder="Enter number"
            keyboardType="numeric"
            className={error ? "border-red-500" : ""}
          />
        );

      case 'DATE':
        return (
          <DateInput
            // label={field.name}
            value={value ? new Date(value) : new Date()}
            onChange={(date) => {
              if (date) {
                const selectedDate = dayjs(date).toDate();
                handleInputChange(field.id, selectedDate.toISOString());
              }
            }}
            error={error}
          />
        );

      case 'TIME':
        return (
          <TimeInput
            // label={field.name}
            value={value ? new Date(value) : new Date()}
            onChange={(time) => {
              if (time) {
                const selectedTime = dayjs(time).toDate();
                handleInputChange(field.id, selectedTime.toISOString());
              }
            }}
            error={error}
          />
        );

      case 'RADIO':
        return (
          <RadioGroup
            value={value || ''}
            onValueChange={(newValue) => handleInputChange(field.id, newValue)}
            options={field.options || []}
          />
        );

      case 'CHECKBOX':
        return (
          <VStack space={2}>
            {field.options?.map((option: FormOption) => (
              <TouchableOpacity 
                onPress={() => {
                  const currentValue = value || []; 
                  const newValue = currentValue.includes(option.value)
                    ? currentValue.filter((v: string) => v !== option.value)
                    : [...currentValue, option.value];
                  handleInputChange(field.id, newValue);
                }}
                key={option.value} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
                <Checkbox
                  checked={(value || []).includes(option.value)}
                  onCheckedChange={(checked) => {
                    const currentValue = value || [];
                    const newValue = checked
                      ? [...currentValue, option.value]
                      : currentValue.filter((v: string) => v !== option.value);
                    handleInputChange(field.id, newValue);
                  }}
                />
                <Text ml={2} color="gray.700">{option.name}</Text>
              </TouchableOpacity>
            ))}
          </VStack>
        );

      case 'SELECT':
        return (
          <Select
            value={value || ''}
            onValueChange={(newValue) => handleInputChange(field.id, newValue)}
            placeholder="Select option"
            options={field.options || []}
          />
        );

      case 'FILE':
        return (
          <TouchableOpacity
            onPress={() => handleDocumentPick(field.id)}
            style={{
              borderWidth: 1,
              borderColor: error ? '#ef4444' : '#e5e7eb',
              borderRadius: 8,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#ffffff',
            }}
          >
            <Icon as={FileText} size="sm" color="gray.500" />
            <Text ml={2} color={value ? 'gray.800' : 'gray.500'}>
              {value?.name || 'Select file'}
            </Text>
          </TouchableOpacity>
        );

      case 'IMAGE':
        return (
          <VStack space={2}>
            <HStack space={2}>
              <TouchableOpacity
                onPress={() => handleImagePick(field.id)}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: error ? '#ef4444' : '#e5e7eb',
                  borderRadius: 8,
                  padding: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                }}
              >
                <Icon as={ImageIcon} size="sm" color="gray.500" />
                <Text ml={2} color={value ? 'gray.800' : 'gray.500'}>
                  {value ? 'Change image' : 'Choose from gallery'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  router.push({
                    pathname: `/projects/${projectId}/camera`,
                    params: {
                      formId,
                      fieldId: field.id,
                      mode: 'form'
                    }
                  });
                }}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: error ? '#ef4444' : '#e5e7eb',
                  borderRadius: 8,
                  padding: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                }}
              >
                <Icon as={Camera} size="sm" color="gray.500" />
                <Text ml={2} color="gray.500">
                  Take photo
                </Text>
              </TouchableOpacity>
            </HStack>

            {value && (
              <View style={{
                marginTop: 8,
                borderRadius: 8,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}>
                <Image
                  source={{ uri: value.url }}
                  style={{
                    width: '100%',
                    height: 200,
                    resizeMode: 'cover',
                  }}
                />
                <View style={{
                  padding: 8,
                  backgroundColor: '#f8fafc',
                  borderTopWidth: 1,
                  borderTopColor: '#e5e7eb',
                }}>
                  <Text color="gray.600" fontSize="sm">
                    {value.name}
                  </Text>
                  <Text color="gray.500" fontSize="xs">
                    {(value.size / 1024).toFixed(2)} KB
                  </Text>
                </View>
              </View>
            )}
          </VStack>
        );

      case 'RATING':
        return (
          <HStack space={2}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => handleInputChange(field.id, star)}
                style={{
                  padding: 4,
                }}
              >
                <Icon
                  as={Star}
                  size="sm"
                  color={value >= star ? '#fbbf24' : '#e5e7eb'}
                />
              </TouchableOpacity>
            ))}
          </HStack>
        );

      case 'SIGNATURE':
        return (
          <View style={{ 
            height: 200, 
            borderWidth: 1, 
            borderColor: error ? '#ef4444' : '#e5e7eb', 
            borderRadius: 8,
            backgroundColor: '#ffffff',
            overflow: 'hidden'
          }}>
            <SignatureCanvas
              onOK={handleSignatureSave}
              descriptionText="Sign here"
              clearText="Clear"
              confirmText="Save"
            />
          </View>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!form) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Form not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <VStack space={6} p={4}>
        <VStack space={2}>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            {form.name}
          </Text>
          {form.description && (
            <Text color="gray.500" fontSize="md">
              {form.description}
            </Text>
          )}
        </VStack>

        {form.sections?.map((section: FormSection) => (
          <VStack key={section.id} space={4}>
            <VStack space={1}>
              <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                {section.name}
              </Text>
              {section.description && (
                <Text color="gray.500" fontSize="sm">
                  {section.description}
                </Text>
              )}
            </VStack>
            <VStack space={5}>
              {section.fields.map((field: FormField) => (
                <VStack key={field.id} space={2}>
                  <HStack space={1} alignItems="center">
                    <Text fontWeight="medium" color="gray.700">
                      {field.name}
                    </Text>
                    {field.isRequired && (
                      <Text color="red.500" fontSize="sm">*</Text>
                    )}
                  </HStack>
                  {renderField(field)}
                  {errors[field.id] && (
                    <Text color="red.500" fontSize="sm">
                      {errors[field.id]}
                    </Text>
                  )}
                </VStack>
              ))}
            </VStack>
          </VStack>
        ))}

        <Button
          onPress={handleSubmit}
          isLoading={submitting}
          isLoadingText={isEditMode ? "Updating..." : "Submitting..."}
          size="lg"
          colorScheme="blue"
          mt={4}
          _pressed={{ opacity: 0.9 }}
        >
          {isEditMode ? "Update Form" : "Submit Form"}
        </Button>
      </VStack>
    </ScrollView>
  );
} 