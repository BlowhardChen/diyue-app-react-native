// 设置密码页面
import {useState, useEffect} from "react";
import {View, Text, TextInput, Image, TouchableOpacity} from "react-native";
import {RouteProp, useNavigation, useRoute} from "@react-navigation/native";
import Toast from "react-native-toast-message";
import {SafeAreaView} from "react-native-safe-area-context";
import {StackNavigationProp} from "@react-navigation/stack";
import {styles} from "./styles/SetPasswordScreen";
import {showCustomToast} from "@/components/common/CustomToast";
import {forgotPassword, registerAccount} from "@/services/account";

type RootStackParamList = {
  Main: undefined;
  CodeLogin: {mobile: string; viewType: string};
  Register: {viewType: string};
  ServiceAgreement: undefined;
  PrivacyPolicyDetail: undefined;
};

type SetPasswordRouteParams = {
  mobile: string;
  mobileCode: string;
  viewType: string;
};

const SetPasswordScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<{params: SetPasswordRouteParams}>>();
  const {mobile, viewType, mobileCode} = route.params || {};

  // 状态管理
  const [newPassword, setNewPassword] = useState("");
  const [isNewPasswordShow, setIsNewPasswordShow] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isConfirmPasswordShow, setIsConfirmPasswordShow] = useState(true);
  const [isSelectRadio, setIsSelectRadio] = useState(false);
  const [phoneString, setPhoneString] = useState("");

  // 聚焦状态（用于控制清空图标显示：有内容并且聚焦才显示）
  const [isNewFocused, setIsNewFocused] = useState(false);
  const [isConfirmFocused, setIsConfirmFocused] = useState(false);

  // 格式化手机号显示
  useEffect(() => {
    if (mobile) {
      const formatted = `${mobile.substring(0, 3)} ${mobile.substring(3, 7)} ${mobile.substring(7)}`;
      setPhoneString(formatted);
    }
  }, [mobile]);

  // 返回上一页
  const backView = () => {
    navigation.goBack();
  };

  // 密码显示/隐藏切换
  const togglePasswordVisibility = (type: string) => {
    if (type === "new") {
      setIsNewPasswordShow(!isNewPasswordShow);
    } else {
      setIsConfirmPasswordShow(!isConfirmPasswordShow);
    }
  };

  // 清除密码
  const clearPassword = (type: string) => {
    if (type === "new") {
      setNewPassword("");
    } else {
      setConfirmPassword("");
    }
  };

  // 验证密码格式
  const validatePassword = (password: string) => {
    if (!password) {
      showCustomToast("error", "请输入密码");
      return false;
    }

    if (password.length < 6) {
      showCustomToast("error", "密码不得少于6位");
      return false;
    }

    if (!/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
      showCustomToast("error", "密码必须包含字母数字");
      return false;
    }

    return true;
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!validatePassword(newPassword) || !validatePassword(confirmPassword)) return;

    if (newPassword !== confirmPassword) {
      showCustomToast("error", "两次输入的密码不一致，请重试");
      return;
    }

    if (viewType === "register" && !isSelectRadio) {
      showCustomToast("error", "请先勾选用户协议和隐私政策");
      return;
    }

    console.log("viewType", viewType);

    if (viewType === "forgetPassword") {
      await forgotPassword({
        mobile,
        mobileCode,
        password: newPassword,
      });
      showCustomToast("success", "密码设置成功");
    }

    if (viewType === "register") {
      await registerAccount({
        mobile,
        mobileCode,
        password: newPassword,
      });
    }

    navigation.navigate("Main");
  };

  // 用户协议勾选状态切换
  const toggleAgreement = () => {
    setIsSelectRadio(!isSelectRadio);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 头部返回按钮 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={backView} style={styles.backButton}>
            <Image source={require("../../assets/images/common/icon-back-green.png")} style={styles.backIcon} />
            <Text style={styles.backText}>返回</Text>
          </TouchableOpacity>
        </View>

        {/* 内容区域 */}
        <View style={styles.content}>
          <Text style={styles.title}>设置新密码</Text>
          <Text style={styles.phone}>{phoneString}</Text>
        </View>

        {/* 输入框区域 */}
        <View style={styles.inputBox}>
          {/* 新密码输入框 */}
          <View style={styles.passwordFormItem}>
            <Image source={require("../../assets/images/login/icon-passwword.png")} style={styles.inputIcon} />
            <TextInput
              style={styles.formInput}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={isNewPasswordShow}
              maxLength={20}
              placeholder="请输入新密码"
              placeholderTextColor="#999"
              onFocus={() => setIsNewFocused(true)}
              onBlur={() => setIsNewFocused(false)}
            />
            <View style={styles.iconRight}>
              {/* 有内容 && 聚焦 才显示清空按钮 */}
              {newPassword && isNewFocused && (
                <TouchableOpacity onPress={() => clearPassword("new")} style={styles.iconButton}>
                  <Image source={require("../../assets/images/login/icon-clear.png")} style={styles.inputIcon} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => togglePasswordVisibility("new")} style={styles.iconButton}>
                <Image
                  source={
                    isNewPasswordShow
                      ? require("../../assets/images/login/icon-hide.png")
                      : require("../../assets/images/login/icon-view.png")
                  }
                  style={styles.inputIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* 确认密码输入框 */}
          <View style={styles.passwordFormItem}>
            <Image source={require("../../assets/images/login/icon-passwword.png")} style={styles.inputIcon} />
            <TextInput
              style={styles.formInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={isConfirmPasswordShow}
              maxLength={20}
              placeholder="确认新密码"
              placeholderTextColor="#999"
              onFocus={() => setIsConfirmFocused(true)}
              onBlur={() => setIsConfirmFocused(false)}
            />
            <View style={styles.iconRight}>
              {/* 有内容 && 聚焦 才显示清空按钮 */}
              {confirmPassword && isConfirmFocused && (
                <TouchableOpacity onPress={() => clearPassword("confirm")} style={styles.iconButton}>
                  <Image source={require("../../assets/images/login/icon-clear.png")} style={styles.inputIcon} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => togglePasswordVisibility("confirm")} style={styles.iconButton}>
                <Image
                  source={
                    isConfirmPasswordShow
                      ? require("../../assets/images/login/icon-hide.png")
                      : require("../../assets/images/login/icon-view.png")
                  }
                  style={styles.inputIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.tips}>密码需要6-20个字符，可以是数字、字母、特殊字符</Text>

          <TouchableOpacity
            style={[styles.submitButton, {opacity: newPassword && confirmPassword ? 1 : 0.5}]}
            onPress={handleSubmit}
            disabled={!newPassword || !confirmPassword}>
            <Text style={styles.submitButtonText}>{viewType === "register" ? "注册" : "立即登录"}</Text>
          </TouchableOpacity>
        </View>

        {/* 用户协议和隐私政策 (仅注册时显示) */}
        {viewType === "register" && (
          <View style={styles.agreementContainer}>
            <TouchableOpacity onPress={toggleAgreement} style={styles.radioButton}>
              <Image
                source={
                  isSelectRadio
                    ? require("../../assets/images/login/icon-checked.png")
                    : require("../../assets/images/login/icon-unchecked.png")
                }
                style={styles.radioIcon}
              />
              <Text style={styles.agreementText}>
                我已阅读并同意<Text style={styles.activeText}>《用户服务协议》</Text>和
                <Text style={styles.activeText}>《隐私政策》</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <Toast />
    </SafeAreaView>
  );
};

export default SetPasswordScreen;
