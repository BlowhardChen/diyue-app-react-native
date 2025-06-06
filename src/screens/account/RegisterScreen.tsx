// 注册页面
import {useState, useEffect, SetStateAction} from "react";
import {View, Text, TextInput, Image, TouchableOpacity, Platform, BackHandler, StatusBar} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {RouteProp, useNavigation, useRoute} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import {styles} from "./styles/RegisterScreen";
import LinearGradient from "react-native-linear-gradient";

type RootStackParamList = {
  Main: undefined;
  CodeLogin: {mobile: string; viewType: string};
  Register: {viewType: string};
  ServiceAgreement: undefined;
  PrivacyPolicyDetail: undefined;
};

type RegisterRouteParams = {
  viewType?: string;
};

const RegisterScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<{params: RegisterRouteParams}>>();

  // 状态管理
  const [phone, setPhone] = useState("");
  const [titleText, setTitleText] = useState("注册账号");
  const [viewType, setViewType] = useState("register");
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastIcon, setToastIcon] = useState(null);

  // 初始化
  useEffect(() => {
    const {viewType: routeViewType} = route.params || {};
    setViewType(routeViewType || "register");
    setTitleText(routeViewType === "register" ? "注册账号" : "找回密码");

    if (Platform.OS === "android") {
      const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
        navigation.goBack();
        return true;
      });
      return () => backHandler.remove();
    }
  }, [navigation, route.params]);

  // 返回上一页
  const backView = () => {
    navigation.goBack();
  };

  // 清除手机号
  const clearPhone = () => {
    setPhone("");
  };

  // 显示Toast
  const showToast = (icon: SetStateAction<null>, message: SetStateAction<string>, duration = 2000) => {
    setToastIcon(icon);
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), duration);
  };

  // 验证手机号
  const validatePhoneNumber = (phoneNumber: string) => {
    const phoneNumberRegex = /^1[3456789]\d{9}$/;
    if (!phoneNumberRegex.test(phoneNumber.replace(/\s/g, ""))) {
      showToast(require("../../assets/images/common/icon-erroe.png"), "请输入正确手机号");
      return false;
    }
    return true;
  };

  // 处理手机号输入变化
  const handlePhoneChange = (text: string) => {
    // 移除所有空格
    let cleanedText = text.replace(/\s/g, "");

    // 限制长度为11位
    if (cleanedText.length > 11) {
      cleanedText = cleanedText.substring(0, 11);
    }

    // 格式化手机号 (3-4-4)
    let formattedText = "";
    for (let i = 0; i < cleanedText.length; i++) {
      if (i === 3 || i === 7) {
        formattedText += " " + cleanedText[i];
      } else {
        formattedText += cleanedText[i];
      }
    }

    setPhone(formattedText);
  };

  // 获取验证码
  const getCode = () => {
    if (!phone.trim()) {
      showToast(require("../../assets/images/common/icon-erroe.png"), "请输入手机号");
      return;
    }

    if (!validatePhoneNumber(phone)) {
      return;
    }

    // 导航到验证码页面
    navigation.navigate("CodeLogin", {
      mobile: phone.replace(/\s/g, ""),
      viewType: viewType,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      {/* 头部返回按钮 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={backView} style={styles.backButton}>
          <Image source={require("../../assets/images/common/icon-back-green.png")} style={styles.backIcon} />
          <Text style={styles.backText}>返回</Text>
        </TouchableOpacity>
      </View>

      {/* 主要内容 */}
      <View style={styles.content}>
        {/* 标题 */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{titleText}</Text>
          <LinearGradient
            colors={["rgba(8,174,60,0.3)", "rgba(8,174,60,0)"]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            angle={243}
            angleCenter={{x: 0.5, y: 0.5}}
            style={styles.titleUnderline}
          />
        </View>

        {/* 手机号输入框 */}
        <View style={styles.inputContainer}>
          <Image source={require("../../assets/images/login/icon-phone.png")} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={handlePhoneChange}
            placeholder="请输入账号"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            maxLength={13}
          />
          {phone ? (
            <TouchableOpacity onPress={clearPhone}>
              <Image source={require("../../assets/images/login/icon-clear.png")} style={styles.inputIcon} />
            </TouchableOpacity>
          ) : (
            <View style={styles.inputIcon} />
          )}
        </View>

        {/* 获取验证码按钮 */}
        <TouchableOpacity style={[styles.button, {opacity: phone ? 1 : 0.5}]} onPress={getCode} disabled={!phone}>
          <Text style={styles.buttonText}>获取验证码</Text>
        </TouchableOpacity>
      </View>

      {/* Toast提示 */}
      {isToastVisible && (
        <View style={styles.toastContainer}>
          {toastIcon && <Image source={toastIcon} style={styles.toastIcon} />}
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default RegisterScreen;
