module.exports = {
  root: true,
  globals: {
    // 地图js全局只读变量
    ol: "readonly",
    MapCore: "readonly",
    LayerModule: "readonly",
    MarkerModule: "readonly",
  },
  extends: ["@react-native", "plugin:prettier/recommended"],
  rules: {
    // 可以在这里添加或覆盖规则
    "prettier/prettier": "error",
    "react/no-unstable-nested-components": ["warn", { allowAsProps: true }],
    "react-native/no-inline-styles": "off",
  },
  // 新增针对 web 目录的特殊配置
  overrides: [
    {
      files: ["android/app/src/main/assets/web/​**​/*.js"],
      rules: {
        // 可在此处为 web 目录添加特殊规则
        "no-undef": "off", // 如果 web 目录有特殊全局变量
        "no-console": "off", // 根据需要调整
      },
    },
  ],
};
