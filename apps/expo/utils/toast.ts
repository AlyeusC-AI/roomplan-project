import { ToastAndroid, Platform, Alert } from 'react-native';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: 'short' | 'long';
}

export const showToast = ({ 
  message, 
  type = 'info', 
  duration = 'short' 
}: ToastOptions) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(
      message, 
      duration === 'short' ? ToastAndroid.SHORT : ToastAndroid.LONG
    );
  } else {
    // iOS doesn't have a built-in toast, so we'll use an alert
    Alert.alert(
      type.charAt(0).toUpperCase() + type.slice(1),
      message,
      [{ text: 'OK' }]
    );
  }
}; 