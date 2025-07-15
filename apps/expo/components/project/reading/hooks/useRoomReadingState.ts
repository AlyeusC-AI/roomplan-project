import { useState } from "react";
import { useGlobalSearchParams } from "expo-router";

import { RoomReading } from "@service-geek/api-client";
import { useOfflineReadingsStore } from "@/lib/state/offline-readings";

export function useRoomReadingState(reading: RoomReading) {
  // Basic component state
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date(reading.date));

  // Image related state
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [selectedImageType, setSelectedImageType] = useState<
    "generic" | string | null
  >(null);
  const [selectedGenericIndex, setSelectedGenericIndex] = useState<
    number | null
  >(null);

  // Offline state
  const { getEditForReading } = useOfflineReadingsStore();
  const offlineEdit = getEditForReading(reading.id);

  return {
    // Basic state
    isCollapsed,
    setIsCollapsed,
    showDatePicker,
    setShowDatePicker,
    date,
    setDate,

    // Image related state
    selectedImageIndex,
    setSelectedImageIndex,
    selectedImageType,
    setSelectedImageType,
    selectedGenericIndex,
    setSelectedGenericIndex,

    // Offline state
    offlineEdit,
  };
}
