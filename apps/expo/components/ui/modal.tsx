import React from 'react';
import { Modal as NativeBaseModal } from 'native-base';
import { StyleSheet } from 'react-native';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  return (
    <NativeBaseModal 
      isOpen={isOpen} 
      onClose={onClose}
      _backdrop={{
        bg: "coolGray.800",
        opacity: 0.6,
      }}
    >
      <NativeBaseModal.Content maxWidth="90%" width="90%" style={styles.modalContent}>
        {children}
      </NativeBaseModal.Content>
    </NativeBaseModal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    marginTop: 'auto',
    marginBottom: 'auto',
    backgroundColor: 'white',
    borderRadius: 12,
  },
}); 