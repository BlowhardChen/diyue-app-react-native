import React from "react";
import {View, Text, Image, TouchableOpacity, StyleSheet, Modal, DimensionValue} from "react-native";

const PopupBottom = ({
  popupHeight: height = "auto",
  popupTitle = "",
  showBack = true,
  onClose,
  onBack,
  children,
}: {
  popupHeight?: DimensionValue;
  popupTitle?: string;
  showBack?: boolean;
  onClose: () => void;
  onBack?: () => void;
  children: React.ReactNode;
}) => {
  return (
    <Modal visible={true} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.popupBox}>
        <View style={[styles.popupContent, {height}]}>
          <View style={styles.header}>
            {showBack && (
              <TouchableOpacity style={styles.headerBack} onPress={onBack}>
                <Image source={require("@/assets/images/common/icon-back.png")} style={styles.backIcon} />
              </TouchableOpacity>
            )}
            <Text style={styles.headerTitle}>{popupTitle}</Text>
            <TouchableOpacity style={styles.headerClose} onPress={onClose}>
              <Image source={require("@/assets/images/home/icon-close.png")} style={styles.closeIcon} />
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
};

export default PopupBottom;

const styles = StyleSheet.create({
  popupBox: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1999,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  popupContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2000,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    position: "relative",
  },
  headerBack: {
    position: "absolute",
    top: 11,
    left: 22,
  },
  backIcon: {
    width: 26,
    height: 26,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
  },
  headerClose: {
    position: "absolute",
    top: 11,
    right: 12,
  },
  closeIcon: {
    width: 26,
    height: 26,
  },
});
