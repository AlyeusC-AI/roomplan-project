/** @type {import("@babel/core").ConfigFunction} */
module.exports = function (api) {
  api.cache(true);

  // Make Expo Router run from `src/app` instead of `app`.
  // Path is relative to `/node_modules/expo-router`
  process.env.EXPO_ROUTER_APP_ROOT = "../../apps/expo/src/app";

  return {
    // plugins: ["react-native-reanimated/plugin"],
    presets: ["babel-preset-expo"],
  };
};
