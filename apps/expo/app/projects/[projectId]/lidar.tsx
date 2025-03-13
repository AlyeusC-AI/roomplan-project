import React, { useState, useEffect } from 'react';
import { NativeModules, View, Text, StyleSheet,
  TouchableOpacity, Platform } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import LidarScan from '@/components/project/LidarScan';
import { MaterialIcons } from '@expo/vector-icons';

// Check if device has LiDAR sensor (iOS only)
const hasLidarSensor = async (): Promise<boolean> => {
  return true
  if (Platform.OS === 'ios') {
    const { ARKitModule } = NativeModules;
    console.log('ARKitModule', ARKitModule)
    if (ARKitModule && ARKitModule.isARDetectionAvailable) {
      try {
        const isLidarAvailable = await ARKitModule.isSceneReconstructionAvailable();
        return isLidarAvailable;
      } catch (error) {
        console.error("Error checking LiDAR availability:", error);
        return false;
      }
    }
  }
  return false;
};

interface LidarScanExampleProps {
  onScanComplete?: (data: any) => void;
}

const LidarScanExample: React.FC<LidarScanExampleProps> = ({ onScanComplete }) => {
  const [showScanner, setShowScanner] = React.useState(false);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    const checkSupport = async () => {
      const hasLidar = await hasLidarSensor();
      setIsSupported(hasLidar);
    };
    
    checkSupport();
  }, []);

  useEffect(() => {
    // Update header visibility when showScanner changes
    navigation.setOptions({
      headerShown: !showScanner
    });
  }, [showScanner, navigation]);

  const handleScanComplete = (data: any) => {
    // Process scan data
    console.log('Scan completed:', data);
    
    // Hide scanner
    setShowScanner(false);
    
    // Call parent callback if provided
    if (onScanComplete) {
      onScanComplete(data);
    }
  };

  const handleStartScan = () => {
    setShowScanner(true);
  };

  const handleCancel = () => {
    setShowScanner(false);
  };

  if (isSupported === null) {
    // Loading state
    return (
      <View style={[styles.container, styles.centerContent]}>
        <MaterialIcons name="hourglass-empty" size={64} color="#007AFF" />
        <Text style={[styles.text, styles.loadingText]}>Checking device compatibility...</Text>
      </View>
    );
  }

  if (!isSupported) {
    // Not supported message
    return (
      <View style={[styles.container, styles.centerContent]}>
        {Platform.OS === 'ios' ? (
          <>
            <MaterialIcons name="error-outline" size={64} color="#FF3B30" />
            <Text style={[styles.text, styles.errorTitle]}>LiDAR Sensor Required</Text>
            <Text style={[styles.text, styles.errorDescription]}>
              This feature requires a device with a LiDAR sensor. Please use an iPhone 12 Pro or newer.
            </Text>
          </>
        ) : (
          <>
            <MaterialIcons name="build" size={64} color="#FF9500" />
            <Text style={[styles.text, styles.errorTitle]}>Coming Soon</Text>
            <Text style={[styles.text, styles.errorDescription]}>
              We're working hard to bring this feature to Android devices. Stay tuned for updates!
            </Text>
          </>
        )}
      </View>
    );
  }

  if (showScanner) {
    return (
      <View style={styles.fullScreenContainer}>
        <LidarScan 
          onScanComplete={handleScanComplete}
          style={styles.scanner}
        />
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={handleCancel}
        >
          <MaterialIcons name="close" size={32} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>3D Room Scanner</Text>
      <Text style={styles.description}>
        Use your device's LiDAR sensor to create a 3D model of your room.
        This feature is only available on iOS devices with LiDAR sensors.
      </Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={handleStartScan}
      >
        <Text style={styles.buttonText}>Start Room Scan</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fullScreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    backgroundColor: '#000',
  },
  scanner: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 40,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginHorizontal: 40,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#007AFF',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#666',
  },
});

export default LidarScanExample; 