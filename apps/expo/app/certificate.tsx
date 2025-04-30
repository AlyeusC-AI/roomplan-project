import React, { useEffect } from "react";
import { View, ActivityIndicator, Animated } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { toast } from "sonner-native";

export default function CertificatePage() {
  const { id, type, isRep } = useLocalSearchParams<{
    id: string;
    type: string;
    isRep: string;
  }>();
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!id) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#1e88e5" />
      </View>
    );
  }

  const url = `https://www.restoregeek.app/certificate?isRep=true&id=${id}${type ? `&type=${type}` : ""}`;

  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className="flex-1 bg-background"
    >
      <WebView
        source={{ uri: url }}
        style={{ flex: 1 }}
        startInLoadingState={true}
        renderLoading={() => (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#1e88e5" />
          </View>
        )}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          toast.error("Failed to load certificate");
          console.error("WebView error:", nativeEvent);
        }}
      />
    </Animated.View>
  );
}
