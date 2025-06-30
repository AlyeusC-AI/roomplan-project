import { useState } from "react";
import React from "react";
import { toast } from "sonner-native";
import {
  ActivityIndicator,
  Keyboard,
  Linking,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { userStore } from "@/lib/state/user";
import { router, useGlobalSearchParams } from "expo-router";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { projectStore } from "@/lib/state/project";
import { Phone } from "lucide-react-native";

export default function InsuranceScreen() {
  const { session: supabaseSession } = userStore((state) => state);
  const { projectId } = useGlobalSearchParams<{
    projectId: string;
  }>();

  const [loading, setLoading] = useState(false);
  const project = projectStore();

  const [adjusterName, setAdjusterName] = useState(
    project.project?.adjusterName || ""
  );
  const [adjusterPhoneNumber, setAdjusterPhoneNumber] = useState(
    project.project?.adjusterPhoneNumber || ""
  );
  const [insuranceClaimId, setInsuranceClaimId] = useState(
    project.project?.insuranceClaimId || ""
  );
  const [adjusterEmail, setAdjusterEmail] = useState(
    project.project?.adjusterEmail || ""
  );

  const updateProject = async () => {
    try {
      setLoading(true);
      await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}`,
        {
          method: "PATCH",
          headers: {
            "auth-token": `${supabaseSession?.access_token}`,
          },
          body: JSON.stringify({
            adjusterName,
            adjusterPhoneNumber,
            insuranceClaimId,
            adjusterEmail,
          }),
        }
      );
      setLoading(false);
      project.updateProject({
        adjusterName,
        adjusterPhoneNumber,
        insuranceClaimId,
        adjusterEmail,
      });
      router.dismiss();
    } catch {
      toast.error(
        "Could not update project. If this error persits, please contact support@restoregeek.app"
      );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="w-full px-4 mt-4">
        <Label className="mt-4">Adjuster Name</Label>
        <Input
          placeholder="Adjuster Name"
          value={adjusterName}
          onChangeText={(text) => setAdjusterName(text)}
        />

        <Label className="mt-4">Claim Number</Label>
        <Input
          placeholder="Claim Number"
          value={insuranceClaimId}
          onChangeText={(text) => setInsuranceClaimId(text)}
        />

        <Label className="mt-4">Adjuster Phone Number</Label>
        <Input
          placeholder="Adjuster Phone Number"
          value={adjusterPhoneNumber}
          onChangeText={(text) => setAdjusterPhoneNumber(text)}
        />

        <Label className="mt-4">Adjuster Email</Label>
        <Input
          placeholder="Adjuster Email"
          value={adjusterEmail}
          onChangeText={(text) => setAdjusterEmail(text)}
        />
        <Button
          className="mt-4"
          disabled={loading}
          onPress={() => updateProject()}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text>Update</Text>}
        </Button>

        <Button
          className="mt-4"
          disabled={loading}
          onPress={() => Linking.openURL(`tel:${adjusterPhoneNumber}`)}
          variant="outline"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <View className="flex flex-row gap-x-2 items-center justify-center">
              <Phone color="blue" size={15} />
              <Text>Call Now</Text>
            </View>
          )}
        </Button>
      </View>
    </TouchableWithoutFeedback>
  );
}
