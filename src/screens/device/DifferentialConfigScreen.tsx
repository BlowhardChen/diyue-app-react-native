// 差分配置
import React, {useEffect, useState} from "react";
import {View, Text, TouchableOpacity, Image, StyleSheet, ScrollView} from "react-native";
import CustomStatusBar from "@/components/common/CustomStatusBar";
import DeviceNtripConfig from "@/components/device/DeviceNtripConfig";
import DeviceMqttConfig from "@/components/device/DeviceMqttConfig";

interface ConfigItem {
  title: string;
  type: string;
}

const configList: ConfigItem[] = [
  {title: "蓝牙", type: "1"},
  {title: "Ntrip", type: "2"},
  {title: "MQTT", type: "3"},
];

const DifferentialConfig = ({route, navigation}: any) => {
  const [isSelected, setIsSelected] = useState("2");
  const [configSelect, setConfigSelect] = useState<ConfigItem>({
    title: "Ntrip",
    type: "2",
  });

  const [showNtripConfig, setShowNtripConfig] = useState(false);
  const [showMqttConfig, setShowMqttConfig] = useState(false);

  const [ntripConfig, setNtripConfig] = useState({
    ip: "rtk.ntrip.qxwz.com",
    port: "8002",
    userName: "qxcorsh0060584",
    pwd: "35ddfe7",
    topic: "AUTO",
  });

  const [mqttConfig, setMqttConfig] = useState({
    ip: "mqtt.com",
    port: "1883",
    userName: "username",
    pwd: "password",
    topic: "1234567890",
  });

  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [configData, setConfigData] = useState<any[]>([]);
  const [configId, setConfigId] = useState("");

  /** 选择配置 */
  const selectConfig = (item: ConfigItem) => {
    setIsSelected(item.type);
    setConfigSelect(item);

    const target = configData.find((ite: any) => ite.type === item.type);
    if (target) {
      setConfigId(target.id);
    }

    if (item.title === "Ntrip") {
      saveNtripConfig(ntripConfig);
    }
    if (item.title === "MQTT") {
      saveMqttConfig(mqttConfig);
    }
  };

  /** 修改配置 */
  const updateConfig = () => {
    if (configSelect.title === "Ntrip") {
      setShowNtripConfig(true);
    }
    if (configSelect.title === "MQTT") {
      setShowMqttConfig(true);
    }
  };

  /** 保存 Ntrip 配置 */
  const saveNtripConfig = async (config: typeof ntripConfig) => {
    setNtripConfig(config);
    try {
      //   await updateDeviceData({
      //     deviceId: deviceInfo.device.id,
      //     id: configId,
      //     type: configSelect.type,
      //     ...config,
      //   });
      //   getDeviceBaseInfo(deviceInfo.device.imei);
      //   setShowNtripConfig(false);
      //   getDeviceConfigData(deviceInfo.device.id);
    } catch (error: any) {
      console.log("保存失败", error);
      setShowNtripConfig(false);
    }
  };

  /** 保存 MQTT 配置 */
  const saveMqttConfig = async (config: typeof mqttConfig) => {
    setMqttConfig(config);
    try {
      //   await updateDeviceData({
      //     deviceId: deviceInfo.device.id,
      //     id: configId,
      //     type: configSelect.type,
      //     ...config,
      //   });
      //   getDeviceBaseInfo(deviceInfo.device.imei);
      //   setShowMqttConfig(false);
      //   getDeviceConfigData(deviceInfo.device.id);
    } catch (error: any) {
      console.log("保存失败", error);
      setShowMqttConfig(false);
    }
  };

  /** 获取设备信息 */
  const getDeviceBaseInfo = async (imei: string) => {
    try {
      //   const {data} = await getDeviceMsg(imei);
      //   setDeviceInfo(data);
    } catch (error: any) {
      console.log("请求失败", error);
    }
  };

  /** 获取设备配置 */
  const getDeviceConfigData = async (deviceId: string) => {
    try {
      //   const {data} = await getDeviceDateConfig({deviceId});
      //   setConfigData(data);
      //   const active = data.find((item: any) => item.status === "0");
      //   if (active) {
      //     const {ip, port, userName, pwd, topic} = active;
      //     if (configSelect.title === "MQTT") {
      //       setMqttConfig({ip, port, userName, pwd, topic});
      //     } else {
      //       setNtripConfig({ip, port, userName, pwd, topic});
      //     }
      //   }
    } catch (error) {
      console.log("获取配置失败", error);
    }
  };

  useEffect(() => {
    if (route.params?.deviceInfo) {
      const info = JSON.parse(route.params.deviceInfo);
      setDeviceInfo(info);
      setIsSelected(info.deviceDate[0].type);
      getDeviceConfigData(info.device.id);
    }
  }, [route.params]);

  return (
    <View style={styles.differential}>
      <CustomStatusBar navTitle="差分源配置" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.contentBox}>
        {/* 配置列表 */}
        {configList.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.configItem, isSelected === item.type && styles.active]}
            onPress={() => selectConfig(item)}>
            <Text style={styles.title}>{item.title}</Text>
            {isSelected === item.type && <Image style={styles.icon} source={require("@/assets/images/device/icon-agree.png")} />}
          </TouchableOpacity>
        ))}

        {/* ntrip 配置 */}
        <View style={styles.ntripConfig}>
          <Text style={styles.text}>{configSelect.title}配置</Text>
          <TouchableOpacity style={styles.config} onPress={updateConfig}>
            <Text style={styles.configText}>{deviceInfo?.deviceDate.length ? "已配置" : "未配置"}</Text>
            <Image style={styles.arrow} source={require("@/assets/images/common/icon-right.png")} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 弹窗 */}
      {showNtripConfig && (
        <DeviceNtripConfig
          visible={showNtripConfig}
          deviceConfig={ntripConfig}
          onClickCancel={() => setShowNtripConfig(false)}
          onClickSave={saveNtripConfig}
          onClosePopup={() => setShowNtripConfig(false)}
        />
      )}
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
};

export default DifferentialConfig;

const styles = StyleSheet.create({
  differential: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentBox: {
    flex: 1,
    backgroundColor: "#f5f6f8",
  },
  configItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 52,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e7e7e7",
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
  },
  icon: {
    width: 26,
    height: 26,
  },
  active: {
    color: "#08ae3c",
  },
  ntripConfig: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 52,
    paddingHorizontal: 16,
    marginTop: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e7e7e7",
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
  },
  arrow: {
    width: 26,
    height: 26,
    marginLeft: 8,
  },
});
