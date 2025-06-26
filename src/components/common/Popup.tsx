import React from "react";
import {Modal, View, Text, TouchableOpacity, StyleSheet, TextStyle} from "react-native";

interface PopupProps {
  visible: boolean;
  title?: string;
  showTitle?: boolean;
  msgText?: string;
  showLeftBtnText?: boolean;
  leftBtnText?: string;
  rightBtnText?: string;
  rightBtnStyle?: TextStyle;
  msgTextStyle?: TextStyle;
  onLeftBtn?: () => void;
  onRightBtn?: () => void;
  children?: React.ReactNode;
}

const Popup: React.FC<PopupProps> = ({
  visible,
  title = "",
  showTitle = true,
  msgText = "",
  showLeftBtnText = true,
  leftBtnText = "",
  rightBtnText = "",
  rightBtnStyle = {},
  msgTextStyle = {},
  onLeftBtn,
  onRightBtn,
  children,
}) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.popupBox}>
        <View style={styles.popupContent}>
          <View style={styles.popupContentTop}>
            {showTitle && (
              <View style={styles.title}>
                <Text style={styles.titleText}>{title}</Text>
              </View>
            )}
            <View style={styles.msg}>
              <Text style={[styles.msgText, msgTextStyle]}>{msgText}</Text>
            </View>
          </View>

          {children}

          <View style={styles.divider} />

          <View style={styles.popupBottom}>
            {showLeftBtnText && (
              <>
                <TouchableOpacity style={styles.btnLeft} onPress={onLeftBtn}>
                  <Text style={styles.leftText}>{leftBtnText}</Text>
                </TouchableOpacity>
                <View style={styles.cross} />
              </>
            )}
            <TouchableOpacity style={styles.btnRight} onPress={onRightBtn}>
              <Text style={[styles.rightText, rightBtnStyle]}>{rightBtnText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default Popup;

const styles = StyleSheet.create({
  popupBox: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContent: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
    overflow: "hidden",
    elevation: 4,
  },
  popupContentTop: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 12,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
  },
  msg: {
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  msgText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
    textAlign: "center",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#ededed",
  },
  popupBottom: {
    flexDirection: "row",
    alignItems: "center",
    height: 51,
    width: "100%",
  },
  btnLeft: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  btnRight: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  leftText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
  },
  rightText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#08ae3c",
  },
  cross: {
    width: 1,
    height: 24,
    backgroundColor: "#ededed",
  },
});
