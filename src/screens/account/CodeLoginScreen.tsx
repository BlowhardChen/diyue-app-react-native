// 获取验证码&验证码登录
import React, {useState, useEffect, useRef, useMemo, useCallback} from "react";
import {View, Text, TextInput, TouchableOpacity, Image, StatusBar, StyleSheet} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {RouteProp, useNavigation, useRoute, useFocusEffect} from "@react-navigation/native";
import {styles} from "./styles/CodeLoginScreen";
import {StackNavigationProp} from "@react-navigation/stack";
import {codeLogin, getCodeForgotPwd, getCodeLogin, getCodeRegister} from "@/services/account";
import debounce from "lodash/debounce";
import {userStore} from "@/stores/userStore";

const CODE_LENGTH = 6;
const COUNTRY_CODE = "+86";

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

const useCountdown = (initial: number, onFinish: () => void) => {
  const [count, setCount] = useState(initial);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    if (count === 0) {
      onFinishRef.current?.();
      return;
    }
    timerRef.current = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(timerRef.current!);
  }, [count]);

  const reset = useCallback(() => setCount(initial), [initial]);

  return {count, reset};
};

// API 映射
const codeApiMap: Record<string, Function> = {
  login: getCodeLogin,
  register: getCodeRegister,
  forgetPassword: getCodeForgotPwd,
};

const CodeLoginScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<{params: CodeLoginRouteParams}>>();
  const {mobile, viewType} = route.params || {};
  const phoneNumber = mobile?.replace(/\s/g, "") || "";
  const [code, setCode] = useState("");
  const [focus, setFocus] = useState(true);
  const [isReget, setIsReget] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const {count, reset} = useCountdown(60, () => setIsReget(true));

  // 页面重新聚焦时清空验证码并自动聚焦
  useFocusEffect(
    useCallback(() => {
      setCode("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }, []),
  );

  // 隐藏手机号中间四位
  const hidePhoneNumber = (phone: string) => {
    if (!phone) return "";
    const prefix = phone.substring(0, 3);
    const suffix = phone.substring(7);
    return `${prefix}****${suffix}`;
  };

  // 验证码输入是否完成
  const isCodeValid = useMemo(() => code.length === CODE_LENGTH, [code]);

  // 获取验证码
  const getCode = useCallback(async () => {
    const api = codeApiMap[viewType];
    if (!api) return;
    const res = await api({mobile: phoneNumber});
    if (res) {
      reset();
      setIsReget(false);
    }
  }, [viewType, phoneNumber, reset]);

  // 防抖重新获取验证码
  const debounceRef = useRef<ReturnType<typeof debounce> | null>(null);

  useEffect(() => {
    debounceRef.current = debounce(() => {
      if (count === 0) {
        getCode();
      }
    }, 500);

    return () => {
      debounceRef.current?.cancel();
    };
  }, [count, getCode]);

  // 验证码输入变化
  const handleCodeChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, "").slice(0, CODE_LENGTH);
    setCode(numericText);
  };

  // 手动聚焦输入框（新增：处理点击格子时的聚焦）
  const handleClickCodeArea = () => {
    inputRef.current?.focus();
    setFocus(true);
  };

  // 验证码登录逻辑
  const handleAutoLogin = useCallback(
    async (enteredCode: string) => {
      try {
        // 新增：添加异常捕获，避免登录失败导致崩溃
        const {data} = await codeLogin({
          mobile: phoneNumber,
          mobileCode: enteredCode,
        });
        userStore.setUserInfo(data.member);
        if (data?.register) {
          navigation.navigate("SetPassword", {
            viewType: "setPassword",
            mobile: phoneNumber,
            mobileCode: enteredCode,
          });
        } else {
          navigation.navigate("Main");
        }
      } catch (error) {
        console.error("验证码登录失败：", error);
        // 可添加错误提示，比如 Toast 提示验证码错误
      }
    },
    [navigation, phoneNumber],
  );

  // 输入完成后的处理
  useEffect(() => {
    if (!isCodeValid) return;

    if (viewType === "login") {
      handleAutoLogin(code);
    } else {
      navigation.navigate("SetPassword", {
        viewType,
        mobile: phoneNumber,
        mobileCode: code,
      });
    }
  }, [code, isCodeValid, handleAutoLogin, navigation, phoneNumber, viewType]);

  const handleBack = () => navigation.goBack();

  // 初始加载验证码
  useEffect(() => {
    getCode();
  }, [getCode]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* 头部返回按钮 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Image source={require("@/assets/images/common/icon-back-green.png")} style={styles.backIcon} />
          <Text style={styles.backText}>返回</Text>
        </TouchableOpacity>
      </View>

      {/* 主内容 */}
      <View style={styles.content}>
        <Text style={styles.title}>输入验证码</Text>
        <Text style={styles.phone}>
          验证码已发送至 {COUNTRY_CODE} <Text>{hidePhoneNumber(phoneNumber)}</Text>
        </Text>

        {/* 验证码输入框 - 关键修改：外层添加点击事件，穿透到输入框 */}
        <View style={styles.codeInputContainer}>
          {/* 使用一个可见但透明的输入框 */}
          <TextInput
            ref={inputRef}
            style={[
              styles.hiddenInput,
              {
                opacity: 0.15,
                backgroundColor: "transparent",
                zIndex: 2,
              },
            ]}
            value={code}
            onChangeText={handleCodeChange}
            keyboardType="number-pad"
            maxLength={CODE_LENGTH}
            autoFocus={focus}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
          />

          {/* 展示层作为视觉反馈 */}
          <View style={[styles.codeDisplay, {zIndex: 1}]} pointerEvents="none">
            {Array.from({length: CODE_LENGTH}).map((_, index) => (
              <View key={index} style={[styles.codeDigit, focus && index === code.length && styles.codeDigitFocused]}>
                <Text style={styles.codeDigitText}>{code[index] || ""}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 倒计时或重发 */}
        {isReget ? (
          <TouchableOpacity onPress={() => debounceRef.current?.()}>
            <Text style={styles.resendButton}>重发短信验证码</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.countdownText}>{count} 秒后可重新获取</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default CodeLoginScreen;
