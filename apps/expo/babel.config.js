/** @type {import("@babel/core").ConfigFunction} */
module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],

    plugins: [["module-resolver", {
      root: ["./"],

      alias: {
        "@": "./",
        "tailwind.config": "./tailwind.config.js"
      }
    }]]
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