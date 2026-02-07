// 农事任务详情
import {View, Text, TouchableOpacity, Image, StatusBar, BackHandler} from "react-native";
import {useEffect, useRef, useState, useCallback} from "react";
import {observer} from "mobx-react-lite";
import {mapStore} from "@/stores/mapStore";
import MapControlButton from "@/components/land/MapControlButton";
import MapSwitcher from "@/components/common/MapSwitcher";
import PermissionPopup from "@/components/common/PermissionPopup";
import WebView from "react-native-webview";
import KeepAwake from "react-native-keep-awake";
import {useNavigation, useFocusEffect, useRoute, RouteProp} from "@react-navigation/native";
import {showCustomToast} from "@/components/common/CustomToast";
import {getToken} from "@/utils/tokenUtils";
import WebSocketClass from "@/utils/webSocketClass";
import {deviceStore} from "@/stores/deviceStore";
import React from "react";
import {MechanicalTaskDetailScreenStyles} from "./styles/MechanicalTaskDetailScreen";
import {StackNavigationProp} from "@react-navigation/stack";
import {RootStackParamList} from "@/types/navigation";
import CustomFarmingHeader from "@/components/common/CustomFarmingHeader";
import MechanicalTaskBottomPopup from "./components/MechanicalTaskBottomPopup";
import {farmingDetailInfo, farmingScienceLandList} from "@/services/farming";
import {updateStore} from "@/stores/updateStore";
import MechanicalDeviceStatusPopup from "./components/MechanicalDeviceStatusPopup";
import Popup from "@/components/common/Popup";
import {saveTargetRoute} from "@/utils/navigationUtils";
import {getDeviceConnectStatus} from "@/services/device";
import useMapCore from "@/hooks/useMapCore";

type FarmingDetailParams = {
  id: string;
  navTitle: string;
};

type FarmingDetailRouteProp = RouteProp<Record<string, FarmingDetailParams>, string>;

type devcieStatus = "0" | "1" | "2"; // 0 未绑定 1 已绑定在线 2 已绑定离线

