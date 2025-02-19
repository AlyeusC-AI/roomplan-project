import { ViewProps } from 'react-native';
import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

export type Props = {
  url?: string;
} & ViewProps;

const NativeView: React.ComponentType<Props> = requireNativeViewManager('RoomPlanView');

export default function RoomPlanView(props: Props) {
  return <NativeView {...props} />
}
