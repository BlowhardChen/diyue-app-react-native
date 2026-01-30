import {Global} from "@/styles/global";
import React, {useState} from "react";
import {View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView} from "react-native";

// 模拟设备数据
const deviceData = {
  设备1: {
    imei: "867296055876441",
    status: "已连接",
    params: [
      {title: "播种", value: "1.2", unit: "kg/亩"},
      {title: "施肥", value: "1.2", unit: "kg/亩"},
      {title: "行距", value: "1.2", unit: "m"},
      {title: "犁地", value: "3", unit: "kg/亩"},
    ],
  },
  设备2: {
    imei: "867296055876442",
    status: "未连接",
    params: [
      {title: "播种", value: "0", unit: "kg/亩"},
      {title: "施肥", value: "0", unit: "kg/亩"},
      {title: "行距", value: "0", unit: "m"},
      {title: "犁地", value: "0", unit: "kg/亩"},
    ],
  },
};

const DeviceParameterScreen = () => {
  // 选中设备状态
  const [activeDevice, setActiveDevice] = useState("设备1");

  // 当前设备数据
  const currentDevice = deviceData[activeDevice];

  return (
    <View style={styles.container}>
      {/* 设备标签切换栏 */}
      <ScrollView style={styles.deviceTabBarContainer}>
        <View style={styles.deviceTabBar}>
          {["设备1", "设备2"].map(device => (
            <TouchableOpacity
              key={device}
              style={[styles.deviceTab, activeDevice === device && styles.activeDeviceTab]}
              onPress={() => setActiveDevice(device)}>
              <Text style={[styles.deviceTabText, activeDevice === device && styles.activeDeviceTabText]}>{device}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 设备信息栏 */}
      <View style={styles.deviceInfoContainer}>
        {/* 设备图标 */}
        <Image source={require("@/assets/images/farming/icon-rtk.png")} style={styles.deviceIcon} resizeMode="contain" />
        {/* 设备IMEI和状态 */}
        <View style={styles.deviceInfoText}>
          <Text style={styles.imeiText}>设备IMEI: {currentDevice.imei}</Text>
          <View style={styles.statusRow}>
            <Text style={styles.imeiTypeText}>设备状态:</Text>
            <Image
              source={
                currentDevice.status === "已连接"
                  ? require("@/assets/images/device/success.png")
                  : require("@/assets/images/device/error.png")
              }
              style={styles.statusDot}
              resizeMode="contain"
            />
            <Text style={[styles.statusText, {color: currentDevice.status === "已连接" ? Global.colors.primary : "#666"}]}>
              {currentDevice.status}
            </Text>
          </View>
        </View>
      </View>

      {/* 参数卡片网格 */}
      <View style={styles.paramsGrid}>
        {currentDevice.params.map((param: any, index: React.Key | null | undefined) => (
          <View key={index} style={styles.paramCard}>
            <View style={styles.paramTitleContainer}>
              <Text style={styles.paramTitle}>{param.title}</Text>
              <Image
                source={require("@/assets/images/common/icon-right-gray.png")}
                style={styles.arrowIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.paramValueContainer}>
              <Text style={styles.paramValue}>{param.value}</Text>
              <Text style={styles.paramUnit}>{param.unit}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
  },
  deviceTabBarContainer: {
    maxHeight: 130,
    marginBottom: 10,
  },
  deviceTabBar: {
    gap: 10,
    flexDirection: "row",
    justifyContent: "flex-start",
    flexWrap: "wrap",
  },
  deviceTab: {
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#d2d2d2",
    backgroundColor: "#f5f5f5",
    marginRight: 10,
    marginBottom: 10,
  },
  activeDeviceTab: {
    backgroundColor: Global.colors.primary,
    borderColor: Global.colors.primary,
  },
  deviceTabText: {
    fontSize: 16,
    color: "#333",
  },
  activeDeviceTabText: {
    color: "#fff",
    fontWeight: "500",
  },
  deviceInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    padding: 10,
  },
  deviceIcon: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  deviceInfoText: {
    flex: 1,
  },
  imeiText: {
    fontSize: 15,
    color: "#000",
    fontWeight: "500",
    marginBottom: 5,
  },
  imeiTypeText: {
    fontSize: 14,
    color: "rgba(0,0,0,0.65)",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 14,
    height: 14,
    marginHorizontal: 5,
  },
  connectedDot: {
    backgroundColor: Global.colors.primary,
  },
  disconnectedDot: {
    backgroundColor: "#ff3333",
  },
  statusText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "400",
  },
  paramsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  paramCard: {
    width: "48%",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    justifyContent: "space-between",
  },
  paramTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paramTitle: {
    fontSize: 16,
    color: "rgba(102, 102, 102, 0.65)",
    fontWeight: "500",
  },
  paramValueContainer: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  paramValue: {
    fontSize: 18,
    color: "#333",
    fontWeight: "500",
  },
  paramUnit: {
    marginLeft: 5,
    fontSize: 14,
    color: "#666",
  },
  arrowIcon: {
    width: 16,
    height: 16,
  },
});

export default DeviceParameterScreen;
