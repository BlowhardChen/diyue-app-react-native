const {getDefaultConfig, mergeConfig} = require("@react-native/metro-config");
const path = require("path");

const config = {
  resolver: {
    // 告诉 Metro 识别别名，extraNodeModules 让 @ 指向 src 目录
    extraNodeModules: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  watchFolders: [
    // 让 Metro 监控 src 目录
    path.resolve(__dirname, "src"),
  ],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
