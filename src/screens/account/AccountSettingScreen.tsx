import CustomStatusBar from "@/components/common/CustomStatusBar";
import Popup from "@/components/common/Popup";
import {useAuth} from "@/store/useAuth";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import {useState} from "react";
import {StyleSheet} from "react-native";
import {View, Text, Image, TouchableOpacity} from "react-native";

type RootStackParamList = {
  Main: undefined;
  MyScreen: undefined;
  Login: undefined;
  EditPassword: {mobile: string};
  PersonalInfo: undefined;
};

const AccountSetting = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const {logout, userInfo} = useAuth();
  const [isShowPopup, setShowPopup] = useState(false);

  // 个人信息
  const viewPersonalInfo = () => {
    navigation.navigate("PersonalInfo");
  };

  // 修改密码
  const editPassword = () => {
    navigation.navigate("EditPassword", {mobile: userInfo?.userName as unknown as string});
  };

  // 退出登录
  const loginOut = () => {
    setShowPopup(true);
  };

  // 关闭弹窗
  const closePopup = () => {
    setShowPopup(false);
  };

  // 确定退出
  const confirmLoginOut = () => {
    setShowPopup(false);
    logout();
    navigation.reset({
      index: 0,
      routes: [{name: "Login"}],
    });
  };

  return (
    <>
      <Popup
        visible={isShowPopup}
        title="提示"
        msgText="确认要退出登录吗？"
        leftBtnText="取消"
        rightBtnText="退出登录"
        rightBtnStyle={{color: "#FF3D3B"}}
        onLeftBtn={closePopup}
        onRightBtn={confirmLoginOut}
      />
      <CustomStatusBar navTitle="设置" onBack={() => navigation.goBack()} />
      <View style={styles.settingList}>
        <TouchableOpacity style={styles.settingListItem} onPress={viewPersonalInfo}>
          <Text style={styles.itemText}>个人信息</Text>
          <Image source={require("@/assets/images/my/icon-right.png")} style={styles.arrowIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingListItem} onPress={editPassword}>
          <Text style={styles.itemText}>修改密码</Text>
          <Image source={require("@/assets/images/my/icon-right.png")} style={styles.arrowIcon} />
        </TouchableOpacity>

        <View style={styles.settingListItem}>
          <Text style={styles.itemText}>版本号：{"1234543"}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={loginOut}>
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>
      </View>
    </>
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
