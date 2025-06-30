import React, { useState, useEffect } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Image,
  Platform,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { ImageIcon, Trash2 } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import {
  getOptimizedImageUrl,
  generatePlaceholderColor,
  STORAGE_URLS,
  STORAGE_BUCKETS,
  deleteImage,
} from "./imageModule";

// Get screen dimensions for responsive sizing
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Styles
const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: 8,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  errorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(30, 64, 175, 0.3)",
    borderWidth: 3,
    borderColor: "#1e40af",
    borderRadius: 8,
  },
  imageInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  infoText: {
    color: "white",
    fontSize: 12,
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#1e40af",
    borderRadius: 4,
  },
  retryText: {
    color: "white",
    fontSize: 12,
  },
});

/**
 * Enhanced OptimizedImage component for displaying images with placeholders, loading states,
 * selection capability, and delete functionality
 */
export function OptimizedImage({
  uri,
  style,
  resizeMode = "cover",
  size = "medium",
  bucket = STORAGE_BUCKETS.PROJECT,
  onPress,
  onLongPress,
  isSelected = false,
  showDeleteButton = false,
  onDelete,
  showInfo = false,
  imageKey,
  onRefresh,
  disabled = false,
  backgroundColor,
}: {
  uri: string;
  style: any;
  resizeMode?: "cover" | "contain" | "stretch" | "center";
  size?: "small" | "medium" | "large";
  bucket?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  isSelected?: boolean;
  showDeleteButton?: boolean;
  onDelete?: () => void;
  showInfo?: boolean;
  imageKey?: string;
  onRefresh?: () => Promise<void>;
  disabled?: boolean;
  backgroundColor?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageOpacity] = useState(new Animated.Value(0));
  const [retryCount, setRetryCount] = useState(0);

  // Check if URI is valid
  const isValidUri = uri && uri.trim() !== "";

  // If URI is invalid, show error state immediately
  useEffect(() => {
    if (!isValidUri) {
      setLoading(true);
      setError(true);
      handleRetry();
    } else {
      setError(false);
      setLoading(false);
    }
  }, [isValidUri]);

  // Determine if this is a Supabase storage URL for any bucket
  const isSupabaseUrl =
    isValidUri && Object.values(STORAGE_URLS).some((url) => uri.includes(url));

  // Extract the bucket from the URI if it's a Supabase URL
  let actualBucket = bucket;
  let actualImageKey = imageKey || "";

  if (isSupabaseUrl) {
    // Find which bucket this URI belongs to
    const matchingBucket = Object.entries(STORAGE_URLS).find(([_, url]) =>
      uri.includes(url)
    );
    if (matchingBucket) {
      actualBucket = matchingBucket[0];
      actualImageKey = uri.replace(`${matchingBucket[1]}/`, "");
    }
  }

  // Generate placeholder color based on the image key or use provided backgroundColor
  const placeholderColor =
    backgroundColor || generatePlaceholderColor(actualImageKey);

  // Optimize the URL based on the requested size
  const optimizedUri =
    isValidUri && isSupabaseUrl && actualImageKey
      ? getOptimizedImageUrl(actualImageKey, size, actualBucket)
      : uri;

  // Effect to reset error state when URI changes or on retry
  useEffect(() => {
    if (retryCount > 0 && isValidUri) {
      setError(false);
      setLoading(true);
    }
  }, [retryCount, uri, isValidUri]);

  // Handle image load success
  const handleLoadEnd = () => {
    setLoading(false);
    Animated.timing(imageOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Handle image load error
  const handleError = () => {
    setLoading(false);
    setError(true);
    handleRetry();
  };

  // Handle retry button press
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  // Handle delete button press
  const handleDelete = async () => {
    if (actualImageKey && onRefresh) {
      await deleteImage(actualImageKey, {
        bucket: actualBucket,
        onRefresh,
      });
      if (onDelete) onDelete();
    } else if (onDelete) {
      onDelete();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled || error}
      style={[styles.container, { backgroundColor: placeholderColor }, style]}
    >
      {!error && isValidUri && (
        <Animated.View style={{ opacity: imageOpacity }}>
          <Image
            source={{
              uri: optimizedUri,
              cache: "force-cache",
              headers:
                Platform.OS === "ios"
                  ? { "Cache-Control": "max-age=31536000" }
                  : undefined,
            }}
            style={style}
            resizeMode={resizeMode}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            key={`image-${retryCount}`} // Force reload on retry
          />
        </Animated.View>
      )}

      {loading && !error && (
        <View style={[styles.loadingContainer, style]}>
          <ActivityIndicator size="large" color="#1e40af" />
        </View>
      )}

      {error && (
        <View style={[styles.errorContainer, style]}>
          <ImageIcon size={24} color="#9CA3AF" />
          <Text className="text-gray-400 mt-2">
            {!isValidUri ? "No image available" : "Failed to load image"}
          </Text>
          {isValidUri && (
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {isSelected && !loading && !error && (
        <View style={styles.selectedOverlay} />
      )}

      {showDeleteButton && !loading && !error && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Trash2 size={20} color="#ef4444" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
