import React, { useState, useEffect } from "react";
import { Input, InputGroup, InputRightAddon } from "native-base";
import { useDebounce } from "@/utils/debounce";

interface RoomReadingInputProps {
  value: string;
  placeholder: string;
  rightText: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  noStyle?: boolean;
}

export function RoomReadingInput({
  value,
  placeholder,
  onChange,
  rightText,
  disabled = false,
  noStyle = false,
}: RoomReadingInputProps) {
  const [text, setText] = useState(value);
  console.log("🚀 ~ text:", text);
  const debouncedText = useDebounce(text);

  useEffect(() => {
    if (debouncedText === value) return;
    onChange(debouncedText);
  }, [debouncedText, value]);

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
      mb={noStyle ? "0" : "4"}
      borderWidth={noStyle ? 0 : undefined}
    >
      <Input
        w={{
          base: "80%",
          md: "100%",
        }}
        fontSize="md"
        keyboardType="numeric"
        value={text === "0" ? "" : text}
        placeholder={placeholder}
        onChangeText={(text) => {
          if (disabled) return;
          setText(text);
        }}
        borderWidth={noStyle ? 0 : undefined}
        isDisabled={disabled}
      />
      <InputRightAddon children={rightText} w="20%"  />
    </InputGroup>
  );
}
