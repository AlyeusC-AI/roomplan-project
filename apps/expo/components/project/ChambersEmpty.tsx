import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Building2, Plus } from "lucide-react-native";
import { Colors } from "@/constants/Colors";

// Type assertions to fix ReactNode compatibility
const Building2Icon = Building2 as any;
const PlusIcon = Plus as any;

interface ChambersEmptyProps {
  onPress: () => void;
}

export default function ChambersEmpty({ onPress }: ChambersEmptyProps) {
  return (
    <View className="flex-1 items-center justify-center py-12">
      <View className="w-20 h-20 rounded-full bg-blue-50 items-center justify-center mb-6">
        <Building2Icon size={32} color={Colors.light.primary} />
      </View>

      <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
        No Chambers Yet
      </Text>

      <Text className="text-base text-gray-600 text-center mb-8 px-8">
        Create your first chamber to organize rooms and track affected areas in
        your project.
      </Text>

      <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center bg-blue-600 px-6 py-3 rounded-lg shadow-sm"
        style={{
          shadowColor: Colors.light.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <PlusIcon size={20} color="#ffffff" />
        <Text className="text-white font-semibold ml-2 text-base">
          Create Chamber
        </Text>
      </TouchableOpacity>

      <View className="mt-8 px-8">
        <Text className="text-sm text-gray-500 text-center leading-5">
          Chambers help you group related rooms and mark which areas are
          affected by damage or require special attention.
        </Text>
      </View>
    </View>
  );
}
