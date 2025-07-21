import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Text } from "@/components/ui/text";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Thermometer,
  Droplet,
} from "lucide-react-native";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoomReadingInput } from "@/components/project/reading/components/RoomReadingInput";
import DateTimePicker, { useDefaultStyles } from "react-native-ui-datepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Room, useCreateRoomReading } from "@service-geek/api-client";
import { Colors } from "@/constants/Colors";

// Type assertions for Lucide icons
const XIcon = X as any;
const ChevronRightIcon = ChevronRight as any;
const ChevronLeftIcon = ChevronLeft as any;
const ThermometerComponent = Thermometer as any;
const DropletComponent = Droplet as any;

interface ReadingModalProps {
  visible: boolean;
  onClose: () => void;
  room: Room | null;
  projectId: string;
}

export default function ReadingModal({
  visible,
  onClose,
  room,
  projectId,
}: ReadingModalProps) {
  const { top } = useSafeAreaInsets();
  const createRoomReading = useCreateRoomReading();

  // State for form inputs
  const [temperature, setTemperature] = useState("0");
  const [humidity, setHumidity] = useState("0");
  const [readingDate, setReadingDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Calculate GPP based on temperature and humidity
  const calculateGPP = (temp: number, hum: number) => {
    if (temp === 0 || hum === 0) return 0;
    // GPP calculation formula (you may need to adjust this based on your specific formula)
    return (temp * 0.621 + hum * 0.0027).toFixed(1);
  };

  const gppValue = calculateGPP(
    parseFloat(temperature) || 0,
    parseFloat(humidity) || 0
  );

  // Handler for creating new reading
  const handleCreateReading = async () => {
    if (!room) return;

    try {
      await createRoomReading.mutateAsync({
        roomId: room.id,
        date: readingDate,
        temperature: parseFloat(temperature) || 0,
        humidity: parseFloat(humidity) || 0,
      });

      // Reset form and close modal
      setTemperature("0");
      setHumidity("0");
      setReadingDate(new Date());
      onClose();
    } catch (error) {
      console.error("Failed to create reading:", error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "#f8fafc", paddingTop: top }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 20,
            backgroundColor: "#fff",
            borderBottomWidth: 1,
            borderBottomColor: "#e5e7eb",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <TouchableOpacity
            onPress={onClose}
            style={{
              padding: 8,
              borderRadius: 20,
              backgroundColor: "#f1f5f9",
            }}
          >
            <XIcon size={24} color="#64748b" />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              marginLeft: 16,
              color: "#1e293b",
            }}
          >
            Atmospheric Reading
          </Text>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          {/* Room Info Card */}
          <Card
            style={{
              marginBottom: 24,
              backgroundColor: "#fff",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <CardHeader style={{ paddingBottom: 8 }}>
              <CardTitle style={{ fontSize: 18, color: "#1e293b" }}>
                {room?.name}
              </CardTitle>
            </CardHeader>
            <CardContent style={{ paddingTop: 0 }}>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                  backgroundColor: "#f8fafc",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                }}
              >
                <Text
                  style={{ fontSize: 16, color: "#64748b", marginRight: 8 }}
                >
                  📅 Date:
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#1e293b",
                    flex: 1,
                  }}
                >
                  {readingDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
                <ChevronRightIcon size={20} color="#64748b" />
              </TouchableOpacity>
            </CardContent>
          </Card>

          {/* Reading Inputs Card */}
          <Card
            style={{
              marginBottom: 24,
              backgroundColor: "#fff",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <CardHeader style={{ paddingBottom: 8 }}>
              <CardTitle style={{ fontSize: 18, color: "#1e293b" }}>
                Reading Values
              </CardTitle>
            </CardHeader>
            <CardContent style={{ paddingTop: 0 }}>
              {/* Temperature and Humidity Inputs Side by Side */}
              <View style={{ flexDirection: "row", gap: 16, marginBottom: 24 }}>
                {/* Temperature Input */}
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <ThermometerComponent
                      size={20}
                      color="#ef4444"
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#1e293b",
                      }}
                    >
                      Temperature
                    </Text>
                  </View>
                  <View style={{ height: 48 }}>
                    <RoomReadingInput
                      value={temperature}
                      onChange={setTemperature}
                      placeholder="Enter temperature"
                      rightText="°F"
                      noStyle={false}
                    />
                  </View>
                </View>

                {/* Humidity Input */}
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <DropletComponent
                      size={20}
                      color={Colors.light.primary}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#1e293b",
                      }}
                    >
                      Humidity
                    </Text>
                  </View>
                  <View style={{ height: 48 }}>
                    <RoomReadingInput
                      value={humidity}
                      onChange={setHumidity}
                      placeholder="Enter humidity"
                      rightText="%"
                      noStyle={false}
                    />
                  </View>
                </View>
              </View>

              {/* GPP Display */}
              <View
                style={{
                  padding: 16,
                  backgroundColor: "#f0f9ff",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#0ea5e9",
                  marginBottom: 24,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#0c4a6e",
                      marginRight: 8,
                    }}
                  >
                    GPP
                  </Text>
                  <Text style={{ fontSize: 14, color: "#0369a1" }}>
                    (Grain Per Pound)
                  </Text>
                </View>
                <Text
                  style={{ fontSize: 24, fontWeight: "bold", color: "#0c4a6e" }}
                >
                  {gppValue}
                </Text>
              </View>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onPress={handleCreateReading}
            disabled={createRoomReading.isPending}
            style={{
              width: "100%",
              paddingVertical: 16,
              backgroundColor: "#3b82f6",
              borderRadius: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            {createRoomReading.isPending ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                Save Reading
              </Text>
            )}
          </Button>
        </ScrollView>

        {/* Date Picker Modal */}
        <Modal
          visible={showDatePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxWidth: 400 }]}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderContent}>
                  <Text style={styles.modalTitle}>Select Date</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <XIcon size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <DateTimePicker
                  mode="single"
                  components={{
                    IconNext: <ChevronRightIcon color="#3b82f6" size={18} />,
                    IconPrev: <ChevronLeftIcon color="#3b82f6" size={18} />,
                  }}
                  onChange={(params) => {
                    setReadingDate(new Date(params.date as string));
                    setShowDatePicker(false);
                  }}
                  styles={{
                    ...useDefaultStyles(),
                    selected: {
                      ...useDefaultStyles().selected,
                      color: "#fff",
                      backgroundColor: "#3b82f6",
                    },
                  }}
                  date={readingDate}
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  modalBody: {
    padding: 16,
  },
});
