import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { LucideIcon } from "lucide-react-native";
import { Colors } from "@/constants/Colors";

interface EmptyProps {
  title: string;
  description: string;
  buttonText?: string;
  onPress?: () => void;
  icon?: LucideIcon;
  secondaryIcon?: LucideIcon;
}

export function Empty({
  title,
  description,
  buttonText,
  onPress,
  icon: Icon,
  secondaryIcon: SecondaryIcon,
}: EmptyProps) {
  return (
    <View className="flex-1 items-center justify-center p-8 bg-muted/5 rounded-lg">
      {Icon && (
        <View className="mb-4 p-4 rounded-full bg-primary/10">
          <Icon size={32} color={Colors.light.primary} />
        </View>
      )}
      <Text className="text-xl font-semibold text-center mb-2">{title}</Text>
      <Text className="text-muted-foreground text-center mb-6">
        {description}
      </Text>
      {buttonText && onPress && (
        <TouchableOpacity
          onPress={onPress}
          className="flex-row items-center justify-center bg-primary px-6 py-3 rounded-lg"
        >
          {SecondaryIcon && (
            <SecondaryIcon color="#ffffff" size={20} className="mr-2" />
          )}
          <Text className="text-white font-medium">{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
