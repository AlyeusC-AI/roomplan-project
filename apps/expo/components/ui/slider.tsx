import { Colors } from "@/constants/Colors";
import React, { useEffect } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  vertical?: boolean;
}

export function Slider({
  min,
  max,
  step = 1,
  value,
  defaultValue = [min],
  onValueChange,
  vertical = false,
}: SliderProps) {
  const position = useSharedValue(value ? value[0] : defaultValue[0]);
  const width = useSharedValue(0);
  const height = useSharedValue(0);

  // Sync position with value prop
  useEffect(() => {
    if (value && value[0] !== position.value) {
      position.value = value[0];
    }
  }, [value]);

  // Also update on defaultValue change (for uncontrolled usage)
  useEffect(() => {
    if (!value && defaultValue[0] !== position.value) {
      position.value = defaultValue[0];
    }
  }, [defaultValue, value]);

  const gesture = Gesture.Pan().onUpdate((e) => {
    const size = vertical ? height.value : width.value;
    const movement = vertical ? -e.y : e.x;

    const newValue = Math.max(
      min,
      Math.min(max, min + (movement / size) * (max - min))
    );
    const steppedValue = Math.round(newValue / step) * step;
    position.value = steppedValue;
    if (onValueChange) {
      runOnJS(onValueChange)([steppedValue]);
    }
  });

  const thumbStyle = useAnimatedStyle(() => {
    const percentage = (position.value - min) / (max - min);
    const translation = vertical
      ? { translateY: withSpring(-percentage * height.value) }
      : { translateX: withSpring(percentage * width.value) };
    return {
      transform: [translation],
    };
  });

  const trackStyle = vertical
    ? "w-12 h-12 bg-blue-200 rounded-full overflow-visible border border-blue-400"
    : "w-40 h-1 bg-blue-200 rounded-full overflow-visible border border-blue-400";

  const activeTrackStyle = useAnimatedStyle(() => {
    const percentage = (position.value - min) / (max - min);
    return {
      [vertical ? "height" : "width"]: `${percentage * 100}%`,
      backgroundColor: Colors.light.primary,
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <View
        className={trackStyle}
        onLayout={(e) => {
          width.value = e.nativeEvent.layout.width;
          height.value = e.nativeEvent.layout.height;
        }}
      >
        <Animated.View
          className="absolute rounded-full"
          style={[
            vertical
              ? { width: 1, left: 0, bottom: 0 }
              : { height: 1, left: 0, top: 0 },
            activeTrackStyle,
          ]}
        />
        <View className="absolute w-full h-full">
          <Animated.View
            className="absolute top-1/2 -mt-4 -ml-4 w-8 h-8 rounded-full shadow"
            style={[{ backgroundColor: Colors.light.primary }, thumbStyle]}
          />
        </View>
      </View>
    </GestureDetector>
  );
}
