import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  ActionSheetIOS,
} from "react-native";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronDown, X, Droplets } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import * as ImagePicker from "expo-image-picker";
import { uploadImage } from "@/lib/imagekit";
import {
  WATER_DAMAGE_CATEGORIES,
  WaterDamageTypeSelectorProps,
} from "@/app/projects/[projectId]/details";
import { Box, FormControl, HStack, VStack } from "native-base";
import { Pressable } from "react-native";
import { useGetProjectById, useUpdateProject } from "@service-geek/api-client";
import { Colors } from "@/constants/Colors";

const XIcon = X as any;
const ChevronDownIcon = ChevronDown as any;
const DropletsIcon = Droplets as any;

// Define WaterDamageClass type
type WaterDamageClass = "Class 1" | "Class 2" | "Class 3" | "Class 4";

// Water damage classes with descriptions
const WATER_DAMAGE_CLASSES = [
  { label: "Class 1 – Minimal Damage", value: "Class 1" as WaterDamageClass },
  {
    label: "Class 2 – Significant Damage",
    value: "Class 2" as WaterDamageClass,
  },
  { label: "Class 3 – Extensive Damage", value: "Class 3" as WaterDamageClass },
  { label: "Class 4 – Specialty Drying", value: "Class 4" as WaterDamageClass },
];

interface WaterDamageClassSelectorProps {
  value?: WaterDamageClass;
  onChange: (value: WaterDamageClass) => void;
  style?: any;
}

function WaterDamageClassSelector({
  value,
  onChange,
  style,
}: WaterDamageClassSelectorProps) {
  return (
    <Box style={style}>
      <FormControl.Label>Class of Water</FormControl.Label>
      <VStack space={3} mt={2}>
        {WATER_DAMAGE_CLASSES.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.radioOption,
              value === type.value && styles.selectedRadioOption,
            ]}
            onPress={() => {
              onChange(type.value);
            }}
          >
            <View style={styles.radioContainer}>
              <View
                style={[
                  styles.radioButton,
                  value === type.value && styles.selectedRadioButton,
                ]}
              >
                {value === type.value && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <View style={styles.radioContent}>
                <HStack space={2} alignItems="center" mb={1}>
                  <DropletsIcon
                    size={16}
                    color={
                      value === type.value ? Colors.light.primary : "#94a3b8"
                    }
                  />
                  <Text
                    style={[
                      styles.radioLabel,
                      value === type.value && styles.selectedRadioLabel,
                    ]}
                  >
                    {type.label}
                  </Text>
                </HStack>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </VStack>
    </Box>
  );
}

// Define styles first to avoid reference errors
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 0,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 0,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1d1d1d",
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 8,
    minHeight: 80,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
    textAlignVertical: "top",
  },
  imageWrapper: {
    position: "relative",
    marginRight: 8,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#eee",
    marginRight: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  addImageButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fafafa",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  // New styles for full screen modal and radio buttons
  fullScreenModal: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 60, // Account for status bar
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1d1d1d",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  radioOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  selectedRadioOption: {
    borderColor: Colors.light.primary,
    backgroundColor: "#eff6ff",
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#d1d5db",
    marginRight: 12,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedRadioButton: {
    borderColor: Colors.light.primary,
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
  },
  radioContent: {
    flex: 1,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1d1d1d",
  },
  selectedRadioLabel: {
    color: Colors.light.primary,
  },
  radioDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginLeft: 24, // Align with the text after the icon
  },
  selectedRadioDescription: {
    color: "#374151",
  },
  cancelButton: {
    width: "100%",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6b7280",
  },
  sectionInput: {
    marginTop: 16,
  },
  continueButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 20,
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
});

// Enhanced water damage categories with descriptions
const WATER_DAMAGE_CATEGORIES_WITH_DESCRIPTIONS = [
  {
    label: "Category 1",
    value: "Category 1" as const,
    description:
      "Water from a clean and sanitary source that poses no health risk through skin contact, ingestion, or inhalation.",
  },
  {
    label: "Category 2",
    value: "Category 2" as const,
    description:
      "Water that is moderately contaminated and may cause illness if touched or consumed.",
  },
  {
    label: "Category 3",
    value: "Category 3" as const,
    description:
      "Heavily contaminated water containing harmful agents such as pathogens or toxins. Can cause serious health effects if touched or ingested.",
  },
];

