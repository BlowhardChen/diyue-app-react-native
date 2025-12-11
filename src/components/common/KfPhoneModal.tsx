import React from "react";
import {View, Text, TouchableOpacity, Image, Modal, StyleSheet} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import usePhoneCall from "@/hooks/usePhoneCall"; // 根据实际路径调整
import {Global} from "@/styles/global";
import {on} from "events";

// 定义组件属性接口
interface CustomerServicePopupProps {
  // 可扩展自定义属性，比如自定义电话、标题等
  phoneNumber?: string;
  title?: string;
  onClosePopup: () => void;
}

/**
 * 客服电话弹窗组件
 * @param {string} phoneNumber - 客服电话号码（默认：400-110-5006）
 * @param {string} title - 弹窗标题（默认：客服电话）
 */
const CustomerServicePopup: React.FC<CustomerServicePopupProps> = ({
  onClosePopup,
  phoneNumber = "400-110-5006",
  title = "客服电话",
}) => {
  const {callPhone} = usePhoneCall();

  // 关闭弹窗处理函数
  const handleClosePopup = () => {
    onClosePopup();
  };

  // 拨打电话处理函数
  const handleCallPhone = () => {
    callPhone(phoneNumber);
  };

  return (
    <Modal transparent animationType="fade">
      <View style={styles.popupOverlay}>
        <LinearGradient
          style={styles.kfPopupContent}
          colors={["#E4FFE8", "#F0FFF3", "#FFFFFF"]}
          locations={[0, 0.6, 1]}
          start={{x: 0.5, y: 0}}
          end={{x: 0.5, y: 1}}>
          <Image source={require("@/assets/images/my/icon-kf-bg.png")} style={styles.kfBgImage} resizeMode="cover" />
          <View style={styles.kfTextContainer}>
            <Text style={styles.kfTitle}>{title}</Text>
            <Text style={styles.kfPhone}>{phoneNumber}</Text>
          </View>
          <TouchableOpacity style={styles.callBtn} onPress={handleCallPhone}>
            <Text style={styles.callBtnText}>立即拨打</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closePopupBtn} onPress={handleClosePopup}>
            <Image source={require("@/assets/images/my/icon-close-popup.png")} style={styles.closePopupIcon} resizeMode="cover" />
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  kfPopupContent: {
    width: "80%",
    height: 272,
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
    paddingTop: 10,
  },
  kfBgImage: {
    width: 91,
    height: 95.5,
  },
  kfTextContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  kfTitle: {
    fontSize: 20,
  },
  kfPhone: {
    fontSize: 28,
    marginTop: 8,
  },
  callBtn: {
    width: 231,
    height: 46,
    backgroundColor: Global.colors.primary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 19,
  },
  callBtnText: {
    fontSize: 20,
    color: "#fff",
  },
  closePopupBtn: {
    marginTop: 40,
    width: 32,
    height: 32,
  },
  closePopupIcon: {
    width: "100%",
    height: "100%",
  },
});

// 导出默认组件
export default CustomerServicePopup;
