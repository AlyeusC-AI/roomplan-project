import React from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  children: React.ReactNode;
  className?: string;
}

interface AvatarImageProps {
  source: { uri: string };
  className?: string;
}

interface AvatarFallbackProps {
  children: React.ReactNode;
  className?: string;
}

export function Avatar({ children, className }: AvatarProps) {
  return (
    <View className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}>
      {children}
    </View>
  );
}

export function AvatarImage({ source, className }: AvatarImageProps) {
  return (
    <Image
      source={source}
      className={cn("h-full w-full", className)}
      contentFit="cover"
    />
  );
}

export function AvatarFallback({ children, className }: AvatarFallbackProps) {
  return (
    <View className={cn("flex h-full w-full items-center justify-center bg-muted", className)}>
      {children}
    </View>
  );
} 