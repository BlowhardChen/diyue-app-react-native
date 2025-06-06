module.exports = {
  root: true,
  extends: ["@react-native", "plugin:prettier/recommended"],
  rules: {
    // 可以在这里添加或覆盖规则
    "prettier/prettier": "error",
    "react/no-unstable-nested-components": ["warn", {allowAsProps: true}],
    "react-native/no-inline-styles": "off",
  },
};
