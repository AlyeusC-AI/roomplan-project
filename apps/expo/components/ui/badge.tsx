import { Text, View } from "react-native";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
  style?: any;
}

export function Badge({
  children,
  variant = "default",
  className,
  style,
  ...props
}: BadgeProps) {
  return (
    <View
      className={cn(
        "px-2.5 py-0.5 rounded-full items-center justify-center",
        variant === "default" && "bg-primary",
        variant === "secondary" && "bg-secondary",
        variant === "destructive" && "bg-destructive",
        variant === "outline" && "border border-border",
        className
      )}
      style={style}
      {...props}
    >
      <Text
        className={cn(
          "text-xs font-semibold",
          variant === "default" && "text-primary-foreground",
          variant === "secondary" && "text-secondary-foreground",
          variant === "destructive" && "text-destructive-foreground",
          variant === "outline" && "text-foreground"
        )}
      >
        {children}
      </Text>
    </View>
  );
} 