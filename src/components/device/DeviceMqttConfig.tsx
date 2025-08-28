import React, {useState, useEffect} from "react";
import {View, Text, TextInput, StyleSheet} from "react-native";
import DeviceConfigCommon from "./DeviceConfigCommon";

type MqttConfig = {
  ip: string;
  port: string;
  userName: string;
  pwd: string;
  topic: string;
};

type Props = {
  visible: boolean;
  deviceConfig?: Partial<MqttConfig>;
  onClosePopup: () => void;
  onClickCancel: () => void;
  onClickSave: (config: MqttConfig) => void;
};

const DeviceMqttConfig: React.FC<Props> = ({visible, deviceConfig, onClosePopup, onClickCancel, onClickSave}) => {
  const [mqttConfig, setMqttConfig] = useState<MqttConfig>({
    ip: "mqtt.com",
    port: "1883",
    userName: "username",
    pwd: "password",
    topic: "1234567890",
  });

  // 初始化填充 deviceConfig 数据
  useEffect(() => {
    if (deviceConfig) {
      setMqttConfig(prev => ({
        ...prev,
        ...deviceConfig,
      }));
    }
  }, [deviceConfig]);

  return (
    <DeviceConfigCommon
      visible={visible}
      popupTitle="MQTT配置"
      onClosePopup={onClosePopup}
      onClickCancel={onClickCancel}
      onClickSave={() => onClickSave(mqttConfig)}>
      <View style={styles.configList}>
        <View style={styles.configItem}>
          <Text style={styles.label}>IP</Text>
          <TextInput
            style={styles.input}
            value={mqttConfig.ip}
            onChangeText={text => setMqttConfig(prev => ({...prev, ip: text}))}
          />
        </View>

        <View style={styles.configItem}>
          <Text style={styles.label}>端口</Text>
          <TextInput
            style={styles.input}
            value={mqttConfig.port}
            onChangeText={text => setMqttConfig(prev => ({...prev, port: text}))}
          />
        </View>

        <View style={styles.configItem}>
          <Text style={styles.label}>用户名</Text>
          <TextInput
            style={styles.input}
            value={mqttConfig.userName}
            onChangeText={text => setMqttConfig(prev => ({...prev, userName: text}))}
          />
        </View>

        <View style={styles.configItem}>
          <Text style={styles.label}>密码</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={mqttConfig.pwd}
            onChangeText={text => setMqttConfig(prev => ({...prev, pwd: text}))}
          />
        </View>

        <View style={styles.configItem}>
          <Text style={styles.label}>topic</Text>
          <TextInput
            style={styles.input}
            value={mqttConfig.topic}
            onChangeText={text => setMqttConfig(prev => ({...prev, topic: text}))}
          />
        </View>
      </View>
    </DeviceConfigCommon>
  );
};

const styles = StyleSheet.create({
  configList: {
    marginBottom: 20,
  },
  configItem: {
    flexDirection: "row",
    alignItems: "center",
    width: 343, // 686rpx -> 343dp
    height: 52, // 104rpx -> 52dp
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e7e7e7",
  },
  label: {
    width: 80, // 160rpx -> 80dp
    marginRight: 10, // 20rpx -> 10dp
    fontSize: 16,
    color: "#000",
  },
  input: {
    flex: 1,
    fontSize: 18, // 36rpx -> 18dp
    fontWeight: "500",
    color: "#000",
  },
});

export default DeviceMqttConfig;
