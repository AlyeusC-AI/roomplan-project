import { ConfigPlugin, withDangerousMod } from "@expo/config-plugins";
import fs from "fs";
import path from "path";

const withLidar: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const iosRoot = config.modRequest.platformProjectRoot;

      const src = path.join(projectRoot, "plugins/lidar/RoomCaptureViewManager.swift");
      const dest = path.join(iosRoot, "Restoregeek", "RoomCaptureViewManager.swift");

      if (!fs.existsSync(dest)) {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
        console.log("✅ Copied RoomCaptureViewManager.swift to iOS folder.");
      }

      return config;
    },
  ]);
};

export default withLidar;
