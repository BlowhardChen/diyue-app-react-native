// 服务协议&隐私政策弹窗页面
import React from "react";
import {View, Text, TouchableOpacity, ImageBackground, BackHandler, Platform} from "react-native";
import {useNavigation} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {StackNavigationProp} from "@react-navigation/stack";
import {isTokenValid} from "@/utils/auth";
import {styles} from "./styles/PrivacyPolicyScreen";

type RootStackParamList = {
  ServiceAgreement: undefined;
  PrivacyPolicyDetail: undefined;
  Main: undefined;
  Login: undefined;
};

const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

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

  // 不同意并退出
  const disagree = () => {
    if (Platform.OS === "android") {
      BackHandler.exitApp();
    }
  };

  // 同意
  const agree = async () => {
    await AsyncStorage.setItem("userAgreed", "true");

    const valid = await isTokenValid();

    if (valid) {
      navigation.replace("Main");
    } else {
      navigation.replace("Login");
    }
  };

  return (
    <>
      <ImageBackground source={require("@/assets/images/bootPage/boot.png")} style={styles.background} resizeMode="cover">
        <View style={styles.dialogBox}>
          <View style={styles.dialog}>
            <Text style={styles.title}>欢迎使用地约APP</Text>
            <View style={styles.content}>
              <Text style={styles.contentText}>
                &emsp;&emsp;请你务必审慎阅读、充分理解“服务协议”和“隐私政策”各条款，包括但不限于：为了更好的向你提供服务，我们需要收集你的设备标识、操作日志等信息用于分析、优化应用性能。
              </Text>
              <Text style={styles.contentText}>
                &emsp;&emsp;你可阅读
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
              <TouchableOpacity style={styles.disbtn} onPress={disagree}>
                <Text style={styles.btnText}>不同意并退出</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.agreeBtn]} onPress={agree}>
                <Text style={[styles.btnText, styles.agreeBtnText]}>同意</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </>
  );
};

export default PrivacyPolicyScreen;
