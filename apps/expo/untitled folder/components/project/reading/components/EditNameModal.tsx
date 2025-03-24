import React from "react";
import { Button, FormControl, Input, Modal } from "native-base";

interface EditNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  isLoading?: boolean;
}

export const EditNameModal: React.FC<EditNameModalProps> = ({
  isOpen,
  onClose,
  title,
  value,
  onChange,
  onSave,
  isLoading = false,
}: EditNameModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Header>{title}</Modal.Header>
        <Modal.Body>
          <FormControl>
            <FormControl.Label>{title}</FormControl.Label>
            <Input
              value={value}
              onChangeText={onChange}
              placeholder={`Enter ${title.toLowerCase()}`}
              isDisabled={isLoading}
            />
          </FormControl>
        </Modal.Body>
        <Modal.Footer>
          <Button.Group space={2}>
            <Button variant="ghost" onPress={onClose} isDisabled={isLoading}>
              Cancel
            </Button>
            <Button onPress={onSave} isLoading={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}; 