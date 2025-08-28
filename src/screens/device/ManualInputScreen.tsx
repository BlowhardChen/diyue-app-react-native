// 手动输入
import React, {useState} from "react";
import {View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView} from "react-native";
import {useNavigation} from "@react-navigation/native";
import CustomStatusBar from "@/components/common/CustomStatusBar";
import {StackNavigationProp} from "@react-navigation/stack";

type DeviceStackParamList = {
  CurrentConnect: {imei: string};
};

const ManualInputScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<DeviceStackParamList>>();
  const [deviceImei, setDeviceImei] = useState("");

  // 确定
  const confirm = () => {
    if (!deviceImei) return;
    navigation.navigate("CurrentConnect", {imei: deviceImei});
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.manualInput}>
        <CustomStatusBar navTitle="手动输入" onBack={() => navigation.goBack()} />

        <View style={styles.content}>
          <View style={styles.deviceImei}>
            <Text style={styles.title}>设备IMEI</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                value={deviceImei}
                onChangeText={setDeviceImei}
                placeholder="请输入"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.buttonBox}>
            <TouchableOpacity style={[styles.button, {opacity: deviceImei ? 1 : 0.5}]} activeOpacity={0.8} onPress={confirm}>
              <Text style={styles.buttonText}>确定</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ManualInputScreen;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#fff",
  },
  manualInput: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f6f8",
  },
  deviceImei: {
    width: "100%",
    padding: 16,
    marginTop: 8,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },
  inputBox: {
    width: "100%",
    height: 48,
    marginTop: 8,
    backgroundColor: "#eff2f3",
    borderRadius: 6,
    justifyContent: "center",
  },
  input: {
    flex: 1,
    fontSize: 18,
    paddingHorizontal: 12,
    color: "#333",
  },
  buttonBox: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 84,
    marginTop: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  button: {
    width: "90%",
    height: 52,
    backgroundColor: "#08ae3c",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#fff",
  },
});
