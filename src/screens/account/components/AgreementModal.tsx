// components/AgreementModal.tsx
import React from "react";
import {Modal, View, Text, TouchableOpacity, StyleSheet, Image, StatusBar} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";

interface Props {
  visible: boolean;
  onClose: () => void;
  onAgree: () => void;
}

type RootStackParamList = {
  Main: undefined;
  CodeLogin: {mobile: string; viewType: string};
  Register: {viewType: string};
  ServiceAgreement: undefined;
  PrivacyPolicyDetail: undefined;
};

const AgreementModal: React.FC<Props> = ({visible, onClose, onAgree}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent presentationStyle="overFullScreen">
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* 关闭按钮 */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <View>
              <Image
                source={require("../../../assets/images/common/icon-close.png")}
                style={styles.closeText}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>

          {/* 标题 */}
          <Text style={styles.title}>用户注册协议及隐私政策</Text>

          {/* 内容 */}
          <Text style={styles.content}>
            为了更好地保障您的合法权益，请您阅读并同意以下协议
            <Text style={styles.link} onPress={() => navigation.navigate("ServiceAgreement")}>
              《服务协议》
            </Text>
            <Text> </Text>
            <Text style={styles.link} onPress={() => navigation.navigate("PrivacyPolicyDetail")}>
              《隐私政策》
            </Text>
            ，未注册手机号将自动注册。
          </Text>

          {/* 同意按钮 */}
          <TouchableOpacity style={styles.agreeButton} onPress={onAgree}>
            <Text style={styles.agreeText}>同意并登录</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AgreementModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modal: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 10,
    zIndex: 10,
  },
  closeText: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  content: {
    fontSize: 14,
    color: "#333",
    lineHeight: 22,
    marginBottom: 20,
  },
  link: {
    color: "#08AE3C",
  },
  agreeButton: {
    backgroundColor: "#08AE3C",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  agreeText: {
    color: "#fff",
    fontSize: 16,
  },
});
