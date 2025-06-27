import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Pressable,
} from "react-native";
import { FormInput } from "@/components/ui/form";
import { Box, VStack, HStack, Button, Spinner, FormControl } from "native-base";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import {
  DamageTypeSelector,
  DamageType,
} from "@/components/project/damageSelector";
import {
  Phone,
  ChevronLeft,
  User,
  Mail,
  MapPin,
  Building2,
  ClipboardList,
  AlertTriangle,
  Shield,
  FileText,
  PhoneCall,
  Mail as MailIcon,
  Hash,
  Briefcase,
  UserCircle,
  Building,
  FileCheck,
  AlertCircle,
  Save,
  Calendar as CalendarIcon,
  X,
  ChevronRight,
  ChevronLeft as ChevronLeftIcon,
  ChevronDown,
} from "lucide-react-native";
import { Linking } from "react-native";
import {
  router,
  useGlobalSearchParams,
  useLocalSearchParams,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import DateTimePicker, {
  DateType,
  useDefaultStyles,
} from "react-native-ui-datepicker";
import dayjs from "dayjs";
import { Modal } from "@/components/ui/modal";
import {
  useGetProjectById,
  useUpdateProject,
  LossType,
} from "@service-geek/api-client";

type TabType = "customer" | "loss" | "insurance";

// Create a LossType selector component
const LOSS_TYPES = [
  { label: "Fire Damage", value: LossType.FIRE },
  { label: "Water Damage", value: LossType.WATER },
  { label: "Wind Damage", value: LossType.WIND },
  { label: "Hail Damage", value: LossType.HAIL },
  { label: "Mold Damage", value: LossType.MOLD },
  { label: "Other", value: LossType.OTHER },
] as const;

interface LossTypeSelectorProps {
  value?: LossType;
  onChange: (value: LossType) => void;
  style?: any;
}

function LossTypeSelector({ value, onChange, style }: LossTypeSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedLabel = value
    ? LOSS_TYPES.find((type) => type.value === value)?.label
    : "Select loss type";

  return (
    <Box>
      <FormControl.Label>Type of Loss</FormControl.Label>
      <TouchableOpacity
        style={[styles.selectorInput, style]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.inputText, !value && styles.placeholderText]}>
          {selectedLabel}
        </Text>
        <ChevronDown size={20} color="#1d1d1d" />
      </TouchableOpacity>

      <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)}>
        <Box style={styles.calendarContainer}>
          <HStack justifyContent="space-between" alignItems="center" mb={4}>
            <Text style={styles.modalTitle}>Select Loss Type</Text>
            <Pressable onPress={() => setModalVisible(false)}>
              <X color="#64748b" size={20} />
            </Pressable>
          </HStack>

          <VStack space={2}>
            {LOSS_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.optionItem,
                  value === type.value && styles.selectedOption,
                ]}
                onPress={() => {
                  onChange(type.value);
                  setModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    value === type.value && styles.selectedOptionText,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </VStack>

          <HStack space={2} mt={4}>
            <Button
              variant="outline"
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Button>
          </HStack>
        </Box>
      </Modal>
    </Box>
  );
}

const DateInput: React.FC<{
  label: string;
  value: DateType;
  onChange: (date: DateType) => void;
}> = ({ label, value, onChange }) => {
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
      <FormControl.Label>{label}</FormControl.Label>
      <Pressable onPress={() => setShowPicker(true)} style={styles.dateInput}>
        <Text style={styles.dateInputText}>
          {dayjs(value).format("MMM D, YYYY")}
        </Text>
        <CalendarIcon color="#64748b" size={20} />
      </Pressable>

      <Modal isOpen={showPicker} onClose={() => setShowPicker(false)}>
        <Box style={styles.calendarContainer}>
          <HStack justifyContent="space-between" alignItems="center" mb={4}>
            <Text style={styles.modalTitle}>{label}</Text>
            <Pressable onPress={() => setShowPicker(false)}>
              <X color="#64748b" size={20} />
            </Pressable>
          </HStack>
          <Box style={styles.datePickerContainer}>
            <DateTimePicker
              mode="single"
              minDate={dayjs().subtract(1, "year").toDate()}
              maxDate={dayjs().toDate()}
              components={{
                IconNext: <ChevronRight color="#1d4ed8" size={28} />,
                IconPrev: <ChevronLeftIcon color="#1d4ed8" size={28} />,
              }}
              onChange={(params: { date: DateType }) => {
                setTempDate(params.date);
              }}
              styles={{
                ...defaultStyles,
                selected: {
                  ...defaultStyles.selected,
                  color: "#1d4ed8",
                  backgroundColor: "#1d4ed8",
                },
                selected_month: {
                  ...defaultStyles.selected_month,
                  color: "#1d4ed8",
                  backgroundColor: "#1d4ed8",
                },
                selected_year: {
                  ...defaultStyles.selected_year,
                  color: "#1d4ed8",
                  backgroundColor: "#1d4ed8",
                },
              }}
              date={tempDate}
            />
          </Box>
          <HStack space={2} mt={4}>
            <Button
              variant="outline"
              onPress={() => setShowPicker(false)}
              style={styles.modalButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Button>
            <Button
              onPress={handleConfirm}
              style={[styles.modalButton, styles.confirmButton]}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </Button>
          </HStack>
        </Box>
      </Modal>
    </Box>
  );
};

