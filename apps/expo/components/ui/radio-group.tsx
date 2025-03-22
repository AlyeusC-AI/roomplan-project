import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from './text';
import { cn } from '@/lib/utils';

interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; name: string; }>;
}

export function RadioGroup({ value, onValueChange, options }: RadioGroupProps) {
  return (
    <View className="space-y-2">
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onValueChange(option.value)}
          className={cn(
            "flex-row items-center p-3 rounded-md",
            "hover:bg-muted/50 active:bg-muted",
            value === option.value ? "bg-muted" : "bg-transparent"
          )}
        >
          <View
            className={cn(
              "w-5 h-5 rounded-full border-2 mr-3",
              "items-center justify-center",
              value === option.value
                ? "border-primary"
                : "border-muted-foreground"
            )}
          >
            {value === option.value && (
              <View className="w-2.5 h-2.5 rounded-full bg-primary" />
            )}
          </View>
          <Text className="text-foreground">{option.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
} 