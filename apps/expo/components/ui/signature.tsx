import React, { useRef, useState } from "react";
import { View, Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import SignatureCanvas from "react-native-signature-canvas";
import type { SignatureViewRef } from "react-native-signature-canvas";
import { useToast } from "native-base";
import { PenTool, X } from "lucide-react-native";
import { Modal } from "./modal";

interface SignatureProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
}

export function Signature({ value, onChange, error }: SignatureProps) {
  const ref = useRef<SignatureViewRef>(null);
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignatureSave = (signature: string) => {
    onChange(signature);
    setIsOpen(false);
    toast.show({
      title: "Success",
      description: "Signature saved successfully",
      variant: "success",
    });
  };

  const handleSignatureEmpty = () => {
    toast.show({
      title: "Warning",
      description: "Please provide a signature",
      variant: "warning",
    });
  };

  const handleSignatureClear = () => {
    toast.show({
      title: "Info",
      description: "Signature cleared",
      variant: "info",
    });
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.signatureContainer, error && styles.errorContainer]}
        onPress={() => setIsOpen(true)}
      >
        <View style={styles.header}>
          <PenTool size={20} color="#64748b" />
          <View style={styles.headerText}>
            <Text style={styles.title}>Signature</Text>
            <Text style={styles.subtitle}>
              {value ? "Tap to modify signature" : "Tap to sign"}
            </Text>
          </View>
        </View>

        {value ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: value }} style={styles.previewImage} />
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>No signature yet</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal isOpen={isOpen} onClose={handleClose}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sign Here</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalCanvasContainer}>
            <SignatureCanvas
              ref={ref}
              onOK={handleSignatureSave}
              onEmpty={handleSignatureEmpty}
              onClear={handleSignatureClear}
              descriptionText=""
              clearText="Clear"
              confirmText="Save"
              webStyle={`
                .m-signature-pad {
                  box-shadow: none;
                  border: none;
                  background-color: #ffffff;
                  width: 100% !important;
                  height: 100% !important;
                  position: relative;
                }
                .m-signature-pad--body {
                  border: 1px dashed #e2e8f0;
                  border-radius: 8px;
                  background-color: #ffffff;
                  height: 700px !important;
                  width: 100% !important;
                  margin-bottom: 60px;
                }
                .m-signature-pad--footer {
                  display: flex;
                  flex-direction: row;
                  justify-content: flex-end;
                  gap: 12px;
                  padding: 16px;
                  margin: 0;
                  background-color: #ffffff;
                  border-top: 1px solid #e2e8f0;
                  position: fixed;
                  bottom: 0;
                  left: 0;
                  right: 0;
                  z-index: 1000;
                }
                .m-signature-pad--footer .button {
                  background-color: #1d4ed8;
                  color: #FFF;                  border-radius: 8px;
                  border: none;
                  font-size: 16px;
                  font-weight: 600;
                  transition: all 0.2s;
                  min-width: 100px;
                  text-align: center;
                  cursor: pointer;
                }
                .m-signature-pad--footer .button:hover {
                  opacity: 0.9;
                }
                .m-signature-pad--footer .button.clear {
                  background-color: #ef4444;
                }
                body, html {
                  height: 100%;
                  margin: 0;
                  padding: 0;
                  background-color: #ffffff;
                  overflow: hidden;
                }
              `}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  signatureContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  errorContainer: {
    borderColor: "#ef4444",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  placeholderContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  placeholderText: {
    fontSize: 14,
    color: "#94a3b8",
  },
  previewContainer: {
    padding: 16,
  },
  previewImage: {
    width: "100%",
    height: 150,
    resizeMode: "contain",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    width: "95%",
    height: "90%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
  },
  closeButton: {
    padding: 8,
  },
  modalCanvasContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    position: "relative",
  },
});
