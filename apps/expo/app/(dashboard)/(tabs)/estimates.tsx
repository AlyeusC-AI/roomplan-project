import React, { useRef, useState } from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import { userStore } from "@/lib/state/user";
import { Redirect } from "expo-router";
import EstimateList, { EstimateListRef } from "@/components/estimates/EstimateList";
import CreateNewEstimate from "@/components/estimates/CreateNewEstimate";

export default function EstimateScreen() {
  const { session } = userStore((state) => state);
  const [isCreatingNewEstimate, setIsCreatingNewEstimate] = useState(false);
  const estimateListRef = useRef<EstimateListRef>(null);

  // Redirect to login if not authenticated
  if (!session) {
    console.log("EstimateScreen: No session, redirecting to login");
    return <Redirect href="/login" />;
  }

  const handleNewEstimate = () => {
    setIsCreatingNewEstimate(true);
  };

  const handleCloseModal = async () => {
    setIsCreatingNewEstimate(false);
    // Refresh estimate list after creating a new estimate
    if (estimateListRef.current) {
      console.log("EstimateScreen: Refreshing estimate list");
      await estimateListRef.current.fetchEstimateData();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <EstimateList
        ref={estimateListRef}
        onNewEstimate={handleNewEstimate}
      />
      
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