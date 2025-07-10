import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { useRouter, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { userStore } from "@/lib/state/user";
import { roomInferenceStore } from "@/lib/state/readings-image";
interface AddRoomButtonProps {
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
  className?: string;
  onPress?: () => void;
}

export default function AddRoomButton({
  variant = "outline",
  size = "default",
  showText = true,
  className = "",
  onPress,
}: AddRoomButtonProps) {
  const router = useRouter();

  return (
    <Button
      className={className}
      variant={variant}
      size={size}
      onPress={() => (onPress ? onPress() : router.push("../rooms/create"))}
    >
      <View className="flex-row items-center">
        <Plus size={18} color={variant === "outline" ? "#1e40af" : "#fff"} />

        {showText && (
          <Text
            className={`ml-1 ${
              variant === "outline" ? "text-primary" : "text-white"
            }`}
          >
            Add Room
          </Text>
        )}
      </View>
    </Button>
  );
}