function WaterDamageCategorySelector({
  value,
  onChange,
  style,
}: WaterDamageTypeSelectorProps) {
  return (
    <Box style={style}>
      <FormControl.Label>Category of Water</FormControl.Label>
      <VStack space={3} mt={2}>
        {WATER_DAMAGE_CATEGORIES_WITH_DESCRIPTIONS.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.radioOption,
              value === type.value && styles.selectedRadioOption,
            ]}
            onPress={() => {
              onChange(type.value as any);
            }}
          >
            <View style={styles.radioContainer}>
              <View
                style={[
                  styles.radioButton,
                  value === type.value && styles.selectedRadioButton,
                ]}
              >
                {value === type.value && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <View style={styles.radioContent}>
                <HStack space={2} alignItems="center" mb={1}>
                  <DropletsIcon
                    size={16}
                    color={
                      value === type.value ? Colors.light.primary : "#94a3b8"
                    }
                  />
                  <Text
                    style={[
                      styles.radioLabel,
                      value === type.value && styles.selectedRadioLabel,
                    ]}
                  >
                    {type.label}
                  </Text>
                </HStack>
                <Text
                  style={[
                    styles.radioDescription,
                    value === type.value && styles.selectedRadioDescription,
                  ]}
                >
                  {type.description}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </VStack>
    </Box>
  );
}

interface ClaimSummaryEditorProps {
  visible: boolean;
  onClose: () => void;
  projectId: string;
  asModal?: boolean; // new prop
  onTakePhoto?: () => void; // new prop
}

