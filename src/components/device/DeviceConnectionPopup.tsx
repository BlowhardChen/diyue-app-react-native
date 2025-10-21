import {View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Modal} from "react-native";
import PopupBottom from "../common/PopupBottom";
import {Global} from "@/styles/global";

// 设备连接提示弹窗组件
const DeviceConnectionPopup = ({
  visible,
  onClose,
  onAbortRemind,
  onConnectDevice,
}: {
  visible: boolean;
  onClose: () => void;
  onAbortRemind: () => void;
  onConnectDevice: () => void;
}) => {
  if (!visible) return null;

  return (
    <PopupBottom popupHeight={260} popupTitle="设备连接" showBack={false} onClose={onClose}>
      <View style={deviceStyles.deviceStatus}>
        <View style={deviceStyles.deviceStatusImg}>
          <Image source={require("@/assets/images/common/img-device-disconnect.png")} style={deviceStyles.statusImage} />
          <Text style={deviceStyles.deviceStatusTitle}>暂无设备</Text>
        </View>
      </View>

      <View style={deviceStyles.divider} />

      <View style={deviceStyles.deviceFoot}>
        <TouchableOpacity style={deviceStyles.btnCancel} onPress={onAbortRemind}>
          <Text style={deviceStyles.cancelText}>今天不再提醒</Text>
        </TouchableOpacity>
        <TouchableOpacity style={deviceStyles.btnConfirm} onPress={onConnectDevice}>
          <Text style={deviceStyles.confirmText}>连接设备</Text>
        </TouchableOpacity>
      </View>
    </PopupBottom>
  );
};

const deviceStyles = StyleSheet.create({
  deviceStatus: {
    width: Dimensions.get("window").width,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  deviceStatusImg: {
    alignItems: "center",
    justifyContent: "center",
  },
  statusImage: {
    width: 56,
    height: 60,
  },
  deviceStatusTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
  },
  divider: {
    width: Dimensions.get("window").width,
    height: 1,
    marginTop: 13,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  deviceFoot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 88,
  },
  btnCancel: {
    width: 167,
    height: 52,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: "#f0f2f5",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 20,
    lineHeight: 104 / 2,
    color: "#666",
  },
  btnConfirm: {
    width: 167,
    height: 52,
    borderRadius: 8,
    backgroundColor: Global.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    fontSize: 20,
    lineHeight: 52,
    color: "#fefefe",
  },
});

export default DeviceConnectionPopup;
