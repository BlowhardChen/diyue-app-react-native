// 数据上传
import React, {useEffect, useState} from "react";
import {View, Text, Switch, StyleSheet, Image, ToastAndroid, ScrollView} from "react-native";
import {useNavigation, useRoute, RouteProp} from "@react-navigation/native";
import CustomStatusBar from "@/components/common/CustomStatusBar";
import DeviceMqttConfig from "@/components/device/DeviceMqttConfig";

type RootStackParamList = {
  DeviceUpload: {deviceInfo: any};
};

export default function DeviceUploadScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "DeviceUpload">>();
  const {deviceInfo} = route.params;

  const [mqttUpload, setMqttUpload] = useState(false);
  const [serverUpload, setServerUpload] = useState(false);
  const [bluetoothUpload, setBluetoothUpload] = useState(false);

  const [mqttConfig, setMqttConfig] = useState({
    ip: "mqtt.com",
    port: "1883",
    userName: "username",
    pwd: "password",
    topic: "1234567890",
  });

  const [showMqttConfig, setShowMqttConfig] = useState(false);
  const [uploadType, setUploadType] = useState<"1" | "2" | "3">("1");
  const [configData, setConfigData] = useState<any[]>([]);
  const [configId, setConfigId] = useState("");

  // 切换switch
  const changeSwitch = (type: "1" | "2" | "3") => {
    setUploadType(type);

    if (type === "1") {
      setMqttUpload(true);
      setServerUpload(false);
      setBluetoothUpload(false);
    } else if (type === "2") {
      setServerUpload(true);
      setMqttUpload(false);
      setBluetoothUpload(false);
    } else if (type === "3") {
      setBluetoothUpload(true);
      setMqttUpload(false);
      setServerUpload(false);
    }

    const config = configData.find(ite => ite.type === type);
    setConfigId(config ? config.id : "");

    saveMqttConfig(mqttConfig);
  };

  // 修改配置
  const updateConfig = () => {
    setShowMqttConfig(true);
  };

  // 保存mqtt配置
  const saveMqttConfig = async (config: typeof mqttConfig) => {
    try {
      //   await updateDeviceUploadSource({
      //     deviceId: deviceInfo.device.id,
      //     id: configId,
      //     type: uploadType,
      //     ...config,
      //   });
      //   await getDeviceConfigData(deviceInfo.device.id);
      //   setShowMqttConfig(false);
    } catch (error: any) {
      ToastAndroid.show(error?.data?.msg ? error.data.msg : "保存失败", ToastAndroid.SHORT);
      setShowMqttConfig(false);
    }
  };

  // 获取设备配置
  const getDeviceConfigData = async (deviceId: string) => {
    try {
      //   const {data} = await getDeviceUploadConfig({deviceId});
      //   setConfigData(data);
      //   const {id, ip, port, userName, pwd, topic, type} = data.find((item: any) => item.status === "0") || {};
      //   setConfigId(id || "");
      //   if (type === "1") setMqttUpload(true);
      //   if (type === "2") setServerUpload(true);
      //   if (type === "3") setBluetoothUpload(true);
      //   if (ip && port && userName && pwd && topic) {
      //     setDeviceConfig({ip, port, userName, pwd, topic});
      //   }
    } catch (error) {
      console.log("获取设备配置失败", error);
    }
  };

  useEffect(() => {
    if (deviceInfo?.device?.id) {
      getDeviceConfigData(deviceInfo.device.id);
    }
  }, [deviceInfo]);

  return (
    <View style={styles.container}>
      <CustomStatusBar navTitle="数据上传" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.content}>
        {/* MQTT 上传 */}
        <View style={styles.switchItem}>
          <Text style={styles.switchTitle}>启用MQTT数据上传</Text>
          <Switch
            value={mqttUpload}
            onValueChange={() => changeSwitch("1")}
            trackColor={{false: "#CDCDCD", true: "#08AE3C"}}
            thumbColor={"#fff"}
          />
        </View>

        <View style={styles.mqttConfig}>
          <Text style={styles.text}>MQTT配置</Text>
          <View style={styles.config} onTouchEnd={updateConfig}>
            <Text style={styles.configText}>{deviceInfo?.deviceDate?.length ? "已配置" : "未配置"}</Text>
            <Image source={require("@/assets/images/common/icon-right.png")} style={styles.icon} />
          </View>
        </View>

        {/* 808 上传 */}
        <View style={styles.item}>
          <Text style={styles.switchTitle}>启用808服务器数据上传</Text>
          <Switch
            value={serverUpload}
            onValueChange={() => changeSwitch("2")}
            trackColor={{false: "#CDCDCD", true: "#08AE3C"}}
            thumbColor={"#fff"}
          />
        </View>

        {/* 蓝牙 上传 */}
        <View style={styles.item}>
          <Text style={styles.switchTitle}>启用SPP蓝牙上传</Text>
          <Switch
            value={bluetoothUpload}
            onValueChange={() => changeSwitch("3")}
            trackColor={{false: "#CDCDCD", true: "#08AE3C"}}
            thumbColor={"#fff"}
          />
        </View>
      </ScrollView>

      {showMqttConfig && (
        <DeviceMqttConfig
          visible={showMqttConfig}
          deviceConfig={mqttConfig}
          onClickCancel={() => setShowMqttConfig(false)}
          onClickSave={saveMqttConfig}
          onClosePopup={() => setShowMqttConfig(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f6f8",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 52,
    paddingHorizontal: 16,
    marginTop: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e7e7e7",
  },
  switchItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 52,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e7e7e7",
  },
  switchTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
  },
  mqttConfig: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 52,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e7e7e7",
  },
  text: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
  },
  config: {
    flexDirection: "row",
    alignItems: "center",
  },
  configText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#999",
    marginRight: 8,
  },
  icon: {
    width: 26,
    height: 26,
  },
});
