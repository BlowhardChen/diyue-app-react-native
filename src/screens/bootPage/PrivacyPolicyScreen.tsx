import React from "react";
import {View, Text, StyleSheet, TouchableOpacity, ImageBackground, BackHandler, Platform} from "react-native";
import {NavigationProp, useNavigation} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type RootStackParamList = {
  ServiceAgreement: undefined;
  PrivacyPolicyDetail: undefined;
};

const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const linkClick = (type: "service" | "privacy") => {
    switch (type) {
      case "service":
        navigation.navigate("ServiceAgreement");
        break;
      case "privacy":
        navigation.navigate("PrivacyPolicyDetail");
        break;
    }
  };

  const disagree = () => {
    if (Platform.OS === "android") {
      BackHandler.exitApp();
    }
  };

  const agree = async () => {
    await AsyncStorage.setItem("agree", "1"); // 记录用户已同意
    navigation.goBack();
  };

  return (
    <ImageBackground source={require("../../assets/images/bootPage/boot.png")} style={styles.background} resizeMode="cover">
      <View style={styles.dialogBox}>
        <View style={styles.dialog}>
          <Text style={styles.title}>欢迎使用地约APP</Text>
          <View style={styles.content}>
            <Text style={styles.contentText}>
              请你务必审慎阅读、充分理解“服务协议”和“隐私政策”各条款，包括但不限于：为了更好的向你提供服务，我们需要收集你的设备标识、操作日志等信息用于分析、优化应用性能。
            </Text>
            <Text style={styles.contentText}>
              你可阅读
              <Text style={styles.link} onPress={() => linkClick("service")}>
                《服务协议》
              </Text>
              和
              <Text style={styles.link} onPress={() => linkClick("privacy")}>
                《隐私政策》
              </Text>
              了解详细信息。如果你同意，请点击下面按钮开始接受我们的服务。
            </Text>
          </View>
          <View style={styles.btnBox}>
            <TouchableOpacity style={styles.btn} onPress={disagree}>
              <Text style={styles.btnText}>不同意并退出</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.agreeBtn]} onPress={agree}>
              <Text style={[styles.btnText, styles.agreeBtnText]}>同意</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {flex: 1, width: "100%", height: "100%"},
  dialogBox: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
  },
  content: {marginTop: 10},
  contentText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: "left",
    marginBottom: 10,
  },
  link: {
    color: "#08ae3c",
    fontWeight: "500",
  },
  btnBox: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "space-around",
  },
  btn: {
    width: "90%",
    height: 44,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
    marginBottom: 10,
  },
  agreeBtn: {
    backgroundColor: "#08ae3c",
  },
  btnText: {
    fontSize: 16,
    fontWeight: "500",
    color: "gray",
  },
  agreeBtnText: {
    color: "#fff",
  },
});

export default PrivacyPolicyScreen;
