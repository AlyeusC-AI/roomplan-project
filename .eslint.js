module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `eslint-config-custom`
  extends: ["servicegeek"],
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
  },
};
