import {useEffect, useState} from "react";
import {View, Text, TextInput, Image, TouchableOpacity, StatusBar} from "react-native";
import {RouteProp, useNavigation, useRoute} from "@react-navigation/native";
import {showErrorToast} from "@/components/common/ErrorToast";
import {SafeAreaView} from "react-native-safe-area-context";
import {styles} from "./styles/EditPasswordScreen";

type EditPasswordRouteParams = {
  mobile: string;
};

const EditPasswordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{params: EditPasswordRouteParams}>>();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isNewPasswordShow, setIsNewPasswordShow] = useState(false);
  const [isConfirmPasswordShow, setIsConfirmPasswordShow] = useState(false);
  const [phoneString, setPhoneString] = useState("");

  useEffect(() => {
    const phone = route.params?.mobile;
    if (phone && phone.length === 11) {
      setPhoneString(`${phone.slice(0, 3)} ${phone.slice(3, 7)} ${phone.slice(7)}`);
    }
  }, [route.params]);

  const validatePassword = (password: string): boolean => {
    if (!password || password.length < 6) {
      showErrorToast("密码不得少于6位");
      return false;
    }
    return true;
  };

  const handleConfirm = async () => {
    if (!newPassword || !confirmPassword) return;
    const validNew = validatePassword(newPassword);
    const validConfirm = validatePassword(confirmPassword);
    if (!validNew || !validConfirm) return;

    if (newPassword !== confirmPassword) {
      showErrorToast("两次输入的密码不一致");
      return;
    }

    try {
      //   await editUserPassword({password: confirmPassword});
      navigation.goBack();
    } catch (error: any) {
      showErrorToast("请求失败");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TouchableOpacity style={styles.header} onPress={() => navigation.goBack()}>
        <View style={styles.headerLeft}>
          <Image source={require("../../assets/images/common/icon-back-green.png")} style={styles.backIcon} />
          <Text style={styles.backText}>返回</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>修改密码</Text>
        <Text style={styles.phone}>{phoneString}</Text>
      </View>

      <View style={styles.inputBox}>
        {/* 新密码 */}
        <View style={styles.inputItem}>
          <Image source={require("../../assets/images/login/icon-passwword.png")} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="输入新密码"
            value={newPassword}
            secureTextEntry={!isNewPasswordShow}
            maxLength={20}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity onPress={() => setIsNewPasswordShow(prev => !prev)}>
            <Image
              source={
                isNewPasswordShow
                  ? require("../../assets/images/login/icon-hide.png")
                  : require("../../assets/images/login/icon-view.png")
              }
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>

        {/* 确认密码 */}
        <View style={styles.inputItem}>
          <Image source={require("../../assets/images/login/icon-passwword.png")} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="确认新密码"
            value={confirmPassword}
            secureTextEntry={!isConfirmPasswordShow}
            maxLength={20}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity onPress={() => setIsConfirmPasswordShow(prev => !prev)}>
            <Image
              source={
                isConfirmPasswordShow
                  ? require("../../assets/images/login/icon-hide.png")
                  : require("../../assets/images/login/icon-view.png")
              }
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.tips}>密码需要6-20个字符，可以是数字、字母、特殊字符</Text>

        <TouchableOpacity
          style={[styles.btn, {opacity: newPassword && confirmPassword ? 1 : 0.5}]}
          onPress={handleConfirm}
          activeOpacity={0.8}>
          <Text style={styles.btnText}>确认修改</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EditPasswordScreen;
