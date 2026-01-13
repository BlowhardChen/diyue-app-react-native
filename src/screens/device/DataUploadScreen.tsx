import React, {useEffect, useState} from "react";
import {View, Text, Switch, StyleSheet, Image, ScrollView} from "react-native";
import {useNavigation, useRoute, RouteProp} from "@react-navigation/native";
import CustomStatusBar from "@/components/common/CustomStatusBar";
import DeviceMqttConfig from "@/components/device/DeviceMqttConfig";
import {getDeviceUploadConfig, updateDeviceDifferentialConfig} from "@/services/device";
import {showCustomToast} from "@/components/common/CustomToast";

type RootStackParamList = {
  DeviceUpload: {deviceInfo: any};
};

export default function DeviceUploadScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "DeviceUpload">>();
  const {deviceInfo} = route.params;

  // 当前激活的上传方式，"1"=MQTT, "2"=808, "3"=蓝牙, null=全部关闭
  const [activeType, setActiveType] = useState<"1" | "2" | "3" | null>(null);

  const [mqttConfig, setMqttConfig] = useState({
    ip: "mqtt.com",
    port: "1883",
    userName: "username",
    pwd: "password",
    topic: "1234567890",
  });
  const [showMqttConfig, setShowMqttConfig] = useState(false);
  const [configData, setConfigData] = useState<any[]>([]);
  const [configId, setConfigId] = useState("");

  // 切换开关
  const changeSwitch = (type: "1" | "2" | "3") => {
    // 如果当前就是激活的，再次点击则关闭
    if (activeType === type) {
      setActiveType(null);
      setConfigId("");
      return;
    }

    // 否则切换到新的类型
    setActiveType(type);

    const config = configData.find(ite => ite.type === type);
    setConfigId(config ? config.id : "");

    // 如果是 MQTT，立即保存配置
    if (type === "1") {
      saveMqttConfig(mqttConfig, type, config ? config.id : "");
    }
  };

  // 修改配置
  const updateConfig = () => {
    setShowMqttConfig(true);
  };

  // 保存mqtt配置
  const saveMqttConfig = async (config: typeof mqttConfig, type: "1" | "2" | "3" = activeType || "1", id: string = configId) => {
    setMqttConfig(config);
    const {data} = await updateDeviceDifferentialConfig({
      deviceId: deviceInfo.device.id,
      id,
      type,
      ...config,
    });
    showCustomToast("success", data ?? "操作成功");
    setShowMqttConfig(false);
  };

  // 获取设备配置
  const getDeviceConfigData = async (deviceId: string) => {
    const {data} = await getDeviceUploadConfig(deviceId);
    setConfigData(data);

    const activeConfig = data.find((item: any) => item.status === "0");
    if (activeConfig) {
      const {id, ip, port, userName, pwd, topic, type} = activeConfig;
      setConfigId(id || "");
      setActiveType(type as "1" | "2" | "3");

      if (ip && port && userName && pwd && topic) {
        setMqttConfig({ip, port, userName, pwd, topic});
      }
    } else {
      setActiveType(null);
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
            value={activeType === "1"}
            onValueChange={() => changeSwitch("1")}
            trackColor={{false: "#CDCDCD", true: "#08AE3C"}}
            thumbColor={"#fff"}
          />
        </View>

        <View style={styles.mqttConfig}>
          <Text style={styles.text}>MQTT配置</Text>
          <View style={styles.config} onTouchEnd={updateConfig}>
            <Text style={styles.configText}>{activeType === "1" ? "已配置" : "未配置"}</Text>
            <Image source={require("@/assets/images/common/icon-right.png")} style={styles.icon} />
          </View>
        </View>

        {/* 808 上传 */}
        <View style={styles.item}>
          <Text style={styles.switchTitle}>启用808服务器数据上传</Text>
          <Switch
            value={activeType === "2"}
            onValueChange={() => changeSwitch("2")}
            trackColor={{false: "#CDCDCD", true: "#08AE3C"}}
            thumbColor={"#fff"}
          />
        </View>

        {/* 蓝牙 上传 */}
        <View style={styles.item}>
          <Text style={styles.switchTitle}>启用SPP蓝牙上传</Text>
          <Switch
            value={activeType === "3"}
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
