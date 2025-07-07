import { LossType } from "@service-geek/api-client";
import { View } from "react-native";
import { Text } from "@/components/ui/text";


const DAMAGE_TYPES = [
    { value: LossType.FIRE, label: "Fire", color: "red" },
    { value: LossType.WATER, label: "Water", color: "blue" },
    { value: LossType.WIND, label: "Wind", color: "green" },
    { value: LossType.HAIL, label: "Hail", color: "orange" },
    { value: LossType.MOLD, label: "Mold", color: "gray" },
    { value: LossType.OTHER, label: "Other", color: "purple" },
] as const;

const DamageBadge = ({ lossType }: { lossType: LossType }) => {
    return (
        <View className="flex-row items-center rounded px-2 py-0.5"
            style={{
                borderColor: DAMAGE_TYPES.find(type => type.value === lossType)?.color,
                backgroundColor: DAMAGE_TYPES.find(type => type.value === lossType)?.color,

            }}>
            <Text className="text-xs text-white capitalize">{DAMAGE_TYPES.find(type => type.value === lossType)?.label}</Text>
        </View>
    )
}

export default DamageBadge;