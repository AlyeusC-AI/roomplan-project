import { Badge } from "@/components/ui/badge";
import React from "react";

interface StatusBadgeProps {
  label: string;
  color?: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  color = "green",
  className = "",
}) => {
  return (
    <Badge
      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${className}`}
      style={{
        borderColor: color.toLowerCase(),
        backgroundColor: color.toLowerCase(),
        color: "white",
      }}
    >
      {label}
    </Badge>
  );
};

export default StatusBadge;
