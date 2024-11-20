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
// const path = require("path");
// const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

// const defaultConfig = getDefaultConfig(__dirname);
// const { resolver: { sourceExts, assetExts } } = defaultConfig;

// /**
//  * Metro configuration
//  * https://facebook.github.io/metro/docs/configuration
//  *
//  * @type {import('metro-config').MetroConfig}
//  */
// const config = {
//   transformer: {
//     babelTransformerPath: require.resolve("react-native-svg-transformer"),
//   },
//   resolver: {
//     assetExts: assetExts.filter((ext) => ext !== "svg"),
//     sourceExts: [...sourceExts, "svg"],
//   },
//   watchFolders: [path.resolve(__dirname, "../")],
// };

// module.exports = mergeConfig(defaultConfig, config);