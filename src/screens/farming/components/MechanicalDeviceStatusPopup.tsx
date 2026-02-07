// 农事详情设备状态弹窗组件
import {Global} from "@/styles/global";
import {View, Text, Image, Modal, TouchableOpacity, StyleSheet} from "react-native";

interface PopupProps {
  visible: boolean;
  title: string;
  message: string;
  acceptButtonText: string;
  rejectButtonText: string;
  rejectButtonStyle?: {};
  onAccept?: () => void;
  onReject?: () => void;
}

const MechanicalDeviceStatusPopup: React.FC<PopupProps> = ({
  visible,
  title = "提示",
  message = "获取位置权限将用于获取当前定位与记录轨迹",
  acceptButtonText = "有设备，绑定设备",
  rejectButtonText = "无设备，GPS记录",
  rejectButtonStyle = {},
  onAccept,
  onReject,
}) => {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onReject}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={[styles.button, styles.acceptButton]} onPress={onAccept}>
              <Text style={[styles.buttonText, styles.acceptButtonText, rejectButtonStyle]}>{acceptButtonText}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.rejectButton]} onPress={onReject}>
              <Text style={styles.buttonText}>{rejectButtonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    borderRadius: 12,
    padding: 24,
    paddingTop: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    elevation: 1,
    width: 311,
    height: 290,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 18,
    color: "#000",
    lineHeight: 22,
  },
  buttonsContainer: {
    marginTop: 26,
    width: "100%",
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 2,
    minWidth: "45%",
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: Global.colors.primary,
  },
  rejectButton: {
    marginTop: 16,
    backgroundColor: "#EFF2F3",
  },
  buttonText: {
    color: Global.colors.textGrayDark,
    fontWeight: "bold",
    fontSize: 20,
  },
  acceptButtonText: {
    color: "white",
  },
});

export default MechanicalDeviceStatusPopup;
