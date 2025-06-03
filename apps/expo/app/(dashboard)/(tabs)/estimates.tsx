import React, { useRef, useState } from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import { userStore } from "@/lib/state/user";
import { Redirect } from "expo-router";
import EstimateList from "@/components/estimates/EstimateList";
import CreateNewEstimate from "@/components/estimates/CreateNewEstimate";

export default function EstimateScreen() {
  const [isCreatingNewEstimate, setIsCreatingNewEstimate] = useState(false);

  const handleNewEstimate = () => {
    setIsCreatingNewEstimate(true);
  };

  const handleCloseModal = async () => {
    setIsCreatingNewEstimate(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <EstimateList onNewEstimate={handleNewEstimate} />

      <CreateNewEstimate
        visible={isCreatingNewEstimate}
        onClose={handleCloseModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
});
