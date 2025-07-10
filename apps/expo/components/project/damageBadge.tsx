import { LossType } from "@service-geek/api-client";
import { View } from "react-native";
import { Text } from "@/components/ui/text";


const DAMAGE_TYPES = [
    { value: LossType.FIRE, label: "Fire", color: "#e74c3c" },     
    { value: LossType.WATER, label: "Water", color: "#3498db" },   
    { value: LossType.WIND, label: "Wind", color: "#95a5a6" },     
    { value: LossType.HAIL, label: "Hail", color: "#9b59b6" },    
    { value: LossType.MOLD, label: "Mold", color: "#27ae60" },     
    { value: LossType.OTHER, label: "Other", color: "#f39c12" },   
  ] as const;

const DamageBadge = ({ lossType }: { lossType: LossType }) => {
    return (
        <View className="flex-row items-center rounded-full px-2 py-0.5"
            style={{
                borderColor: DAMAGE_TYPES.find(type => type.value === lossType)?.color,
                borderWidth: 1
                // backgroundColor: DAMAGE_TYPES.find(type => type.value === lossType)?.color,

            }}
        >
            <Text className="text-xs text-white capitalize font-bold"
                style={{
                    color: DAMAGE_TYPES.find(type => type.value === lossType)?.color,

                }}
            >{DAMAGE_TYPES.find(type => type.value === lossType)?.label}</Text>
        </View>
    )
}

export default DamageBadge;