import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Plus,
  Download,
  Play,
  Trash2,
  FileText,
} from "lucide-react-native";
import {
  useReports,
  useCreateReport,
  useDeleteReport,
  useGeneratePDF,
} from "@service-geek/api-client";
import { ReportStatus, ReportType } from "@service-geek/api-client";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Linking from "expo-linking";

// Type assertions for lucide-react-native icons
const ArrowLeftIcon = ArrowLeft as any;
const PlusIcon = Plus as any;
const DownloadIcon = Download as any;
const PlayIcon = Play as any;
const Trash2Icon = Trash2 as any;
const FileTextIcon = FileText as any;

export default function ReportsScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { reports, isLoading, mutate } = useReports(projectId!);
  const { createReport } = useCreateReport();
  const { deleteReport } = useDeleteReport();
  const { generatePDF } = useGeneratePDF();
  const [isCreating, setIsCreating] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<ReportType>(
    ReportType.PROJECT_SUMMARY
  );
  const { top } = useSafeAreaInsets();

  const handleCreateReport = async () => {
    setIsCreating(true);
    try {
      await createReport({
        name: `Report ${new Date().toLocaleDateString()}`,
        description: "Project report",
        type: selectedReportType,
        projectId: projectId!,
      });
      mutate();
      setShowCreateModal(false);
    } catch (error) {
      Alert.alert("Error", "Failed to create report");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    Alert.alert(
      "Delete Report",
      "Are you sure you want to delete this report?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteReport(reportId);
              mutate();
            } catch (error) {
              Alert.alert("Error", "Failed to delete report");
            }
          },
        },
      ]
    );
  };

  const handleGeneratePDF = async (reportId: string) => {
    setGeneratingId(reportId);
    try {
      const blob = await generatePDF(reportId);

      // Convert blob to base64 for mobile download
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      // Show success message
      Alert.alert(
        "Success",
        "PDF generated successfully! The file has been uploaded and is now available for download.",
        [
          {
            text: "OK",
            onPress: () => {
              // Refresh the reports list to show updated status
              mutate();
            },
          },
        ]
      );
      mutate();
    } catch (error) {
      Alert.alert("Error", "Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDownloadPDF = async (report: any) => {
    if (!report.fileUrl) {
      Alert.alert("Error", "No PDF file available for download");
      return;
    }

    try {
      // Open the PDF URL in the device's browser
      const supported = await Linking.canOpenURL(report.fileUrl);

      if (supported) {
        await Linking.openURL(report.fileUrl);
      } else {
        Alert.alert(
          "Error",
          "Cannot open PDF URL. Please copy the URL and open it manually.",
          [
            {
              text: "Copy URL",
              onPress: () => {
                // You could add clipboard functionality here
                console.log("PDF URL:", report.fileUrl);
              },
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open PDF");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await mutate();
    } catch (error) {
      console.error("Failed to refresh reports:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.COMPLETED:
        return "#22c55e";
      case ReportStatus.GENERATING:
        return "#f59e0b";
      case ReportStatus.FAILED:
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.COMPLETED:
        return "Completed";
      case ReportStatus.GENERATING:
        return "Generating";
      case ReportStatus.FAILED:
        return "Failed";
      default:
        return "Pending";
    }
  };

  const getReportTypeText = (type: ReportType) => {
    switch (type) {
      case ReportType.PROJECT_SUMMARY:
        return "Project Summary";
      case ReportType.EQUIPMENT:
        return "Equipment Report";
      case ReportType.MOISTURE_READINGS:
        return "Moisture Readings";
      case ReportType.ROOM_DETAILS:
        return "Room Details";
      case ReportType.MATERIAL_ANALYSIS:
        return "Material Analysis";
      case ReportType.COST_BREAKDOWN:
        return "Cost Breakdown";
      case ReportType.CUSTOM:
        return "Custom Report";
      default:
        return "Project Summary";
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: top }}>
      <View className="bg-white px-4 py-6 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ArrowLeftIcon size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">Reports</Text>
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            disabled={isCreating}
            className="p-2 -mr-2"
          >
            {isCreating ? (
              <ActivityIndicator size="small" color="#2563eb" />
            ) : (
              <PlusIcon size={24} color="#2563eb" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 py-6"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2563eb"]}
            tintColor="#2563eb"
          />
        }
      >
        {reports.length === 0 ? (
          <View className="flex-1 justify-center items-center py-12">
            <FileTextIcon size={48} color="#9ca3af" />
            <Text className="text-gray-500 text-lg mt-4 text-center">
              No reports yet
            </Text>
            <Text className="text-gray-400 text-sm mt-2 text-center">
              Create your first report to get started
            </Text>
          </View>
        ) : (
          <View className="space-y-4">
            {reports.map((report) => (
              <View
                key={report.id}
                className="bg-white rounded-lg p-4 border border-gray-200"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-lg font-semibold text-gray-900">
                    {report.name}
                  </Text>
                  <View className="flex-row items-center space-x-2">
                    <View
                      className="px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: "#f3f4f6",
                      }}
                    >
                      <Text className="text-xs font-medium text-gray-600">
                        {getReportTypeText(report.type)}
                      </Text>
                    </View>
                    <View
                      className="px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: `${getStatusColor(report.status)}20`,
                      }}
                    >
                      <Text
                        className="text-xs font-medium"
                        style={{ color: getStatusColor(report.status) }}
                      >
                        {getStatusText(report.status)}
                      </Text>
                    </View>
                  </View>
                </View>

                {report.description && (
                  <Text className="text-gray-600 text-sm mb-3">
                    {report.description}
                  </Text>
                )}

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center space-x-4">
                    <Text className="text-gray-500 text-xs">
                      Created by {report.createdBy.firstName}{" "}
                      {report.createdBy.lastName}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </Text>
                    {report.fileSize && (
                      <Text className="text-gray-500 text-xs">
                        {(report.fileSize / 1024 / 1024).toFixed(1)} MB
                      </Text>
                    )}
                  </View>

                  <View className="flex-row items-center space-x-2">
                    {report.status === ReportStatus.COMPLETED && (
                      <TouchableOpacity
                        onPress={() => handleDownloadPDF(report)}
                        className="p-2 bg-blue-500 rounded-lg"
                        style={{ minWidth: 40, alignItems: "center" }}
                      >
                        <DownloadIcon size={16} color="white" />
                      </TouchableOpacity>
                    )}

                    {report.status === ReportStatus.PENDING && (
                      <TouchableOpacity
                        onPress={() => handleGeneratePDF(report.id)}
                        disabled={generatingId === report.id}
                        className="p-2 bg-green-500 rounded-lg"
                        style={{ minWidth: 40, alignItems: "center" }}
                      >
                        {generatingId === report.id ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <PlayIcon size={16} color="white" />
                        )}
                      </TouchableOpacity>
                    )}

                    {report.status === ReportStatus.GENERATING && (
                      <View
                        className="p-2 bg-yellow-500 rounded-lg"
                        style={{ minWidth: 40, alignItems: "center" }}
                      >
                        <ActivityIndicator size="small" color="white" />
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={() => handleDeleteReport(report.id)}
                      className="p-2 bg-red-500 rounded-lg"
                      style={{ minWidth: 40, alignItems: "center" }}
                    >
                      <Trash2Icon size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create Report Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white rounded-lg p-6 m-4 w-80">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Create New Report
            </Text>

            <Text className="text-sm font-medium text-gray-700 mb-2">
              Report Type
            </Text>
            <ScrollView className="max-h-48 mb-4">
              {Object.values(ReportType).map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setSelectedReportType(type)}
                  className={`p-3 rounded-lg mb-2 ${
                    selectedReportType === type
                      ? "bg-blue-100 border border-blue-300"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      selectedReportType === type
                        ? "text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    {getReportTypeText(type)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                className="flex-1 p-3 bg-gray-200 rounded-lg"
              >
                <Text className="text-center font-medium text-gray-700">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateReport}
                disabled={isCreating}
                className="flex-1 p-3 bg-blue-500 rounded-lg"
              >
                {isCreating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-center font-medium text-white">
                    Create
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
