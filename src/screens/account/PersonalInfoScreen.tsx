import {useEffect, useState} from "react";
import {View, Text, Image, TouchableOpacity, StyleSheet} from "react-native";
import {useNavigation} from "@react-navigation/native";
import CustomStatusBar from "@/components/common/CustomStatusBar";
import Popup from "@/components/common/Popup";
import {StackNavigationProp} from "@react-navigation/stack";
import {showErrorToast} from "@/components/common/ErrorToast";

type RootStackParamList = {
  Login: undefined;
  EditPassword: {mobile: string};
  EditUserName: {name: string};
};

const PersonalInfoScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isShowPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {};

  const editAvatar = async () => {};

  const handleNameEdit = () => {
    navigation.navigate("EditUserName", {name: userInfo?.nickName});
  };

  const handlePasswordEdit = () => {
    navigation.navigate("EditPassword", {mobile: userInfo?.userName});
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const confirmLoginOut = () => {
    try {
      setShowPopup(false);
      navigation.reset({index: 0, routes: [{name: "Login"}]});
    } catch (e) {
      showErrorToast("注销失败");
    }
  };

  return (
    <>
      <Popup
        visible={isShowPopup}
        title="提示"
        msgText="注销账号之后会清除所有用户数据，确认要注销账号吗？"
        leftBtnText="取消"
        rightBtnText="确认注销"
        rightBtnStyle={{color: "#FF3D3B"}}
        onLeftBtn={closePopup}
        onRightBtn={confirmLoginOut}
      />
      <CustomStatusBar navTitle="个人信息" onBack={() => navigation.goBack()} />
      <View style={styles.box}>
        <View style={styles.itemAvatar}>
          <Text style={styles.label}>头像</Text>
          <TouchableOpacity style={styles.itemRight} onPress={editAvatar}>
            <View style={styles.avatar}>
              <Image
                source={userInfo?.avatar ? {uri: userInfo.avatar} : require("../../assets/images/my/icon-avatar.png")}
                style={styles.avatarImg}
              />
            </View>
            <Image source={require("@/assets/images/my/icon-right.png")} style={styles.rightIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>名字</Text>
          <TouchableOpacity style={styles.itemRight} onPress={handleNameEdit}>
            <Text style={styles.text}>{userInfo?.nickName}</Text>
            <Image source={require("@/assets/images/my/icon-right.png")} style={styles.rightIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>账号</Text>
          <View style={styles.itemRight}>
            <Text style={styles.text}>{userInfo?.userName}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.item} onPress={handlePasswordEdit}>
          <Text style={styles.label}>修改密码</Text>
          <View style={styles.itemRight}>
            <Image source={require("@/assets/images/my/icon-right.png")} style={styles.rightIcon} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => setShowPopup(true)}>
          <Text style={styles.label}>注销账号</Text>
          <View style={styles.itemRight}>
            <Image source={require("@/assets/images/my/icon-right.png")} style={styles.rightIcon} />
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default PersonalInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f8",
  },
  box: {
    backgroundColor: "#fff",
  },
  itemAvatar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 88,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#e7e7e7",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 58,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#e7e7e7",
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    marginRight: 8,
  },
  avatarImg: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  rightIcon: {
    width: 26,
    height: 26,
    marginLeft: 8,
  },
  label: {
    fontSize: 20,
    color: "#000",
  },
  text: {
    fontSize: 20,
    color: "#666",
  },
});
