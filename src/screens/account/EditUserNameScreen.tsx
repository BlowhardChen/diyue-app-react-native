import CustomStatusBar from "@/components/common/CustomStatusBar";
import {useState, useEffect} from "react";
import {View, TextInput, StyleSheet, TouchableOpacity, Image} from "react-native";
import {RouteProp, useNavigation, useRoute} from "@react-navigation/native";

type EditUserNameRouteParams = {
  name: string;
};

const EditUserNameScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{params: EditUserNameRouteParams}>>();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const initialName = route.params?.name || "";
    setUserName(initialName);
  }, [route.params]);

  const handleSave = async () => {
    // try {
    //   await editUserInfo({nickName: userName});
    //   navigation.goBack();
    // } catch (err) {
    //   console.warn("保存失败", err);
    // }
  };

  return (
    <>
      <CustomStatusBar
        navTitle="设置"
        rightTitle="保存"
        rightTitleStyle={{
          width: 56,
          height: 28,
          alignItems: "center",
          justifyContent: "center",
          color: "#FFFFFF",
          fontSize: 16,
          backgroundColor: "#08AE3C",
          borderRadius: 6,
        }}
        rightBtnColor={{color: "#fff"}}
        onBack={() => navigation.goBack()}
        onRightPress={handleSave}
      />
      <View style={styles.inputWrapper}>
        <TextInput style={styles.input} value={userName} onChangeText={setUserName} placeholder="请输入" />
        {userName.length > 0 && (
          <TouchableOpacity onPress={() => setUserName("")}>
            <Image source={require("@/assets/images/my/icon-close.png")} style={styles.clearIcon} />
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f8",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 58,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#e7e7e7",
  },
  input: {
    flex: 1,
    fontSize: 22,
    color: "#000",
  },
  clearIcon: {
    width: 26,
    height: 26,
    marginLeft: 10,
  },
});

export default EditUserNameScreen;