export default function ProjectDetails() {
  const [activeTab, setActiveTab] = useState<TabType>("customer");
  const searchParams = useLocalSearchParams();
  const projectId = searchParams.projectId as string;

  const { data: project, isLoading: isLoadingProject } =
    useGetProjectById(projectId);
  const updateProjectMutation = useUpdateProject();

  useEffect(() => {
    if (searchParams.activeTab) {
      setActiveTab(searchParams.activeTab as TabType);
    }
  }, [searchParams.activeTab]);

  const [loading, setLoading] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("");
  const [firstTime, setFirstTime] = useState(true);
  const [clientName, setClientName] = useState("");
  const [clientPhoneNumber, setClientPhoneNumber] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [lossType, setLossType] = useState<LossType | undefined>(undefined);
  const [projectName, setProjectName] = useState("");
  const [managerName, setManagerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [insuranceCompanyName, setInsuranceCompanyName] = useState("");
  const [adjusterName, setAdjusterName] = useState("");
  const [adjusterEmail, setAdjusterEmail] = useState("");
  const [adjusterPhoneNumber, setAdjusterPhoneNumber] = useState("");
  const [insuranceClaimId, setInsuranceClaimId] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [catCode, setCatCode] = useState("");
  const [claimSummary, setClaimSummary] = useState("");
  const [dateOfLoss, setDateOfLoss] = useState<DateType>(dayjs().toDate());

  // Update form values when project data is loaded
  useEffect(() => {
    if (project) {
      setCurrentAddress(project.data?.location || "");
      setClientName(project.data?.clientName || "");
      setClientPhoneNumber(project.data?.clientPhoneNumber || "");
      setClientEmail(project.data?.clientEmail || "");
      setLossType(project.data?.lossType);
      setProjectName(project.data?.name || "");
      setManagerName(project.data?.managerName || "");
      setCompanyName(project.data?.companyName || "");
      setInsuranceCompanyName(project.data?.insuranceCompanyName || "");
      setAdjusterName(project.data?.adjusterName || "");
      setAdjusterEmail(project.data?.adjusterEmail || "");
      setAdjusterPhoneNumber(project.data?.adjusterPhoneNumber || "");
      setInsuranceClaimId(project.data?.insuranceClaimId || "");
      setPolicyNumber(project.data?.policyNumber || "");
      setCatCode(project.data?.catCode || "");
      setClaimSummary(project.data?.claimSummary || "");
      setDateOfLoss(
        project.data?.dateOfLoss
          ? dayjs(project.data.dateOfLoss).toDate()
          : dayjs().toDate()
      );
    }
  }, [project]);

  const handleCallPress = (phoneNumber: string) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const updateProject = async () => {
    try {
      setLoading(true);

      const update = {
        clientName,
        clientPhoneNumber,
        clientEmail,
        location: currentAddress,
        name: projectName,
        managerName,
        companyName,
        insuranceCompanyName,
        adjusterName,
        adjusterEmail: adjusterEmail ?? undefined,
        adjusterPhoneNumber,
        insuranceClaimId,
        policyNumber,
        dateOfLoss:
          dateOfLoss instanceof Date
            ? dateOfLoss
            : dateOfLoss
              ? new Date(dateOfLoss as string)
              : undefined,
        catCode,
        claimSummary,
      };

      await updateProjectMutation.mutateAsync({
        id: projectId,
        data: {
          ...update,
          lossType: lossType || undefined,
          adjusterEmail: adjusterEmail || undefined,
        },
      });

      toast.success("Project updated successfully!");
    } catch (error) {
      console.error(error);
      // toast.error("Could not update project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderCustomerTab = () => (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <VStack space={4}>
        <View style={styles.section}>
          <HStack space={2} alignItems="center" mb={4}>
            <UserCircle size={24} color="#182e43" />
            <Text style={styles.sectionTitle}>Contact Information</Text>
          </HStack>
          <FormInput
            label="Customer Name"
            placeholder="Enter customer name"
            value={clientName}
            onChangeText={setClientName}
            containerStyle={styles.inputContainer}
            leftElement={
              <User size={20} color="#94a3b8" style={styles.inputIcon} />
            }
          />
          <FormInput
            label="Phone Number"
            placeholder="Enter phone number"
            value={clientPhoneNumber}
            onChangeText={setClientPhoneNumber}
            containerStyle={styles.inputContainer}
            leftElement={
              <Phone size={20} color="#94a3b8" style={styles.inputIcon} />
            }
            rightElement={
              <TouchableOpacity
                onPress={() => handleCallPress(clientPhoneNumber)}
                style={styles.callButton}
                disabled={!clientPhoneNumber}
              >
                <HStack space={1} alignItems="center">
                  <PhoneCall
                    size={16}
                    color={clientPhoneNumber ? "#182e43" : "#94a3b8"}
                  />
                  <Text
                    style={[
                      styles.callText,
                      !clientPhoneNumber && styles.callTextDisabled,
                    ]}
                  >
                    Call
                  </Text>
                </HStack>
              </TouchableOpacity>
            }
          />
          <FormInput
            label="Email Address"
            placeholder="Enter email address"
            value={clientEmail}
            onChangeText={setClientEmail}
            containerStyle={styles.inputContainer}
            leftElement={
              <Mail size={20} color="#94a3b8" style={styles.inputIcon} />
            }
          />
        </View>

        <View style={styles.section}>
          <HStack space={2} alignItems="center" mb={4}>
            <MapPin size={24} color="#182e43" />
            <Text style={styles.sectionTitle}>Location</Text>
          </HStack>
          <Box style={styles.addressContainer}>
            <GooglePlacesAutocomplete
              placeholder="Enter your street address"
              onPress={(data, details = null) => {
                console.log("🚀 ~ ProjectDetails ~ details:", details);
                if (details) {
                  setCurrentAddress(data.description);
                }
              }}
              query={{
                key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
                language: "en",
              }}
              textInputProps={{
                value: currentAddress,
                defaultValue: currentAddress,
                onChangeText: (text) => {
                  console.log("🚀 ~ ProjectDetails ~ text:", text);
                  if (!text && firstTime) {
                    return setFirstTime(false);
                  }

                  (text ?? currentAddress) &&
                    setCurrentAddress(text ?? currentAddress);
                },
              }}
              styles={{
                textInputContainer: {
                  backgroundColor: "transparent",
                },
                textInput: {
                  height: 44,
                  fontSize: 16,
                  fontWeight: "500",
                  color: "#1d1d1d",
                  borderWidth: 1,
                  borderColor: "rgb(212, 212, 212)",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  backgroundColor: "transparent",
                },
                container: {
                  flex: 0,
                },
                listView: {
                  borderWidth: 1,
                  borderColor: "rgb(212, 212, 212)",
                  borderRadius: 8,
                  backgroundColor: "white",
                  marginTop: 4,
                },
                row: {
                  padding: 13,
                },
                description: {
                  fontSize: 14,
                  color: "#1d1d1d",
                },
              }}
              enablePoweredByContainer={false}
            />
          </Box>
        </View>
      </VStack>
    </TouchableWithoutFeedback>
  );

  const renderLossTab = () => (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <VStack space={4}>
        <View style={styles.section}>
          <HStack space={2} alignItems="center" mb={4}>
            <AlertTriangle size={24} color="#182e43" />
            <Text style={styles.sectionTitle}>Loss Details</Text>
          </HStack>
          <LossTypeSelector
            value={lossType}
            onChange={setLossType}
            style={styles.sectionInput}
          />
          <DateInput
            label="Date of Loss"
            value={dateOfLoss}
            onChange={setDateOfLoss}
          />
          <FormInput
            label="Category Code"
            placeholder="Enter category code"
            value={catCode}
            onChangeText={setCatCode}
            containerStyle={styles.inputContainer}
            leftElement={
              <Hash size={20} color="#94a3b8" style={styles.inputIcon} />
            }
          />
          <FormInput
            label="Claim Summary"
            placeholder="Enter claim summary"
            value={claimSummary}
            onChangeText={setClaimSummary}
            multiline
            numberOfLines={4}
            containerStyle={styles.inputContainer}
            leftElement={
              <FileCheck size={20} color="#94a3b8" style={styles.inputIcon} />
            }
          />
        </View>
        <View style={styles.section}>
          <HStack space={2} alignItems="center" mb={4}>
            <Building2 size={24} color="#182e43" />
            <Text style={styles.sectionTitle}>Project Information</Text>
          </HStack>
          <FormInput
            label="Project Name"
            placeholder="Enter project name"
            value={projectName}
            onChangeText={setProjectName}
            containerStyle={styles.inputContainer}
            leftElement={
              <FileText size={20} color="#94a3b8" style={styles.inputIcon} />
            }
          />
          <FormInput
            label="Project Manager Name"
            placeholder="Enter project manager name"
            value={managerName}
            onChangeText={setManagerName}
            containerStyle={styles.inputContainer}
            leftElement={
              <UserCircle size={20} color="#94a3b8" style={styles.inputIcon} />
            }
          />
          <FormInput
            label="Company Name"
            placeholder="Enter company name"
            value={companyName}
            onChangeText={setCompanyName}
            containerStyle={styles.inputContainer}
            leftElement={
              <Building size={20} color="#94a3b8" style={styles.inputIcon} />
            }
          />
        </View>
      </VStack>
    </TouchableWithoutFeedback>
  );

  const renderInsuranceTab = () => (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <VStack space={4}>
        <View style={styles.section}>
          <HStack space={2} alignItems="center" mb={4}>
            <Shield size={24} color="#182e43" />
            <Text style={styles.sectionTitle}>Insurance Information</Text>
          </HStack>
          <FormInput
            label="Insurance Company Name"
            placeholder="Enter insurance company name"
            value={insuranceCompanyName}
            onChangeText={setInsuranceCompanyName}
            containerStyle={styles.inputContainer}
            leftElement={
              <Building2 size={20} color="#94a3b8" style={styles.inputIcon} />
            }
          />
          <FormInput
            label="Adjuster Name"
            placeholder="Enter adjuster name"
            value={adjusterName}
            onChangeText={setAdjusterName}
            containerStyle={styles.inputContainer}
            leftElement={
              <User size={20} color="#94a3b8" style={styles.inputIcon} />
            }
          />
          <FormInput
            label="Adjuster Email"
            placeholder="Enter adjuster email"
            value={adjusterEmail}
            onChangeText={setAdjusterEmail}
            containerStyle={styles.inputContainer}
            leftElement={
              <MailIcon size={20} color="#94a3b8" style={styles.inputIcon} />
            }
          />
          <FormInput
            label="Adjuster Number"
            placeholder="Enter adjuster number"
            value={adjusterPhoneNumber}
            onChangeText={setAdjusterPhoneNumber}
            containerStyle={styles.inputContainer}
            leftElement={
              <Phone size={20} color="#94a3b8" style={styles.inputIcon} />
            }
            rightElement={
              <TouchableOpacity
                onPress={() => handleCallPress(adjusterPhoneNumber)}
                style={styles.callButton}
                disabled={!adjusterPhoneNumber}
              >
                <HStack space={1} alignItems="center">
                  <PhoneCall
                    size={16}
                    color={adjusterPhoneNumber ? "#182e43" : "#94a3b8"}
                  />
                  <Text
                    style={[
                      styles.callText,
                      !adjusterPhoneNumber && styles.callTextDisabled,
                    ]}
                  >
                    Call
                  </Text>
                </HStack>
              </TouchableOpacity>
            }
          />
          <FormInput
            label="Insurance Claim ID"
            placeholder="Enter insurance claim ID"
            value={insuranceClaimId}
            onChangeText={setInsuranceClaimId}
            containerStyle={styles.inputContainer}
            leftElement={
              <FileText size={20} color="#94a3b8" style={styles.inputIcon} />
            }
          />
          <FormInput
            label="Policy Number"
            placeholder="Enter policy number"
            value={policyNumber}
            onChangeText={setPolicyNumber}
            containerStyle={styles.inputContainer}
            leftElement={
              <FileText size={20} color="#94a3b8" style={styles.inputIcon} />
            }
          />
        </View>
      </VStack>
    </TouchableWithoutFeedback>
  );

  const { top } = useSafeAreaInsets();

  if (isLoadingProject) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar backgroundColor="#182e43" />
        <View style={[styles.header, { paddingTop: top }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Project Details</Text>
          <View style={styles.saveButton} />
        </View>
        <View style={styles.loadingContent}>
          <Spinner size="lg" color="#182e43" />
          <Text style={styles.loadingText}>Loading project details...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={styles.container}>
        <StatusBar backgroundColor="#182e43" />
        <View
          style={[
            styles.header,
            {
              paddingTop: top,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Project Details</Text>
          <TouchableOpacity onPress={updateProject} style={styles.saveButton}>
            {loading ? (
              <Spinner size="sm" color="#fff" />
            ) : (
              <HStack space={1} alignItems="center">
                <Save size={20} color="#fff" />
                <Text style={styles.saveText}>Save</Text>
              </HStack>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "customer" && styles.activeTab]}
            onPress={() => setActiveTab("customer")}
          >
            <HStack space={2} alignItems="center">
              <UserCircle
                size={20}
                color={activeTab === "customer" ? "#182e43" : "#94a3b8"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "customer" && styles.activeTabText,
                ]}
              >
                Customer
              </Text>
            </HStack>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "loss" && styles.activeTab]}
            onPress={() => setActiveTab("loss")}
          >
            <HStack space={2} alignItems="center">
              <AlertCircle
                size={20}
                color={activeTab === "loss" ? "#182e43" : "#94a3b8"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "loss" && styles.activeTabText,
                ]}
              >
                Loss
              </Text>
            </HStack>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "insurance" && styles.activeTab]}
            onPress={() => setActiveTab("insurance")}
          >
            <HStack space={2} alignItems="center">
              <Shield
                size={20}
                color={activeTab === "insurance" ? "#182e43" : "#94a3b8"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "insurance" && styles.activeTabText,
                ]}
              >
                Insurance
              </Text>
            </HStack>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{ paddingBottom: 20 }}
          bounces={true}
          alwaysBounceVertical={true}
        >
          {activeTab === "customer" && renderCustomerTab()}
          {activeTab === "loss" && renderLossTab()}
          {activeTab === "insurance" && renderInsuranceTab()}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 10,
    backgroundColor: "#182e43",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
  },
  saveButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#182e43",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#182e43",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
    flexGrow: 1,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1d1d1d",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputIcon: {
    marginHorizontal: 8,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
  },
  value: {
    fontSize: 16,
    color: "#000",
  },
  sectionInput: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 17,
    fontWeight: "500",
    color: "#1d1d1d",
    borderWidth: 1,
    borderColor: "rgb(212, 212, 212)",
    backgroundColor: "#f8f8f8",
  },
  callText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#182e43",
  },
  callTextDisabled: {
    color: "#94a3b8",
  },
  callButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#e6f0ff",
  },
  addressContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 12,
  },
  addressText: {
    fontSize: 16,
    color: "#1d1d1d",
    lineHeight: 24,
  },
  damageTypeContainer: {
    marginBottom: 16,
  },
  calendarContainer: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
  },
  datePickerContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    height: 350,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1d1d1d",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16,
  },
  dateInputText: {
    fontSize: 16,
    color: "#1d1d1d",
  },
  modalButton: {
    flex: 1,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1d4ed8",
  },
  confirmButton: {
    backgroundColor: "#1d4ed8",
    borderWidth: 0,
  },
  confirmButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButtonText: {
    color: "#1d4ed8",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1d1d1d",
    marginTop: 16,
  },
  selectorInput: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 17,
    fontWeight: "500",
    color: "#1d1d1d",
    borderWidth: 1,
    borderColor: "rgb(212, 212, 212)",
    backgroundColor: "#f8f8f8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  selectedOption: {
    backgroundColor: "#e6f0ff",
  },
  optionText: {
    fontSize: 16,
    color: "#1d1d1d",
  },
  selectedOptionText: {
    color: "#182e43",
    fontWeight: "600",
  },
  inputText: {
    fontSize: 16,
    color: "#1d1d1d",
  },
  placeholderText: {
    color: "#94a3b8",
  },
});