const MechanicalTaskDetailScreen = observer(() => {
  // 导航与路由
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<FarmingDetailRouteProp>();
  // WebView Ref
  const webViewRef = useRef<WebView>(null);
  // 初始化地图核心Hook
  const mapCore = useMapCore({
    webViewRef,
    onWebViewReady: useCallback(() => {
      // WebView就绪后的自定义回调
    }, []),
  });
  // 业务相关状态
  const [showPopupTips, setShowPopupTips] = useState(true);
  const beforeRemoveRef = useRef<any>(null);
  const [showBackPopup, setShowBackPopup] = useState(false);
  const [popupTips, setPopupTips] = useState("暂无设备，已启用GPS记录轨迹");
  const [popupTipsStyle, setPopupTipsStyle] = useState({backgroundColor: "#EBFFE4", color: "#08AE3C"});
  const [loading, setLoading] = useState<boolean>(false);
  const [farmingDetailData, setFarmingDetailData] = useState<any>(null);
  const [showMechanicalDeviceStatusPopup, setShowMechanicalDeviceStatusPopup] = useState(false);
  const [devicePopupMessage, setDevicePopupMessage] = useState(
    "检测到未绑定设备，为您推荐GPS记录轨迹方式；如需提高轨迹精度，请绑定设备",
  );
  const [devicePopupAcceptButtonText, setDevicePopupAcceptButtonText] = useState("有设备，绑定设备");
  const [devicePopupRejectButtonText, setDevicePopupRejectButtonText] = useState("无设备，GPS记录");
  const [rejectButtonStyle, setRejectButtonStyle] = useState({});
  const [deviceStatus, setDeviceStatus] = useState<devcieStatus>("0");

  // WebSocket相关Ref
  const webSocketRef = useRef<WebSocketClass | null>(null);
  const isFirstSocketLocationRef = useRef(true);

  // 屏幕常亮
  useEffect(() => {
    KeepAwake.activate();
    return () => {
      KeepAwake.deactivate();
    };
  }, []);

  // 初始化定位服务（调用Hook方法）
  useEffect(() => {
    mapCore.getLocationService();
  }, [mapCore.getLocationService]);

  // 获取农事数据
  useEffect(() => {
    setLoading(true);
    getFarmingDetailData();
    getFarmingLandData();
  }, []);

  useEffect(() => {
    switch (deviceStatus) {
      case "0":
        setPopupTips("暂无设备，已启用GPS记录轨迹");
        setPopupTipsStyle({backgroundColor: "#EBFFE4", color: "#08AE3C"});
        break;
      case "1":
        setPopupTips("设备已连接，请正常作业");
        setPopupTipsStyle({color: "#08AE3C", backgroundColor: "#EBFFE4"});
        break;
      case "2":
        setPopupTips("设备离线，已启用GPS记录轨迹");
        setPopupTipsStyle({color: "#F58700", backgroundColor: "#FFF7E8"});
        setDevicePopupMessage("设备离线，已启用GPS记录轨迹");
        setDevicePopupAcceptButtonText("换绑设备");
        setDevicePopupRejectButtonText("GPS记录");
        break;
    }
  }, [deviceStatus]);

  // 页面聚焦逻辑
  useFocusEffect(
    React.useCallback(() => {
      initWebSocket();
      mapCore.initLocationByDeviceStatus();
      return () => {
        // 销毁WebSocket
        if (webSocketRef.current) {
          webSocketRef.current.close();
          webSocketRef.current = null;
        }
        // 停止定位
        mapCore.stopPositionWatch();
      };
    }, [mapCore.initLocationByDeviceStatus, mapCore.stopPositionWatch]),
  );

  // 绑定&换绑设备
  const handleConnectDevice = () => {
    saveTargetRoute(route.name, ["Main", "MechanicalTask"], {...route.params});
    navigation.navigate("AddDevice", {farmingJoinTypeId: route.params?.id, taskType: "2"});
  };

  // 农事设备弹窗-确认
  const handleAcceptMechanicalDeviceStatus = () => {
    saveTargetRoute(route.name, ["Main", "MechanicalTask"], {...route.params});
    navigation.navigate("AddDevice", {farmingJoinTypeId: route.params?.id, taskType: "2"});
    setShowMechanicalDeviceStatusPopup(false);
  };

  // 农事设备弹窗-拒绝
  const handleRejectMechanicalDeviceStatus = () => {
    setShowMechanicalDeviceStatusPopup(false);
  };

  // 关闭提示框
  const closePopupTips = () => {
    setShowPopupTips(false);
  };

  // 查询设备在线状态
  const checkDeviceOnlineStatus = async (imei: string) => {
    if (!deviceStore.deviceImei) {
      return;
    }
    const {data} = await getDeviceConnectStatus({imei, farmingJoinTypeId: route.params?.id, taskType: "2"});
    setDeviceStatus(data.deviceStatus as devcieStatus);
    switch (data.deviceStatus) {
      case "0":
        setPopupTips("暂无设备，已启用GPS记录轨迹");
        setPopupTipsStyle({backgroundColor: "#EBFFE4", color: "#08AE3C"});
        break;
      case "1":
        setPopupTips("设备已连接，请正常作业");
        setPopupTipsStyle({color: "#08AE3C", backgroundColor: "#EBFFE4"});
        break;
      case "2":
        setPopupTips("设备离线，已启用GPS记录轨迹");
        setPopupTipsStyle({color: "#F58700", backgroundColor: "#FFF7E8"});
        setDevicePopupMessage("设备离线，已启用GPS记录轨迹");
        setDevicePopupAcceptButtonText("换绑设备");
        setDevicePopupRejectButtonText("GPS记录");
        break;
    }
  };

  // 获取农事详情数据
  const getFarmingDetailData = async () => {
    try {
      const {data} = await farmingDetailInfo({farmingJoinTypeId: route.params?.id, type: "2"});
      console.log("农事详情数据：", data);
      if (!data) return;
      setLoading(false);
      setFarmingDetailData(data);
      if (data.status === "1") return;
      setDeviceStatus(data.deviceStatus as devcieStatus);
      if (data.deviceStatus === "0") {
        setPopupTips("暂无设备，已启用GPS记录轨迹");
        setPopupTipsStyle({color: "#FF563A", backgroundColor: "#FFECE9"});
        setDevicePopupMessage("检测到未绑定设备，为您推荐GPS记录轨迹方式，如需提高轨迹精度，请绑定设备");
        setDevicePopupAcceptButtonText("有设备，绑定设备");
        setDevicePopupRejectButtonText("无设备，GPS记录");
        setShowMechanicalDeviceStatusPopup(true);
      } else {
        checkDeviceOnlineStatus(data.dyDevice.imei);
      }
      updateStore.setIsUpdateFarming(false);
    } catch (error) {
      showCustomToast("error", "获取农事详情失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 获取农事地块数据
  const getFarmingLandData = async () => {
    const {data} = await farmingScienceLandList({id: route.params?.id});
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "DRAW_MARK_ENCLOSURE_LAND",
        data,
      }),
    );
  };

  // 初始化WebSocket
  const initWebSocket = async () => {
    if (!deviceStore.deviceImei) {
      return;
    }
    const token = await getToken();
    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
    }
    webSocketRef.current = new WebSocketClass({
      data: {token, imei: deviceStore.deviceImei},
      onConnected: () => {
        if (mapCore.rtkLocation.lat !== 0 && mapCore.rtkLocation.lon !== 0) {
          webViewRef.current?.postMessage(
            JSON.stringify({
              type: "SET_ICON_LOCATION",
              location: {lon: mapCore.rtkLocation.lon, lat: mapCore.rtkLocation.lat},
            }),
          );
        }
        mapCore.initLocationByDeviceStatus();
      },
      onMessage: (data: any) => {
        const socketData = JSON.parse(JSON.stringify(data));
        if (socketData.taskType !== "2") return;
        // 处理定位数据
        if (socketData.lng && socketData.lat && socketData.lng !== 0 && socketData.lat !== 0) {
          const newLocation = {lon: socketData.lng, lat: socketData.lat};
          // 调用Hook更新RTK定位
          mapCore.setRtkLocation(newLocation);
          console.log("WebSocket 接收定位数据:", socketData);
          const messageType = isFirstSocketLocationRef.current ? "SET_ICON_LOCATION" : "UPDATE_ICON_LOCATION";
          webViewRef.current?.postMessage(
            JSON.stringify({
              type: messageType,
              location: newLocation,
            }),
          );

          if (isFirstSocketLocationRef.current) {
            isFirstSocketLocationRef.current = false;
          }
        }

        if (!farmingDetailData?.dyDevice?.imei) return;
        // 处理设备状态
        if (socketData.deviceStatus === "2") {
          setDeviceStatus("2");
          deviceStore.listenDeviceStatus("2");
          mapCore.setUseLocationFromSocket(false);
          mapCore.startPositionWatch();
          return;
        } else if (socketData.deviceStatus === "1") {
          setDeviceStatus("1");
          deviceStore.listenDeviceStatus("1");
          mapCore.setUseLocationFromSocket(true);
          mapCore.stopPositionWatch();
        }
      },
      onError: error => {
        mapCore.setUseLocationFromSocket(false);
        mapCore.startPositionWatch();
      },
    });
  };

  // 接收WebView消息
  const receiveWebviewMessage = (event: any) => {
    let data = event.nativeEvent?.data;
    if (!data) return;
    try {
      data = JSON.parse(data);
    } catch (e) {
      return;
    }
    if (data && data.type) mapCore.handleWebviewMessage(data);
  };

  // 页面返回监听
  useFocusEffect(() => {
    if (farmingDetailData?.status === "1") return;
    beforeRemoveRef.current = navigation.addListener("beforeRemove", e => {
      e.preventDefault();
      if (!showBackPopup) {
        setShowBackPopup(true);
      }
    });

    // Android 实体返回键监听
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!showBackPopup) {
        setShowBackPopup(true);
      }
      return true;
    });

    return () => {
      beforeRemoveRef.current();
      backHandler.remove();
      mapCore.stopPositionWatch();
    };
  });

  return (
    <View style={MechanicalTaskDetailScreenStyles.container}>
      {/* 顶部导航 */}
      <CustomFarmingHeader
        navTitle={route.params?.navTitle ?? "机耕任务详情"}
        deviceStatus={deviceStatus}
        showRightIcon={farmingDetailData?.status !== "1"}
        handleConnectDeviceFun={handleConnectDevice}
      />

      {/* 地图容器 */}
      <View style={MechanicalTaskDetailScreenStyles.mapBox}>
        {/* 作业提示弹窗 */}
        {showPopupTips && farmingDetailData?.status !== "1" && (
          <View style={[MechanicalTaskDetailScreenStyles.popupTips, popupTipsStyle]}>
            <Text style={[MechanicalTaskDetailScreenStyles.popupTipsText, popupTipsStyle]}>{popupTips}</Text>
            <TouchableOpacity style={MechanicalTaskDetailScreenStyles.iconClose} onPress={closePopupTips}>
              <Image
                source={require("@/assets/images/farming/icon-close-transparent.png")}
                style={MechanicalTaskDetailScreenStyles.iconClose}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* 地图WebView */}
        <View style={MechanicalTaskDetailScreenStyles.map} collapsable={false}>
          <WebView
            ref={webViewRef}
            source={{uri: "file:///android_asset/web/map.html"}}
            originWhitelist={["*"]}
            mixedContentMode="always"
            javaScriptEnabled
            domStorageEnabled
            allowFileAccess
            allowsInlineMediaPlayback
            onMessage={receiveWebviewMessage}
            style={{flex: 1}}
          />
          {/* 地图版权信息 */}
          <View style={MechanicalTaskDetailScreenStyles.mapCopyright}>
            <Image source={require("@/assets/images/home/icon-td.png")} style={MechanicalTaskDetailScreenStyles.iconImg} />
            <Text style={MechanicalTaskDetailScreenStyles.copyrightText}>
              ©地理信息公共服务平台（天地图）GS（2024）0568号-甲测资字1100471
            </Text>
          </View>
        </View>

        {/* 右侧图层控制按钮（调用Hook方法） */}
        <View style={MechanicalTaskDetailScreenStyles.rightControl}>
          <MapControlButton
            iconUrl={require("@/assets/images/home/icon-layer.png")}
            iconName="图层"
            onPress={mapCore.onToggleMapLayer}
          />
        </View>

        {/* 定位按钮（调用Hook方法） */}
        <View style={MechanicalTaskDetailScreenStyles.locationControl}>
          <MapControlButton
            iconUrl={require("@/assets/images/home/icon-location.png")}
            iconName="定位"
            onPress={mapCore.onLocatePosition}
            style={{marginTop: 16}}
          />
        </View>

        {/* 左侧农事类型标识 */}
        <View style={MechanicalTaskDetailScreenStyles.farmingType}>
          <View style={MechanicalTaskDetailScreenStyles.farmingTypeItem}>
            <View style={[MechanicalTaskDetailScreenStyles.farmingTypeItemIcon, {borderColor: "#08AE3C"}]} />
            <Text style={MechanicalTaskDetailScreenStyles.farmingTypeText}>翻耕</Text>
          </View>
          <View style={MechanicalTaskDetailScreenStyles.farmingTypeItem}>
            <View
              style={[MechanicalTaskDetailScreenStyles.farmingTypeItemIcon, {borderColor: "#F58700", borderStyle: "dashed"}]}
            />
            <Text style={MechanicalTaskDetailScreenStyles.farmingTypeText}>耙平</Text>
          </View>
        </View>

        {/* 图层切换弹窗（使用Hook状态/方法） */}
        {mapCore.showMapSwitcher && (
          <MapSwitcher onClose={() => mapCore.setShowMapSwitcher(false)} onSelectMap={mapCore.handleSelectMap} />
        )}

        {/* 定位权限弹窗（使用Hook状态/方法） */}
        <PermissionPopup
          visible={mapCore.showPermissionPopup}
          onAccept={mapCore.handleAcceptPermission}
          onReject={mapCore.handleRejectPermission}
          title={"开启位置权限"}
          message={"获取位置权限将用于获取当前定位与记录轨迹"}
        />

        {/* 返回确认弹窗 */}
        <Popup
          visible={showBackPopup}
          title="是否退出任务"
          msgText="退出后将停止记录当前作业轨迹"
          leftBtnText="退出"
          rightBtnText="继续任务"
          msgTextStyle={{fontSize: 16}}
          onLeftBtn={() => {
            setShowBackPopup(false);
            beforeRemoveRef.current();
            navigation.goBack();
          }}
          onRightBtn={() => {
            setShowBackPopup(false);
          }}
        />

        {/* 作业状态弹窗 */}
        {farmingDetailData && <MechanicalTaskBottomPopup farmingDetailInfo={farmingDetailData} />}

        {/* 设备状态弹窗 */}
        <MechanicalDeviceStatusPopup
          visible={showMechanicalDeviceStatusPopup}
          title={"提示"}
          message={devicePopupMessage}
          acceptButtonText={devicePopupAcceptButtonText}
          rejectButtonText={devicePopupRejectButtonText}
          rejectButtonStyle={rejectButtonStyle}
          onAccept={handleAcceptMechanicalDeviceStatus}
          onReject={handleRejectMechanicalDeviceStatus}
        />
      </View>
    </View>
  );
});

export default MechanicalTaskDetailScreen;
