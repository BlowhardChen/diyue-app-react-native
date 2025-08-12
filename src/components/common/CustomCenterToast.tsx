import Toast, {ToastOptions} from "react-native-root-toast";
import {StyleSheet, Text, View} from "react-native";
import React from "react";

/**
 * 通用 Toast 展示组件
 */
const showToast = ({
  message,
  duration = Toast.durations.SHORT,
  position = Toast.positions.CENTER,
  backgroundColor = "rgba(0,0,0,0.7)",
  textColor = "#fff",
  icon,
}: {
  message: string;
  duration?: number;
  position?: number;
  backgroundColor?: string;
  textColor?: string;
  icon?: React.ReactNode;
}) => {
  Toast.show(
    <View style={styles.row}>
      {icon}
      <Text style={[styles.toastText, {color: textColor}]}>{message}</Text>
    </View>,
    {
      duration,
      position,
      shadow: true,
      animation: true,
      hideOnPress: true,
      containerStyle: [styles.toastContainer, {backgroundColor}],
    },
  );
};

// 居中提示
const showCenterToast = (message: string, duration?: number) => {
  showToast({message, duration, position: Toast.positions.CENTER});
};

// 顶部提示
const showTopToast = (message: string, duration?: number) => {
  showToast({message, duration, position: Toast.positions.TOP});
};

// 错误提示（红色背景）
const showErrorToast = (message: string, duration?: number) => {
  showToast({
    message,
    duration,
    position: Toast.positions.CENTER,
    backgroundColor: "#e74c3c",
    icon: <Text style={styles.icon}>❌</Text>,
  });
};

// 成功提示（绿色背景）
const showSuccessToast = (message: string, duration?: number) => {
  showToast({
    message,
    duration,
    position: Toast.positions.CENTER,
    backgroundColor: "#2ecc71",
    icon: <Text style={styles.icon}>✅</Text>,
  });
};

const styles = StyleSheet.create({
  toastContainer: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    maxWidth: "85%",
    flexDirection: "row",
    alignItems: "center",
  },
  toastText: {
    fontSize: 14,
    textAlign: "left",
  },
  icon: {
    marginRight: 8,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});

// 统一导出
export const ToastUtil = {
  showCenterToast,
  showTopToast,
  showErrorToast,
  showSuccessToast,
};
