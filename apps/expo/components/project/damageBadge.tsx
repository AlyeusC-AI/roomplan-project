import { LossType } from "@service-geek/api-client";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import {
  AlertTriangle,
  Droplets,
  Wind,
  CloudRain,
  AlertCircle,
  HelpCircle,
} from "lucide-react-native";

const DAMAGE_TYPES = [
  {
    value: LossType.FIRE,
    label: "Fire",
    color: "#e74c3c",
    bgColor: "#ffcccc",
    icon: AlertTriangle, // Flame not available, use AlertTriangle
  },
  {
    value: LossType.WATER,
    label: "Water",
    color: "#3498db",
    bgColor: "#cce6ff",
    icon: Droplets, // Droplet not available, use Droplets
  },
  {
    value: LossType.WIND,
    label: "Wind",
    color: "#95a5a6",
    bgColor: "#e6f2f2",
    icon: Wind,
  },
  {
    value: LossType.HAIL,
    label: "Hail",
    color: "#9b59b6",
    bgColor: "#f0e6fa",
    icon: CloudRain, // CloudHail not available, use CloudRain
  },
  {
    value: LossType.MOLD,
    label: "Mold",
    color: "#27ae60",
    bgColor: "#d4f5e9",
    icon: AlertCircle, // Biohazard not available, use AlertCircle
  },
  {
    value: LossType.OTHER,
    label: "Other",
    color: "#f39c12",
    bgColor: "#fff3cd",
    icon: HelpCircle, // HelpCircle available
  },
] as const;

const DamageBadge = ({ lossType }: { lossType: LossType }) => {
  const type = DAMAGE_TYPES.find((type) => type.value === lossType);
  const Icon = type?.icon as any; // Cast to any for React Native JSX compatibility
  return (
    <View
      className="flex-row items-center rounded-full px-2 py-0.5"
      style={{
        backgroundColor: type?.bgColor,
      }}
    >
      {Icon && (
        <Icon size={14} color={type?.color} style={{ marginRight: 4 }} />
      )}
      <Text
        className="text-xs capitalize font-bold"
        style={{ color: type?.color }}
      >
        {type?.label}
      </Text>
    </View>
  );
};

export default DamageBadge;