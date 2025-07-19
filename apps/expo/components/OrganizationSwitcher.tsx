import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
} from "react-native";
import {
  useGetOrganizations,
  useActiveOrganization,
  useSetActiveOrganization,
} from "@service-geek/api-client";
import { Check } from "lucide-react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export function OrganizationSwitcher({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { data: organizations } = useGetOrganizations();
  const activeOrganization = useActiveOrganization();
  const setActiveOrganization = useSetActiveOrganization();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#00000055",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 24,
            minHeight: 120,
            maxHeight: SCREEN_HEIGHT * 0.6,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {/* Drag handle */}
          <View style={{ alignItems: "center", marginBottom: 8 }}>
            <View
              style={{
                width: 40,
                height: 5,
                borderRadius: 3,
                backgroundColor: "#e5e7eb",
              }}
            />
          </View>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 18,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            Switch Organization
          </Text>
          <FlatList
            data={organizations}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => (
              <View
                style={{
                  height: 1,
                  backgroundColor: "#f1f5f9",
                  marginVertical: 2,
                }}
              />
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 14,
                  paddingHorizontal: 4,
                  backgroundColor:
                    activeOrganization?.id === item.id ? "#f0f6ff" : "#fff",
                  borderRadius: 8,
                }}
                onPress={() => {
                  setActiveOrganization(item);
                  onClose();
                }}
              >
                <Text
                  style={{
                    flex: 1,
                    fontWeight:
                      activeOrganization?.id === item.id ? "bold" : "normal",
                    fontSize: 16,
                    color: "#22223b",
                  }}
                >
                  {item.name}
                </Text>
                {activeOrganization?.id === item.id && (
                  <Check size={20} color="#15438e" />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <Text
                style={{
                  textAlign: "center",
                  color: "#6b7280",
                  marginVertical: 24,
                }}
              >
                No organizations found.
              </Text>
            )}
            style={{ marginBottom: 8 }}
          />
          <TouchableOpacity
            onPress={onClose}
            style={{
              marginTop: 8,
              alignSelf: "center",
              backgroundColor: "#f1f5f9",
              borderRadius: 8,
              paddingHorizontal: 24,
              paddingVertical: 10,
              marginVertical: 24,
            }}
          >
            <Text
              style={{ color: "#15438e", fontWeight: "bold", fontSize: 16 }}
            >
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
