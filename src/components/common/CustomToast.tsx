import Toast from "react-native-root-toast";
import {Text, View, Image, StyleSheet} from "react-native";

type ToastType = "success" | "error";

const successIcon = require("../../assets/images/common/icon-success.png");
const errorIcon = require("../../assets/images/common/icon-erroe.png");

export const showCustomToast = (type: ToastType, message: string) => {
  const iconSource = type === "error" ? errorIcon : successIcon;
  Toast.show(
    <View style={styles.toastContainer}>
      <Image source={iconSource} style={styles.toastIcon} />
      <Text style={styles.toastText}>{message}</Text>
    </View>,
    {
      duration: Toast.durations.SHORT,
      position: Toast.positions.CENTER,
      shadow: false,
      backgroundColor: "transparent", // 防止重复背景
      animation: true,
      hideOnPress: true,
    },
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    backgroundColor: "#111111",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  toastIcon: {
    width: 40,
    height: 40,
    marginBottom: 10,
  },
  toastText: {
    color: "#fff",
    fontSize: 16,
  },
});
