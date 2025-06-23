import CustomStatusBar from "@/components/common/CustomStatusBar";
import {useStatusBar} from "@/hooks/useStatusBar";
import {useAuth} from "@/store/useAuth";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import {useEffect} from "react";
import {StyleSheet} from "react-native";
import {View, Text, Image, TouchableOpacity, SafeAreaView, Platform} from "react-native";

type RootStackParamList = {
  Main: undefined;
  MyScreen: undefined;
  Login: undefined;
  EditPassword: {mobile: string};
  Personal: undefined;
};

const AccountSetting = () => {
  useStatusBar("dark-content", "#fff");
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const {logout, userInfo} = useAuth();

  // 个人信息
  const viewPersonalInfo = () => {
    navigation.navigate("Personal");
  };

  // 修改密码
  const editPassword = () => {
    navigation.navigate("EditPassword", {mobile: userInfo?.userName as unknown as string});
  };

  // 退出登录
  const loginOut = () => {
    // setShowPopup(true);
  };

  // 关闭弹窗
  const closePopup = () => {
    // setShowPopup(false);
  };

  // 确定退出
  const confirmLoginOut = () => {
    logout();
    navigation.reset({
      index: 0,
      routes: [{name: "Login"}],
    });
  };

  useEffect(() => {
    // 获取系统信息（React Native 中获取版本号的方式不同）
    if (Platform.OS === "android") {
      const version = Platform.constants?.Release || "1.0.0";
      console.log(version, "APP版本号");
    } else if (Platform.OS === "ios") {
      const version = Platform.constants?.osVersion || "1.0.0";
      console.log(version, "APP版本号");
    }
  }, []);

  return (
    <SafeAreaView>
      <CustomStatusBar navTitle="设置" onBack={() => navigation.goBack()} />
      <View style={styles.settingList}>
        <TouchableOpacity style={styles.settingListItem} onPress={viewPersonalInfo}>
          <Text style={styles.itemText}>个人信息</Text>
          <Image source={require("../../assets/images/my/icon-right.png")} style={styles.arrowIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingListItem} onPress={editPassword}>
          <Text style={styles.itemText}>修改密码</Text>
          <Image source={require("../../assets/images/my/icon-right.png")} style={styles.arrowIcon} />
        </TouchableOpacity>

        <View style={styles.settingListItem}>
          <Text style={styles.itemText}>版本号：{"1234543"}</Text>
          <Image source={require("../../assets/images/my/icon-right.png")} style={styles.arrowIcon} />
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={loginOut}>
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f8",
  },
  settingList: {
    width: "100%",
    backgroundColor: "#f7f7f8",
    marginTop: 10,
  },
  settingListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 58,
    padding: 16,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  itemText: {
    fontSize: 22,
  },
  arrowIcon: {
    width: 26,
    height: 26,
  },
  logoutButton: {
    width: "100%",
    height: 58,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginTop: 10,
  },
  logoutText: {
    fontSize: 22,
    color: "#FF3D3B",
  },
});

export default AccountSetting;
