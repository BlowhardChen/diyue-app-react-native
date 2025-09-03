import React from "react";
import {Text, View, Image, StyleSheet, Animated} from "react-native";
import RootSiblings from "react-native-root-siblings";

type ToastType = "success" | "error";

const successIcon = require("../../assets/images/common/icon-success.png");
const errorIcon = require("../../assets/images/common/icon-erroe.png");

let toastInstance: RootSiblings | null = null;

export const showCustomToast = (type: ToastType, message: string) => {
  if (toastInstance) {
    toastInstance.destroy();
    toastInstance = null;
  }

  const iconSource = type === "error" ? errorIcon : successIcon;

  const opacity = new Animated.Value(0);

  toastInstance = new RootSiblings(
    (
      <View style={styles.overlay} pointerEvents="none">
        <Animated.View style={[styles.toastContainer, {opacity}]}>
          <Image source={iconSource} style={styles.toastIcon} />
          <Text style={styles.toastText}>{message}</Text>
        </Animated.View>
      </View>
    ),
  );

  // 动画
  Animated.timing(opacity, {
    toValue: 1,
    duration: 200,
    useNativeDriver: true,
  }).start();

  setTimeout(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      toastInstance?.destroy();
      toastInstance = null;
    });
  }, 2000);
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  toastContainer: {
    backgroundColor: "rgba(17,17,17,0.8)",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  toastIcon: {
    width: 32,
    height: 32,
    marginBottom: 10,
  },
  toastText: {
    color: "#fff",
    fontSize: 16,
  },
});
