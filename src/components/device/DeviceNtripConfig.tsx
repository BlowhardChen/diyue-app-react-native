// DeviceNtripConfig.tsx
import React, {useEffect, useState} from "react";
import {View, Text, TextInput, StyleSheet} from "react-native";
import DeviceConfigCommon from "./DeviceConfigCommon";

interface DeviceConfig {
  ip: string;
  port: string;
  userName: string;
  pwd: string;
  topic: string;
}

interface Props {
  visible: boolean;
  deviceConfig?: DeviceConfig;
  onClosePopup: () => void;
  onClickCancel: () => void;
  onClickSave: (config: DeviceConfig) => void;
}

const DeviceNtripConfig: React.FC<Props> = ({visible, deviceConfig, onClosePopup, onClickCancel, onClickSave}) => {
  const [ntripConfig, setNtripConfig] = useState<DeviceConfig>({
    ip: "rtk.ntrip.qxwz.com",
    port: "8002",
    userName: "qxcorsh0060584",
    pwd: "35ddfe7",
    topic: "AUTO",
  });

  // 相当于 onLoad，同步 props.deviceConfig
  useEffect(() => {
    if (deviceConfig) {
      setNtripConfig({
        ip: deviceConfig.ip || "",
        port: deviceConfig.port || "",
        userName: deviceConfig.userName || "",
        pwd: deviceConfig.pwd || "",
        topic: deviceConfig.topic || "",
      });
    }
  }, [deviceConfig]);

  const updateField = (key: keyof DeviceConfig, value: string) => {
    setNtripConfig(prev => ({...prev, [key]: value}));
  };

  return (
    <DeviceConfigCommon
      visible={visible}
      popupTitle="Ntrip配置"
      onClosePopup={onClosePopup}
      onClickCancel={onClickCancel}
      onClickSave={() => onClickSave(ntripConfig)}>
      <View style={styles.configList}>
        <View style={styles.configItem}>
          <Text style={styles.label}>服务器IP</Text>
          <TextInput
            style={styles.input}
            value={ntripConfig.ip}
            onChangeText={text => updateField("ip", text)}
            placeholder="请输入服务器IP"
          />
        </View>

        <View style={styles.configItem}>
          <Text style={styles.label}>端口</Text>
          <TextInput
            style={styles.input}
            value={ntripConfig.port}
            onChangeText={text => updateField("port", text)}
            placeholder="请输入端口"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.configItem}>
          <Text style={styles.label}>用户名</Text>
          <TextInput
            style={styles.input}
            value={ntripConfig.userName}
            onChangeText={text => updateField("userName", text)}
            placeholder="请输入用户名"
          />
        </View>

        <View style={styles.configItem}>
          <Text style={styles.label}>密码</Text>
          <TextInput
            style={styles.input}
            value={ntripConfig.pwd}
            onChangeText={text => updateField("pwd", text)}
            placeholder="请输入密码"
            secureTextEntry
          />
        </View>

        <View style={styles.configItem}>
          <Text style={styles.label}>挂载点</Text>
          <TextInput
            style={styles.input}
            value={ntripConfig.topic}
            onChangeText={text => updateField("topic", text)}
            placeholder="请输入挂载点"
          />
        </View>
      </View>
    </DeviceConfigCommon>
  );
};

export default DeviceNtripConfig;

const styles = StyleSheet.create({
  configList: {
    marginTop: 10,
  },
  configItem: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e7e7e7",
    paddingHorizontal: 12,
  },
  label: {
    width: 90,
    marginRight: 12,
    fontSize: 16,
    color: "#000",
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    paddingVertical: 6,
  },
});
