// 权限弹窗组件
import {Global} from "@/styles/global";
import {View, Text, Image, Modal, TouchableOpacity, StyleSheet} from "react-native";
import LinearGradient from "react-native-linear-gradient";

interface PopupProps {
  visible: boolean;
  title: string;
  message: string;
  onAccept?: () => void;
  onReject?: () => void;
}

const PermissionPopup: React.FC<PopupProps> = ({
  visible,
  title = "开启位置权限",
  message = "获取位置权限将用于获取当前定位与记录轨迹",
  onAccept,
  onReject,
}) => {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onReject}>
      <View style={styles.centeredView}>
        <LinearGradient
          style={styles.modalView}
          colors={["#E4FFE8", "#F0FFF3", "#FFFFFF"]}
          locations={[0, 0.6, 1]}
          start={{x: 0.5, y: 0}}
          end={{x: 0.5, y: 1}}>
          <Image source={require("@/assets/images/common/icon-permission.png")} style={styles.iconImg} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={[styles.button, styles.acceptButton]} onPress={onAccept}>
              <Text style={[styles.buttonText, styles.acceptButtonText]}>马上开启</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.rejectButton]} onPress={onReject}>
              <Text style={styles.buttonText}>暂不开启</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
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
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Global.colors.textDark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: 279,
    height: 366,
  },
  iconImg: {
    width: 80,
    height: 70,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 18,
    marginBottom: 24,
    textAlign: "center",
    color: Global.colors.textDark,
    lineHeight: 22,
  },
  buttonsContainer: {
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
    fontSize: 15,
  },
  acceptButtonText: {
    color: "white",
  },
});

export default PermissionPopup;
