import React, { useState, useEffect } from "react";
import { Input, InputGroup, InputRightAddon } from "native-base";
import { useDebounce } from "@/utils/debounce";

interface RoomReadingInputProps {
  value: string;
  placeholder: string;
  rightText: string;
  onChange: (value: string) => void;
}

export function RoomReadingInput({
  value,
  placeholder,
  onChange,
  rightText,
}: RoomReadingInputProps) {
  const [text, setText] = useState(value);
  const debouncedText = useDebounce(text);

  useEffect(() => {
    if (debouncedText === value) return;
    onChange(debouncedText);
  }, [debouncedText, onChange, value]);

  // Update local state if the prop value changes
  useEffect(() => {
    setText(value);
  }, [value]);

  return (
    <InputGroup
      w={{
        base: "100%",
        md: "285",
      }}
      mb="4"
    >
      <Input
        w={{
          base: "80%",
          md: "100%",
        }}
        fontSize="md"
        type="text"
        value={text}
        placeholder={placeholder}
        onChangeText={(text) => {
          setText(text);
        }}
      />
      <InputRightAddon children={rightText} w="20%" />
    </InputGroup>
  );
} 