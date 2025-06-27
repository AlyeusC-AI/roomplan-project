import React from "react";
import { View, StyleSheet, Image } from "react-native";

interface AvatarProps {
  children: React.ReactNode;
  style?: any;
}

interface AvatarImageProps {
  source: { uri: string };
  style?: any;
}

interface AvatarFallbackProps {
  children: React.ReactNode;
  style?: any;
}

const styles = StyleSheet.create({
  avatar: {
    position: "relative",
    flexDirection: "row",
    height: 40,
    width: 40,
    flexShrink: 0,
    overflow: "hidden",
    borderRadius: 20,
  },
  avatarImage: {
    height: "100%",
    width: "100%",
  },
  avatarFallback: {
    flexDirection: "row",
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e2e8f0",
  },
});

export function Avatar({ children, style }: AvatarProps) {
  return <View style={[styles.avatar, style]}>{children}</View>;
}

export function AvatarImage({ source, style }: AvatarImageProps) {
  return (
    <Image
      source={source}
      style={[styles.avatarImage, style]}
      resizeMode="cover"
    />
  );
}

export function AvatarFallback({ children, style }: AvatarFallbackProps) {
  return <View style={[styles.avatarFallback, style]}>{children}</View>;
}
