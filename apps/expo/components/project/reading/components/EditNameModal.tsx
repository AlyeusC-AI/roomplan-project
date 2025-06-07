import React, { useState } from "react";
import { Button, FormControl, Input, Modal } from "native-base";
import { useUpdateWall, useCreateWall, Wall } from "@service-geek/api-client";
import { WallReading } from "@service-geek/api-client";

interface EditNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  wall: Partial<Wall>;
}

export const EditNameModal: React.FC<EditNameModalProps> = ({
  isOpen,
  onClose,
  wall,
}: EditNameModalProps) => {
  const [name, setName] = useState(wall.name);
  const { mutate: updateWall, isPending } = useUpdateWall();
  const { mutate: createWall } = useCreateWall();
  const onSave = async () => {
    if (wall.id) {
      await updateWall({
        id: wall.id,
        data: {
          name: name,
        },
      });
    } else {
      await createWall({
        name: name!,
        roomId: wall.roomId!,
        type: wall.type!,
      });
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Header>{wall.type === "WALL" ? "Wall" : "Floor"}</Modal.Header>
        <Modal.Body>
          <FormControl>
            <FormControl.Label>{wall.name}</FormControl.Label>
            <Input
              value={name}
              onChangeText={setName}
              placeholder={`Enter ${wall.name.toLowerCase()}`}
              isDisabled={isPending}
            />
          </FormControl>
        </Modal.Body>
        <Modal.Footer>
          <Button.Group space={2}>
            <Button variant="ghost" onPress={onClose} isDisabled={isPending}>
              Cancel
            </Button>
            <Button onPress={onSave} isLoading={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};
