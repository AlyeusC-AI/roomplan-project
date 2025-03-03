import { ExpoConfig } from "@expo/config";

const config: ExpoConfig = {
  name: "Restoregeek",
  slug: "sevicegeek-mobile",
  owner: "servicegeek",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  scheme: "servicegeek",
  version: "1.3.1",
  runtimeVersion: "appVersion",
  updates: {
    fallbackToCacheTimeout: 0,
    url: "https://u.expo.dev/f62cbfa4-7182-478d-b382-e6077f40db9b",
  },
  assetBundlePatterns: ["**/*"],
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  android: {
    package: "com.servicegeek.servicegeekmobile",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF",
    },
    permissions: ["com.google.android.gms.permission.AD_ID"],
  },
  ios: {
    bundleIdentifier: "com.servicegeek.servicegeekmobile",
    supportsTablet: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSPhotoLibraryUsageDescription:
        "This app requires access to the photo library.",
      NSLocationWhenInUseUsageDescription:
        "This app requires access to your location.",
    },
  },
  web: {
    favicon: "./assets/icon.png",
  },

  extra: {
    eas: {
      projectId: "f62cbfa4-7182-478d-b382-e6077f40db9b",
    },
    "expo-router": {
      appRoot: "app",
    },
  },
  plugins: [
    ["expo-asset"],
    ["expo-font"],
    "expo-router",
    [
      "react-native-vision-camera",
      {
        cameraPermissionText:
          "$(PRODUCT_NAME) needs access to the Camera to take photos during the mitigation process.",
      },
    ],
    [
      "expo-tracking-transparency",
      {
        userTrackingPermission:
          "This identifier will be used to deliver personalized ads to you.",
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          buildToolsVersion: "30.0.2",
          kotlinVersion: "1.7.10",
        },
        ios: {
          deploymentTarget: "16.0",
        },
      },
    ],
    [
      "expo-speech-recognition",
      {
        microphonePermission: "Allow $(PRODUCT_NAME) to use the microphone.",
        speechRecognitionPermission:
          "Allow $(PRODUCT_NAME) to use speech recognition.",
        androidSpeechServicePackages: [
          "com.google.android.googlequicksearchbox",
        ],
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission: "The app needs access to your photos.",
      },
    ],
  ],
};

export default config;
