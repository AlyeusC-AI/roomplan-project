import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { RootStackParamList } from "../types/Navigation";
import BottomTabNavigation from "../components/project/BottomTabNavigation";

export default function ProjectScreen(
  props: NativeStackScreenProps<RootStackParamList>
) {
  return <BottomTabNavigation {...props} />;
}
