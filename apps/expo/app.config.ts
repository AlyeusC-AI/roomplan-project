import { ExpoConfig } from "@expo/config";

const config: ExpoConfig = {
  name: "ServiceGeek",
  slug: "sevicegeek-mobile",
  owner: "servicegeek",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  version: "1.1.0",
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
    buildNumber: "2"
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  extra: {
    eas: {
      projectId: "f62cbfa4-7182-478d-b382-e6077f40db9b",
    },
  },
  plugins: [
    ["expo-asset"],
    ["expo-font"],
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
          compileSdkVersion: 34,
          targetSdkVersion: 34,
          buildToolsVersion: "30.0.2",
          kotlinVersion: "1.7.10",
        },
      },
    ],
  ],
};

export default config;