export const ClaimSummaryEditor: React.FC<ClaimSummaryEditorProps> = ({
  visible,
  onClose,
  projectId,
  asModal = true,
  onTakePhoto,
}) => {
  const { data: project } = useGetProjectById(projectId);
  const updateProjectMutation = useUpdateProject();
  const [summary, setSummary] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [localWaterDamageCategory, setLocalWaterDamageCategory] = useState("");
  const [localWaterClass, setLocalWaterClass] = useState<
    WaterDamageClass | undefined
  >();
  const [uploading, setUploading] = useState(false);

  // Sync local state with project data
  useEffect(() => {
    if (project?.data) {
      setSummary(project.data.claimSummary || "");
      setImages(project.data.claimSummaryImages || []);
      setLocalWaterDamageCategory(project.data.catCode || "");
      setLocalWaterClass(project.data.waterClass as WaterDamageClass);
    }
  }, [project?.data]);

  // Removed auto-save - now using Continue button to save everything

  // Auto-save water damage category when it changes
  // Removed auto-save - now using Continue button to save

  const pickImages = async () => {
    setUploading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
      });
      if (!result.canceled && result.assets) {
        const uploadedUrls: string[] = [];
        for (const asset of result.assets) {
          const response = await uploadImage(asset, {
            folder: `projects/${projectId}/claim-summary`,
            useUniqueFileName: true,
            tags: [`project-${projectId}`, "claim-summary"],
          });
          uploadedUrls.push(response.url);
        }
        setImages((prev) => [...prev, ...uploadedUrls]);
      }
    } catch (e) {
      // handle error
    } finally {
      setUploading(false);
    }
  };

  // const handleRemoveImage = (idx: number) => {
  //   Alert.alert("Remove Image", "Are you sure you want to remove this image?", [
  //     { text: "Cancel", style: "cancel" },
  //     {
  //       text: "Remove",
  //       style: "destructive",
  //       onPress: () => {
  //         setImages((prev) => prev.filter((_, i) => i !== idx));
  //       },
  //     },
  //   ]);
  // };

  // const handleAddImage = () => {
  //   if (onTakePhoto) {
  //     if (Platform.OS === "ios") {
  //       ActionSheetIOS.showActionSheetWithOptions(
  //         {
  //           options: ["Take Photo(s)", "Pick from Gallery", "Cancel"],
  //           cancelButtonIndex: 2,
  //         },
  //         (buttonIndex) => {
  //           if (buttonIndex === 0) {
  //             onTakePhoto();
  //           } else if (buttonIndex === 1) {
  //             pickImages();
  //           }
  //         }
  //       );
  //     } else {
  //       // Android: simple prompt
  //       // For simplicity, just pick from gallery or call onTakePhoto
  //       // You can use a custom modal if you want
  //       // Here, just call pickImages for now, or implement a picker
  //       pickImages();
  //     }
  //   } else {
  //     pickImages();
  //   }
  // };

  if (asModal) {
    if (!visible) return null;
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={onClose}
      >
        <View style={styles.fullScreenModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Document Source of Loss</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <XIcon size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>Claim Summary</Text>
            <TextInput
              value={summary}
              onChangeText={setSummary}
              placeholder="Describe the source of loss..."
              multiline
              numberOfLines={4}
              style={styles.textInput}
            />

            <WaterDamageCategorySelector
              value={localWaterDamageCategory as any}
              onChange={(value) => setLocalWaterDamageCategory(value)}
              style={styles.sectionInput}
            />

            <WaterDamageClassSelector
              value={localWaterClass}
              onChange={(value) => setLocalWaterClass(value)}
              style={styles.sectionInput}
            />

            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => {
                // Save all changes at once
                const updates: any = {};

                // Check if claim summary changed
                if (summary !== project?.data?.claimSummary) {
                  updates.claimSummary = summary;
                }

                // Check if images changed
                if (
                  JSON.stringify(images) !==
                  JSON.stringify(project?.data?.claimSummaryImages)
                ) {
                  updates.claimSummaryImages = images;
                }

                // Check if water damage category changed
                if (localWaterDamageCategory !== project?.data?.catCode) {
                  updates.catCode = localWaterDamageCategory;
                }

                // Check if water class changed
                if (localWaterClass !== project?.data?.waterClass) {
                  updates.waterClass = localWaterClass;
                }

                // Only save if there are changes
                if (Object.keys(updates).length > 0) {
                  updateProjectMutation.mutate({
                    id: projectId,
                    data: updates,
                  });
                }

                onClose();
              }}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>

            {/* <Text style={[styles.label, { marginTop: 16 }]}>Images</Text>
            <ScrollView horizontal style={{ marginVertical: 8 }}>
              {images.map((url, idx) => (
                <View key={idx} style={styles.imageWrapper}>
                  <Image source={{ uri: url }} style={styles.image} />
                  <TouchableOpacity
                    onPress={() => handleRemoveImage(idx)}
                    style={styles.removeImageButton}
                  >
                    <XIcon size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                onPress={handleAddImage}
                style={[styles.image, styles.addImageButton]}
                disabled={uploading}
              >
                <Text
                  style={{ fontSize: 32, color: uploading ? "#ccc" : "#888" }}
                >
                  +
                </Text>
              </TouchableOpacity>
            </ScrollView> */}
          </ScrollView>
        </View>
      </Modal>
    );
  }

  // // Inline mode (no modal, no overlay, no close button)
  // return (
  //   <Card style={styles.card}>
  //     <CardHeader style={styles.header}>
  //       <CardTitle>Document Source of Loss</CardTitle>
  //     </CardHeader>
  //     <CardContent>
  //       <Text style={styles.label}>Claim Summary</Text>
  //       <TextInput
  //         value={summary}
  //         onChangeText={setSummary}
  //         placeholder="Describe the source of loss..."
  //         multiline
  //         numberOfLines={4}
  //         style={styles.textInput}
  //       />
  //       <Text style={[styles.label, { marginTop: 16 }]}>Images</Text>
  //       <ScrollView horizontal style={{ marginVertical: 8 }}>
  //         {images.map((url, idx) => (
  //           <View key={idx} style={styles.imageWrapper}>
  //             <Image source={{ uri: url }} style={styles.image} />
  //             <TouchableOpacity
  //               onPress={() => handleRemoveImage(idx)}
  //               style={styles.removeImageButton}
  //             >
  //               <XIcon size={16} color="#ef4444" />
  //             </TouchableOpacity>
  //           </View>
  //         ))}
  //         <TouchableOpacity
  //           onPress={handleAddImage}
  //           style={[styles.image, styles.addImageButton]}
  //           disabled={uploading}
  //         >
  //           <Text style={{ fontSize: 32, color: uploading ? "#ccc" : "#888" }}>
  //             +
  //           </Text>
  //         </TouchableOpacity>
  //       </ScrollView>
  //     </CardContent>
  //   </Card>
  // );
};

export default ClaimSummaryEditor;
