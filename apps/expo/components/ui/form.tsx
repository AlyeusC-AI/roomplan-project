import React from 'react';
import {
  FormControl,
  Input,
  Button,
  IButtonProps,
  View,
  IInputProps,
  HStack,
  Box,
} from 'native-base';

interface FormInputProps extends IInputProps {
  label?: string;
  rightElement?: React.ReactElement | React.ReactElement[];
  rightElementContainerStyle?: any;
}

interface FormButtonProps extends IButtonProps {
  variant?: 'primary' | 'danger';
}

export function FormInput({ label, rightElement, rightElementContainerStyle, ...props }: FormInputProps) {
  return (
    <FormControl mb={4}>
      {label && (
        <HStack justifyContent="space-between" alignItems="center" mb={2}>
          <FormControl.Label>{label}</FormControl.Label>
          {rightElement && (
            <Box style={rightElementContainerStyle}>
              {rightElement}
            </Box>
          )}
        </HStack>
      )}
      <Input
        size="lg"
        fontSize="md"
        fontWeight="500"
        color="gray.900"
        placeholderTextColor="gray.400"
        height={44}
        {...props}
      />
    </FormControl>
  );
}

export function FormButton({ children, variant = 'primary', ...props }: FormButtonProps) {
  return (
    <Button
      size="lg"
      w="full"
      height={44}
      bg={variant === 'primary' ? 'blue.600' : 'red.500'}
      _pressed={{
        bg: variant === 'primary' ? 'blue.700' : 'red.600',
      }}
      {...props}
    >
      {children}
    </Button>
  );
} 