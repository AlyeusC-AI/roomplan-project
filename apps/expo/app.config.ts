import { ExpoConfig } from "@expo/config-types";

const config: ExpoConfig = {
  name: "ServiceGeek",
  slug: "sevicegeek-mobile",
  owner: "servicegeek",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  version: "2.1.0",
  updates: {
    fallbackToCacheTimeout: 0,
    url: "https://u.expo.dev/f62cbfa4-7182-478d-b382-e6077f40db9b",
  },
  runtimeVersion: {
    policy: "sdkVersion",
  },
  // runtimeVersion: "1.0.0",
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
  ],
};

export default config;
