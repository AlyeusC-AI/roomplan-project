import { Badge } from "@components/ui/badge";
import { LossType } from "@service-geek/api-client";
import {
  Flame,
  Droplet,
  Wind,
  CloudHail,
  Biohazard,
  HelpCircle,
} from "lucide-react";
import React from "react";

const DAMAGE_TYPES = [
  { value: LossType.FIRE, label: "Fire", color: "#e74c3c", icon: Flame },
  { value: LossType.WATER, label: "Water", color: "#3498db", icon: Droplet },
  { value: LossType.WIND, label: "Wind", color: "#95a5a6", icon: Wind },
  { value: LossType.HAIL, label: "Hail", color: "#9b59b6", icon: CloudHail },
  { value: LossType.MOLD, label: "Mold", color: "#27ae60", icon: Biohazard },
  { value: LossType.OTHER, label: "Other", color: "#f39c12", icon: HelpCircle },
] as const;

const DamageBadge = ({ lossType }: { lossType: LossType }) => {
  const type = DAMAGE_TYPES.find((type) => type.value === lossType);
  const Icon = type?.icon;
  return (
    <Badge
      variant='outline'
      className={"flex items-center gap-1 text-sm bg-opacity-15"}
      style={{
        borderColor: type?.color,
        backgroundColor: type?.color,
        color: "white",
      }}
      
    >
      {Icon && <Icon className='mr-1 h-3 w-3' />}
      {type?.label}
    </Badge>
  );
};

export default DamageBadge;