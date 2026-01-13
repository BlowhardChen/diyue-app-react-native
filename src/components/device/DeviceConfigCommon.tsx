import React, {ReactNode} from "react";
import {View, Text, StyleSheet, TouchableOpacity, Image} from "react-native";

interface DeviceConfigCommonProps {
  visible: boolean;
  popupTitle: string;
  children: ReactNode;
  onClosePopup: () => void;
  onClickCancel: () => void;
  onClickSave: () => void;
}

const DeviceConfigCommon: React.FC<DeviceConfigCommonProps> = ({
  visible,
  popupTitle,
  children,
  onClosePopup,
  onClickCancel,
  onClickSave,
}) => {
  if (!visible) return null; // 不显示时直接返回 null

  return (
    // 不使用Moadl是因为自定义Toast无法穿透Moadl
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={styles.popup}>
        <View style={styles.popupBox}>
          {/* Header */}
          <View style={styles.popupHeader}>
            <Text style={styles.title}>{popupTitle}</Text>
            <TouchableOpacity style={styles.icon} onPress={onClosePopup}>
              <Image source={require("@/assets/images/home/icon-close.png")} style={styles.closeImage} />
            </TouchableOpacity>
          </View>

          {/* Content Slot */}
          <View style={styles.popupContent}>{children}</View>

          {/* Bottom Buttons */}
          <View style={styles.bottomButton}>
            <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onClickCancel}>
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.save]} onPress={onClickSave}>
              <Text style={styles.saveText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default DeviceConfigCommon;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    zIndex: 999, // 保证在最顶层
  },
  popup: {
    width: "100%",
  },
  popupBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: "90%",
  },
  popupHeader: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
  },
  icon: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -13,
  },
  closeImage: {
    width: 26,
    height: 26,
  },
  popupContent: {
    minHeight: 300,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  bottomButton: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 84,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  button: {
    width: 160,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  cancel: {
    backgroundColor: "#f0f2f5",
  },
  save: {
    backgroundColor: "#08ae3c",
  },
  cancelText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#666",
  },
  saveText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#fff",
  },
});
