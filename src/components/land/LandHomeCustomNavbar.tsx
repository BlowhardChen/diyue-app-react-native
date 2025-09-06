import React, {useEffect, useState} from "react";
import {View, Text, TouchableOpacity, Image, StyleSheet, Platform, StatusBar} from "react-native";
import {useNavigation, useRoute} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import LinearGradient from "react-native-linear-gradient";
import {observer} from "mobx-react-lite";
import {deviceStore} from "@/stores/deviceStore";
import {saveTargetRoute} from "@/utils/navigationUtils";
import {getDeviceConnectStatus} from "@/services/device";

type HomeStackParamList = {
  AddDevice: undefined;
};

const tabs = [
  {title: "地图模式", type: "map"},
  {title: "列表模式", type: "list"},
];

interface Props {
  onChangeTab: (title: string, type: string) => void;
}

const deviceConnected = require("@/assets/images/common/device-connect.png");
const deviceDisconnected = require("@/assets/images/common/device-disconnect.png");

const LandHomeCustomNavbar: React.FC<Props> = observer(({onChangeTab}) => {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const [activeTab, setActiveTab] = useState(0);
  const route = useRoute();

  // 切换tab
  const changeTab = (tab: {title: string; type: string}, index: number) => {
    setActiveTab(index);
    onChangeTab(tab.title, tab.type);
  };

  // 连接设备
  const connectDevice = () => {
    saveTargetRoute(route.name);
    navigation.navigate("AddDevice");
  };

  // 获取设备连接状态
  const getDeviceConnect = async () => {
    const {data} = await getDeviceConnectStatus();
    deviceStore.listenDeviceStatus(data.deviceStatus);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      getDeviceConnect();
    });
    return unsubscribe;
  }, [navigation]);

  const deviceIcon = deviceStore.status === "1" ? deviceConnected : deviceDisconnected;

  return (
    <LinearGradient colors={["#41C95B", "#1AB850"]} start={{x: 0.5, y: 0}} end={{x: 0.15, y: 1}} style={styles.navbar}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.tabs}>
        {tabs.map((tab, index) => (
          <TouchableOpacity key={index} style={styles.tabItem} activeOpacity={1} onPress={() => changeTab(tab, index)}>
            <Text style={[styles.tabText, activeTab === index && styles.activeText]}>{tab.title}</Text>
            {activeTab === index && <View style={styles.underline} />}
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.deviceContent} onPress={connectDevice} activeOpacity={1}>
        <Image source={deviceIcon} style={styles.deviceIcon} />
      </TouchableOpacity>
    </LinearGradient>
  );
});

export default LandHomeCustomNavbar;

const styles = StyleSheet.create({
  navbar: {
    width: "100%",
    height: 90,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight ?? 24 : 44,
    justifyContent: "center",
    position: "relative",
    zIndex: 10,
  },
  tabs: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    height: 55,
  },
  tabItem: {
    width: 80,
    height: 40,
    marginHorizontal: 16,
    alignItems: "center",
  },
  tabText: {
    fontSize: 20,
    color: "#fff",
  },
  activeText: {
    fontWeight: "500",
  },
  underline: {
    width: 80,
    height: 3,
    marginTop: 4,
    backgroundColor: "#fff",
  },
  deviceContent: {
    position: "absolute",
    right: 16,
    bottom: 6,
    width: 36,
    height: 36,
    borderRadius: 36,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  deviceIcon: {
    width: 26,
    height: 26,
    resizeMode: "contain",
  },
});
