import React, {useState, useEffect, useRef} from "react";
import {View, Text, TextInput, TouchableOpacity, Image, StatusBar} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {RouteProp, useNavigation, useRoute} from "@react-navigation/native";
import Toast from "react-native-root-toast";
import {debounce} from "lodash";
import {styles} from "./styles/CodeLoginScreen";
import {StackNavigationProp} from "@react-navigation/stack";

type RootStackParamList = {
  Main: undefined;
  CodeLogin: {mobile: string; viewType: string};
  Register: {viewType: string};
  SetPassword: {viewType: string; mobile: string; mobileCode: string};
};

type CodeLoginRouteParams = {
  viewType: string;
  mobile: string;
};

const CodeLoginScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<{params: CodeLoginRouteParams}>>();
  // const userInfoStore = useUserInfoStore();

  // 从路由参数获取手机号和视图类型
  const {mobile, viewType} = route.params || {};
  const phoneNumber = mobile?.replace(/\s/g, "") || "";

  // 状态管理
  const [code, setCode] = useState("");
  const [count, setCount] = useState(60);
  const [isReget, setIsReget] = useState(false);
  const [focus, setFocus] = useState(true);
  const [isCodeComplete, setIsCodeComplete] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 隐藏手机号中间四位
  const hidePhoneNumber = (phone: string) => {
    if (!phone) return "";
    const prefix = phone.substring(0, 3);
    const suffix = phone.substring(7);
    const hiddenPart = phone.substring(3, 7).replace(/\d/g, "*");
    return prefix + hiddenPart + suffix;
  };

  // 返回按钮
  const handleBack = () => {
    navigation.goBack();
  };

  // 获取验证码
  const getCode = async () => {
    try {
      let res;
      switch (viewType) {
        case "register":
          res = await getCodeRegister({mobile: phoneNumber});
          break;
        case "login":
          res = await getCodeLogin({mobile: phoneNumber});
          break;
        case "forgetPassword":
          res = await getCodeForgotPwd({mobile: phoneNumber});
          break;
        default:
          break;
      }
      if (res) {
        startCountdown();
        setCount(60);
        setIsReget(false);
      }
    } catch (error: any) {
      showToast(error.data?.msg || "获取验证码失败", "error");
    }
  };

  // 启动倒计时
  const startCountdown = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setCount(prevCount => {
        if (prevCount <= 1) {
          clearInterval(timerRef.current!);
          setIsReget(true);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
  };

  // 重新获取验证码（防抖）
  const refreshGetCode = debounce(() => {
    if (count === 0) {
      getCode();
    }
  }, 500);

  // 验证码输入处理
  const handleCodeChange = (text: string) => {
    // 只允许数字输入
    const numericText = text.replace(/[^0-9]/g, "");
    // 限制长度为6
    const trimmedText = numericText.slice(0, 6);
    setCode(trimmedText);

    if (trimmedText.length === 6) {
      setIsCodeComplete(true);
      // 自动登录或跳转
      if (viewType === "login") {
        handleAutoLogin();
      } else {
        navigation.navigate("SetPassword", {
          viewType,
          mobile: phoneNumber,
          mobileCode: trimmedText,
        });
      }
    } else {
      setIsCodeComplete(false);
    }
  };

  // 验证码登录
  const handleAutoLogin = async () => {
    try {
      const {data} = await codeLogin({
        mobile: phoneNumber,
        mobileCode: code,
      });

      //   userInfoStore.setToken(data.token);
      //   userInfoStore.setUserInfoData(data.member);

      if (data?.register) {
        navigation.navigate("SetPassword", {
          viewType: "setPassword",
          mobile: phoneNumber,
          mobileCode: code,
        });
      } else {
        navigation.navigate("Main");
      }
    } catch (error: any) {
      showToast(error.data?.msg || "登录失败", "error");
    }
  };

  // 显示Toast
  const showToast = (message: string, type: "success" | "error" = "success") => {
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      position: Toast.positions.CENTER,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
      backgroundColor: type === "error" ? "#FF4D4F" : "#52C41A",
    });
  };

  // 组件挂载时获取验证码
  useEffect(() => {
    getCode();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // 处理输入框聚焦
  const handleFocus = () => {
    setFocus(true);
  };

  // 处理输入框失去焦点
  const handleBlur = () => {
    setFocus(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* 头部返回按钮 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Image source={require("../../assets/images/common/icon-back-green.png")} style={styles.backIcon} />
          <Text style={styles.backText}>返回</Text>
        </TouchableOpacity>
      </View>

      {/* 主要内容 */}
      <View style={styles.content}>
        <Text style={styles.title}>输入验证码</Text>
        <Text style={styles.phone}>
          验证码已发送至 +86 <Text>{hidePhoneNumber(phoneNumber)}</Text>
        </Text>

        {/* 验证码输入区域 */}
        <View style={styles.codeInputContainer}>
          {/* 隐藏的TextInput用于实际输入 */}
          <TextInput
            style={styles.hiddenInput}
            value={code}
            onChangeText={handleCodeChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus={true}
          />

          {/* 自定义验证码显示 */}
          <TouchableOpacity activeOpacity={1} onPress={handleFocus} style={styles.codeDisplay}>
            {Array.from({length: 6}).map((_, index) => (
              <View key={index} style={[styles.codeDigit, focus && index === code.length && styles.codeDigitFocused]}>
                <Text style={styles.codeDigitText}>{code[index] || ""}</Text>
              </View>
            ))}
          </TouchableOpacity>
        </View>

        {/* 重发验证码按钮 */}
        {isReget ? (
          <TouchableOpacity onPress={refreshGetCode}>
            <Text style={styles.resendButton}>重发短信验证码</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.countdownText}>{count}秒后可重新获取</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default CodeLoginScreen;
