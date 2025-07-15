import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

interface StatusBadgeProps {
  status?: {
    label: string;
    color?: string;
  };
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  if (!status?.label) return null;
  const bgColor =
    (status.color?.toLowerCase() === "slate"
      ? "slategray"
      : status.color?.toLowerCase()) || "green";
  const textColor = status.color?.toLowerCase() === "cyan" ? "black" : "white";

  return (
    <View
      className="px-2 py-0.5 rounded-full"
      style={{ backgroundColor: bgColor }}
    >
      <Text className="text-xs font-semibold text-white" style={{ color: textColor }}>
        {status.label.replace(/_/g, " ")}
      </Text>
    </View>
  );
};

export default StatusBadge;
