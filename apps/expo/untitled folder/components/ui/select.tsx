import React, { useState } from 'react';
import { View, TouchableOpacity, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Text } from './text';
import { ChevronDown } from 'lucide-react-native';
import { cn } from '@/lib/utils';

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: Array<{ value: string; name: string; }>;
}

export function Select({ value, onValueChange, placeholder = "Select an option", options }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <View>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className={cn(
          "flex-row items-center justify-between",
          "px-3 py-2 rounded-md",
          "bg-background border border-input"
        )}
      >
        <Text className={cn(
          "text-sm",
          value ? "text-foreground" : "text-muted-foreground"
        )}>
          {selectedOption?.name || placeholder}
        </Text>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background">
            <View className="flex-row justify-between items-center p-4 border-b border-border">
              <Text className="text-lg font-semibold">{placeholder}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text className="text-primary">Done</Text>
              </TouchableOpacity>
            </View>
            <Picker
              selectedValue={value}
              onValueChange={(itemValue) => {
                onValueChange(itemValue);
                setIsOpen(false);
              }}
            >
              {options.map((option, index) => (
                <Picker.Item
                  key={index}
                  label={option.name}
                  value={option.value}
                />
              ))}
            </Picker>
          </View>
        </View>
      </Modal>
    </View>
  );
} 