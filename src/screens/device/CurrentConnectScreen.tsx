// 当前连接
import React, {useEffect, useState} from "react";
import {View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, ImageBackground} from "react-native";
import {useNavigation, useRoute} from "@react-navigation/native";
import CustomStatusBar from "@/components/common/CustomStatusBar";
import {StackNavigationProp} from "@react-navigation/stack";
import {getDeviceInfo, linkDevice} from "@/services/device";
import {observer} from "mobx-react-lite";
import {deviceStore} from "@/stores/deviceStore";
import {navigateToTargetRoute} from "@/utils/navigationUtils";

type DeviceStackParamList = {
  DifferentialConfig: {deviceInfo: any};
  DataUpload: {deviceInfo: any};
};

const CurrentConnectScreen = observer(() => {
  const navigation = useNavigation<StackNavigationProp<DeviceStackParamList>>();
  const route = useRoute<any>();
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [configType, setConfigType] = useState<{title: string; type: string}>({
    title: "MQTT",
    type: "3",
  });

  // 返回
  const backView = () => {
    navigation.goBack();
  };

  // 获取设备信息
  const getDeviceBaseInfo = async (imeiValue: string) => {
    const {data} = await getDeviceInfo(imeiValue);
    setDeviceInfo(data);
    if (data.deviceDate.length) {
      setConfigType({
        title: "Ntrip",
        type: "2",
      });
    }
    if (data.deviceNetwork.length) {
      setConfigType({
        title: "MQTT",
        type: "3",
      });
    }
    deviceStore.listenDeviceStatus(data.deviceStatus);
  };

  // 差分配置源
  const differenceConfig = () => {
    navigation.navigate("DifferentialConfig", {deviceInfo});
  };

  // 数据上传
  const dataUpload = () => {
    navigation.navigate("DataUpload", {deviceInfo});
  };

  // 配置完成
  const completeConfig = async () => {
    if (route.params?.farmingJoinTypeId) {
      await linkDevice({
        imei: deviceInfo.device.imei,
        taskType: route.params?.taskType || "1",
        farmingJoinTypeId: route.params?.farmingJoinTypeId,
      });
      deviceStore.setFarmingDeviceImei(deviceInfo.device.imei);
    } else {
      await linkDevice({
        imei: deviceInfo.device.imei,
        taskType: deviceInfo?.taskType || "1",
      });
      deviceStore.setDeviceImei(deviceInfo.device.imei);
    }
    await navigateToTargetRoute();
  };

  useEffect(() => {
    const imeiValue = route.params?.imei;
    getDeviceBaseInfo(imeiValue);
  }, [route.params]);

  return (
    <View style={styles.container}>
      <CustomStatusBar navTitle="当前连接" onBack={backView} />
      <ScrollView style={styles.content}>
        <ImageBackground
          source={require("@/assets/images/device/current-connect-bg.png")}
          style={styles.deviceMsgBox}
          resizeMode="stretch">
          <View style={styles.deviceImg}>
            <Image source={require("@/assets/images/device/rtk.png")} style={styles.deviceImgInner} />
          </View>
          <View style={styles.deviceMsg}>
            <Text style={styles.imei} numberOfLines={1}>
              设备IMEI: {deviceInfo?.device?.imei}
            </Text>
            <View style={styles.deviceStatus}>
              <Text>设备状态：</Text>
              <Image
                source={
                  deviceInfo?.deviceStatus === "1"
                    ? require("@/assets/images/device/success.png")
                    : require("@/assets/images/device/error.png")
                }
                style={styles.statusIcon}
              />
              <Text>{deviceInfo?.deviceStatus === "1" ? "已连接" : "未连接"}</Text>
            </View>
            <Text style={styles.version}>固件版本: {deviceInfo?.device?.ver || "未知"}</Text>
            <Text style={styles.iccid}>ICCID: {deviceInfo?.device?.iccid || "未知"}</Text>
          </View>
        </ImageBackground>

        {/* 配置项 */}
        <View style={styles.deviceConfig}>
          <TouchableOpacity style={styles.deviceConfigItem}>
            <View style={styles.left}>
              <Image
                source={
                  deviceInfo?.device?.imgUrl
                    ? {uri: deviceInfo.device.imgUrl}
                    : require("@/assets/images/device/icon-network.png")
                }
                style={styles.leftIcon}
              />
              <Text style={styles.leftText}>网络配置源</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.rightText}>4G</Text>
              <Image source={require("@/assets/images/common/icon-right.png")} style={styles.rightIcon} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deviceConfigItem} onPress={differenceConfig}>
            <View style={styles.left}>
              <Image source={require("@/assets/images/device/icon-base-station.png")} style={styles.leftIcon} />
              <Text style={styles.leftText}>差分配置源</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.rightText}>{configType.title}</Text>
              <Image source={require("@/assets/images/common/icon-right.png")} style={styles.rightIcon} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deviceConfigItem} onPress={dataUpload}>
            <View style={styles.left}>
              <Image source={require("@/assets/images/device/icon-cloud.png")} style={styles.leftIcon} />
              <Text style={styles.leftText}>数据上传</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.rightText}>已启用</Text>
              <Image source={require("@/assets/images/common/icon-right.png")} style={styles.rightIcon} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <TouchableOpacity style={styles.button} onPress={completeConfig}>
          <Text style={styles.buttonText}>配置完成</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#fff"},
  content: {flex: 1, backgroundColor: "#f5f6f8"},

  deviceMsgBox: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 140,
  },
  deviceImg: {width: 82, height: 140},
  deviceImgInner: {width: 80, height: 140},
  deviceMsg: {flex: 1, paddingHorizontal: 12},
  imei: {fontSize: 18, fontWeight: "500", color: "#000"},
  deviceStatus: {flexDirection: "row", alignItems: "center", marginTop: 12},
  statusIcon: {width: 14, height: 14, marginRight: 3},
  version: {marginTop: 6},
  iccid: {marginTop: 6},

  deviceConfig: {marginTop: 8},
  deviceConfigItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 52,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e7e7e7",
  },
  left: {flexDirection: "row", alignItems: "center"},
  leftIcon: {width: 26, height: 26, marginRight: 8},
  leftText: {fontSize: 18, fontWeight: "500", color: "#000"},
  right: {flexDirection: "row", alignItems: "center"},
  rightText: {fontSize: 18, fontWeight: "500", color: "#999"},
  rightIcon: {width: 20, height: 20, marginLeft: 6},

  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 84,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  button: {
    flex: 1,
    height: 52,
    backgroundColor: "#08ae3c",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {fontSize: 20, fontWeight: "500", color: "#fff"},
});

export default CurrentConnectScreen;
