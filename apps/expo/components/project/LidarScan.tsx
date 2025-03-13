import React, { useState } from 'react';
import { View, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { requireNativeComponent, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Check if the RoomPlan component is available
const isRoomPlanAvailable = () => {
  if (Platform.OS !== 'ios') return false;
  
  // Check if the native module exists
  return UIManager.getViewManagerConfig('RoomScanView') != null;
};

// Create a native component wrapper if available
const RoomScanView = isRoomPlanAvailable()
  ? requireNativeComponent('RoomScanView')
  : null;

interface LidarScanProps {
  onScanComplete?: (scanData: any) => void;
  style?: any;
}

const LidarScan = ({ onScanComplete, style }: LidarScanProps) => {
  const [finish, setFinish] = useState(false);

  const handleScanComplete = (event: any) => {
    console.log('Scan complete:', event.nativeEvent);
    if (onScanComplete) {
      onScanComplete(event.nativeEvent);
    }
  };

  const handleScanError = (event: any) => {
    console.error('Scan error:', event.nativeEvent);
  };

  if (!isRoomPlanAvailable()) {
    return null;
  }

  // Render RoomPlan for supported iOS devices
  return (
    <View style={[styles.fullScreen, style]}>
      <RoomScanView
        onCaptureCompleted={handleScanComplete}
        onCaptureError={handleScanError}
        finish={finish}
      />
      <TouchableOpacity 
        style={styles.checkButton}
        onPress={() => setFinish(true)}
      >
        <Ionicons name="checkmark" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  checkButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default LidarScan; 