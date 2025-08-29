// 登录页面
import {useState} from "react";
import {View, Text, TextInput, TouchableOpacity, Image, StatusBar, Platform, SafeAreaView} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import LinearGradient from "react-native-linear-gradient";
import {styles} from "./styles/LoginScreen";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import AgreementModal from "./components/AgreementModal";
import {showCustomToast} from "@/components/common/CustomToast";
import {useLogin} from "@/hooks/useLogin";

type RootStackParamList = {
  Main: undefined;
  CodeLogin: {mobile: string; viewType: string};
  Register: {viewType: string};
  ServiceAgreement: undefined;
  PrivacyPolicyDetail: undefined;
};

const LoginScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [showAgreementModal, setShowAgreementModal] = useState(false);

  const [loginType, setLoginType] = useState<"password" | "code">("password");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isAgreementChecked, setAgreementChecked] = useState(false);
  const {handleLoginFun} = useLogin();

  // 格式化手机号（添加空格）
  const formatPhoneNumber = (text: string) => {
    // 移除所有非数字字符
    const cleaned = text.replace(/\D/g, "");
    // 添加空格
    const match = cleaned.match(/^(\d{3})(\d{0,4})(\d{0,4})$/);
    if (match) {
      return `${match[1]}${match[2] ? " " + match[2] : ""}${match[3] ? " " + match[3] : ""}`;
    }
    return text;
  };

  // 处理手机号输入
  const handlePhoneChange = (text: string) => {
    // 限制最大长度为13（包含空格）
    if (text.replace(/\s/g, "").length > 11) return;
    setPhone(formatPhoneNumber(text));
  };

  // 验证手机号
  const validatePhoneNumber = (phoneNumber: string): boolean => {
    if (!phoneNumber) {
      showCustomToast("error", "请输入手机号");
      return false;
    }
    const phoneRegex = /^1[3-9]\d{9}$/;
    const isValid = phoneRegex.test(phoneNumber.replace(/\s/g, ""));
    if (!isValid) {
      showCustomToast("error", "请输入正确的手机号");
    }
    return isValid;
  };

  // 验证密码
  const validatePassword = (pwd: string): boolean => {
    if (!pwd) {
      showCustomToast("error", "请输入密码");
      return false;
    }
    if (pwd.length < 6) {
      showCustomToast("error", "密码长度不能少于6位");
      return false;
    }
    return true;
  };

  // 清除手机号
  const clearPhone = () => {
    setPhone("");
  };

  // 清除密码
  const clearPassword = () => {
    setPassword("");
    setPasswordVisible(false);
  };

  // 密码登录
  const handleLogin = () => {
    if (!validatePhoneNumber(phone)) return;
    if (loginType === "password" && !validatePassword(password)) return;
    if (!isAgreementChecked) {
      showCustomToast("error", "请先勾选用户协议和隐私政策");
      return;
    }
    setShowAgreementModal(true);
  };

  // 验证码登录
  const handleGetCode = () => {
    if (!validatePhoneNumber(phone)) return;
    if (!isAgreementChecked) {
      showCustomToast("error", "请先勾选用户协议和隐私政策");
      return;
    }

    navigation.navigate("CodeLogin", {
      mobile: phone.replace(/\s/g, ""),
      viewType: "login",
    });
  };

  // 注册
  const navigateToRegister = () => {
    navigation.navigate("Register", {
      viewType: "register",
    });
  };

  // 忘记密码
  const navigateToForgotPassword = () => {
    navigation.navigate("Register", {
      viewType: "forgetPassword",
    });
  };

  // 同意并登录
  const handleAgreeAndLogin = async () => {
    try {
      setShowAgreementModal(false);
      await handleLoginFun(phone.replace(/\s/g, ""), password);
    } catch (error) {}
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: "#fff"}}>
      <AgreementModal visible={showAgreementModal} onClose={() => setShowAgreementModal(false)} onAgree={handleAgreeAndLogin} />
      <View style={{flex: 1}}>
        <KeyboardAwareScrollView
          style={{flex: 1}}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={20}
          enableOnAndroid={true}
          extraHeight={Platform.select({ios: 0, android: 100})}>
          <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image source={require("../../assets/images/login/logo.png")} style={styles.logo} resizeMode="contain" />
          </View>

          {/* 登录框 */}
          <View style={styles.loginBox}>
            {/* 登录标题 */}
            <View style={styles.loginTitle}>
              <Text style={styles.loginTitleText}>{loginType === "password" ? "密码登录" : "验证码登录"}</Text>
              <LinearGradient
                colors={["rgba(8,174,60,0.3)", "rgba(8,174,60,0)"]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                angle={243}
                angleCenter={{x: 0.5, y: 0.5}}
                style={styles.loginTitleBg}
              />
            </View>

            {/* 密码登录表单 */}
            {loginType === "password" && (
              <View style={styles.passwordForm}>
                {/* 手机号输入 */}
                <View style={styles.inputItem}>
                  <View style={styles.iconContainer}>
                    <Image
                      source={require("../../assets/images/login/icon-phone.png")}
                      style={styles.icon}
                      resizeMode="contain"
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={handlePhoneChange}
                    keyboardType="phone-pad"
                    maxLength={13}
                    placeholder="请输入手机号"
                    placeholderTextColor="#999"
                  />
                  {phone ? (
                    <TouchableOpacity onPress={clearPhone} style={styles.clearIconContainer}>
                      <Image
                        source={require("../../assets/images/login/icon-clear.png")}
                        style={styles.icon}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* 密码输入 */}
                <View style={styles.inputItem}>
                  <View style={styles.iconContainer}>
                    <Image
                      source={require("../../assets/images/login/icon-passwword.png")}
                      style={styles.icon}
                      resizeMode="contain"
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!isPasswordVisible}
                    maxLength={20}
                    placeholder="请输入密码"
                    placeholderTextColor="#999"
                  />
                  <View style={styles.rightIcons}>
                    {password ? (
                      <TouchableOpacity onPress={clearPassword} style={styles.clearIconContainer}>
                        <Image
                          source={require("../../assets/images/login/icon-clear.png")}
                          style={styles.icon}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity onPress={() => setPasswordVisible(!isPasswordVisible)} style={styles.eyeIconContainer}>
                      <Image
                        source={
                          isPasswordVisible
                            ? require("../../assets/images/login/icon-view.png")
                            : require("../../assets/images/login/icon-hide.png")
                        }
                        style={styles.icon}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 操作链接 */}
                <View style={styles.operateLinks}>
                  <TouchableOpacity onPress={navigateToRegister}>
                    <Text style={styles.linkText}>立即注册</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={navigateToForgotPassword}>
                    <Text style={styles.linkText}>忘记密码</Text>
                  </TouchableOpacity>
                </View>

                {/* 登录按钮 */}
                <TouchableOpacity
                  style={[styles.loginButton, phone && password ? styles.loginButtonActive : styles.loginButtonInactive]}
                  onPress={handleLogin}
                  disabled={!(phone && password)}>
                  <Text style={styles.loginButtonText}>登录</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 验证码登录表单 */}
            {loginType === "code" && (
              <View style={styles.codeForm}>
                {/* 手机号输入 */}
                <View style={[styles.inputItem, {marginTop: 12}]}>
                  <View style={styles.iconContainer}>
                    <Image
                      source={require("../../assets/images/login/icon-phone.png")}
                      style={styles.icon}
                      resizeMode="contain"
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={handlePhoneChange}
                    keyboardType="phone-pad"
                    maxLength={13}
                    placeholder="请输入手机号"
                    placeholderTextColor="#999"
                  />
                  {phone ? (
                    <TouchableOpacity onPress={clearPhone} style={styles.clearIconContainer}>
                      <Image
                        source={require("../../assets/images/login/icon-clear.png")}
                        style={styles.icon}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* 操作链接 */}
                <View style={styles.operateLinks}>
                  <TouchableOpacity onPress={navigateToRegister}>
                    <Text style={styles.linkText}>没有账号？立即注册</Text>
                  </TouchableOpacity>
                </View>

                {/* 获取验证码按钮 */}
                <TouchableOpacity
                  style={[styles.loginButton, phone ? styles.loginButtonActive : styles.loginButtonInactive]}
                  onPress={handleGetCode}
                  disabled={!phone}>
                  <Text style={styles.loginButtonText}>获取验证码</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 切换登录方式 */}
            <TouchableOpacity
              style={styles.switchLoginType}
              onPress={() => setLoginType(loginType === "password" ? "code" : "password")}>
              <Text style={styles.switchLoginTypeText}>{loginType === "password" ? "验证码登录" : "密码登录"}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
        {/* 底部协议 */}
        <View style={styles.fixedBottom}>
          <Image source={require("../../assets/images/login/bottom-bg.png")} style={styles.bottomBackground} resizeMode="cover" />
          <View style={styles.agreementContainer}>
            <TouchableOpacity onPress={() => setAgreementChecked(!isAgreementChecked)} style={styles.checkboxContainer}>
              <Image
                source={
                  isAgreementChecked
                    ? require("../../assets/images/login/icon-checked.png")
                    : require("../../assets/images/login/icon-unchecked.png")
                }
                style={styles.checkboxIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text style={styles.agreementText}>我已阅读并同意</Text>
            <TouchableOpacity onPress={() => navigation.navigate("ServiceAgreement")}>
              <Text style={styles.agreementLink}>《服务协议》</Text>
            </TouchableOpacity>
            <Text style={styles.agreementText}>和</Text>
            <TouchableOpacity onPress={() => navigation.navigate("PrivacyPolicyDetail")}>
              <Text style={styles.agreementLink}>《隐私政策》</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
