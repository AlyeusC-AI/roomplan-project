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
      className={`rounded-full border px-2 py-0.5 text-sm font-medium ${className}`}
      style={{
        borderColor: color.toLowerCase(),
        // backgroundColor: "transparent",
        color: color.toLowerCase(),
      }}
    >
      {label}
    </Badge>
  );
};

export default StatusBadge;
