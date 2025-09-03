// 圈地
import {View, Text, TouchableOpacity, Image, Platform, PermissionsAndroid, ToastAndroid} from "react-native";
import {EnclosureScreenStyles} from "./styles/EnclosureScreen";
import {useEffect, useRef, useState} from "react";
import {observer} from "mobx-react-lite";
import {mapStore} from "@/stores/mapStore";
import MapControlButton from "@/components/land/MapControlButton";
import MapSwitcher from "@/components/common/MapSwitcher";
import PermissionPopup from "@/components/common/PermissionPopup";
import WebView from "react-native-webview";
import Geolocation from "@react-native-community/geolocation";
import LandEnclosureCustomNavBar from "@/components/land/LandEnclosureCustomNavBar";
import useOptimizedHeading from "@/hooks/useOptimizedHeading";
import KeepAwake from "react-native-keep-awake";
import Popup from "@/components/common/Popup";
import {useNavigation, useFocusEffect} from "@react-navigation/native";
import {BackHandler} from "react-native";
import {checkLocationPermission, requestLocationPermission} from "@/utils/checkPermissions";
import {showCustomToast} from "@/components/common/CustomToast";

const EnclosureScreen = observer(() => {
  const [popupTips, setPopupTips] = useState("请点击打点按钮打点或点击十字光标标点");
  const [isShowSaveButton, setShowSaveButton] = useState(true);
  const [dotTotal, setDotTotal] = useState(0);
  const [showMapSwitcher, setShowMapSwitcher] = useState(false);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [showBackPopup, setShowBackPopup] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const navigation = useNavigation();
  const beforeRemoveRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const isFirstLocationRef = useRef(true);
  const [polygonArea, setPolygonArea] = useState("");

  // 启用屏幕常亮
  useEffect(() => {
    KeepAwake.activate();
    // 组件卸载时关闭屏幕常亮，恢复系统默认行为
    return () => {
      KeepAwake.deactivate();
    };
  }, []);

  useEffect(() => {
    getLocationService();
  }, []);

  useEffect(() => {
    initLocationPermission();
  }, []);

  // 初始化定位权限
  const initLocationPermission = async () => {
    const granted = await checkLocationPermission();
    if (granted) {
      setHasLocationPermission(true);
      // 如果 WebView 已经准备好，直接启动
      if (isWebViewReady) {
        startPositionWatch();
      }
    } else {
      setShowPermissionPopup(true);
    }
  };

  // 切换地图图层
  const onToggleMapLayer = () => {
    setShowMapSwitcher(true);
  };

  // 处理地图选择
  const handleSelectMap = ({type, layerUrl}: {type: string; layerUrl: string}) => {
    switch (type) {
      case "标准地图":
        switchMapLayer("TIANDITU_ELEC");
        break;
      case "卫星地图":
        switchMapLayer("TIANDITU_SAT");
        break;
      case "自定义":
        switchMapLayer("CUSTOM", layerUrl);
        break;
      default:
        break;
    }
  };

  // 切换地图图层
  const switchMapLayer = (layerType: string, layerUrl?: string) => {
    if (layerType === "CUSTOM") {
      webViewRef.current?.postMessage(JSON.stringify({type: "SWITCH_LAYER", layerType, layerUrl}));
    } else {
      webViewRef.current?.postMessage(JSON.stringify({type: "SWITCH_LAYER", layerType}));
    }
  };

  // 获取定位服务
  const getLocationService = async () => {
    const hasPermission = await checkLocationPermission();
    if (hasPermission) {
      locateDevicePosition(true);
    } else {
      getLocationByIP();
    }
  };

  // 通过IP定位
  const getLocationByIP = async () => {
    try {
      const response = await fetch("http://ip-api.com/json/");
      const data = await response.json();
      if (data.status === "success") {
        const {lat, lon} = data;
        locateDevicePosition(false, {lon, lat});
      }
    } catch (error) {
      console.error("❌ IP定位请求失败:", error);
    }
  };

  // 定位位置
  const onLocatePosition = async () => {
    const hasPermission = await checkLocationPermission();
    if (hasPermission) {
      locateDevicePosition(true);
    } else {
      setShowPermissionPopup(true);
    }
  };

  // 同意定位权限
  const handleAcceptPermission = async () => {
    const granted = await requestLocationPermission();
    if (granted) {
      setHasLocationPermission(true);
      setShowPermissionPopup(false);
      if (isWebViewReady) {
        startPositionWatch();
      }
    }
  };

  // 拒绝定位权限
  const handleRejectPermission = () => {
    getLocationByIP();
    setShowPermissionPopup(false);
  };

  // 定位设备位置
  const locateDevicePosition = async (isShowIcon: boolean, coordinate?: {lon: number; lat: number}) => {
    if (isShowIcon) {
      await Geolocation.getCurrentPosition(position => {
        const {latitude, longitude} = position.coords;
        webViewRef.current?.postMessage(
          JSON.stringify({
            type: "SET_ICON_LOCATION",
            location: {lon: longitude, lat: latitude},
          }),
        );
      });
    } else if (coordinate) {
      webViewRef.current?.postMessage(JSON.stringify({type: "SET_LOCATION", location: coordinate}));
    }
  };

  // 开启定位
  const startPositionWatch = async () => {
    stopPositionWatch();

    Geolocation.getCurrentPosition(
      pos => {
        const {latitude, longitude} = pos.coords;
        webViewRef.current?.postMessage(
          JSON.stringify({
            type: "SET_ICON_LOCATION",
            location: {lon: longitude, lat: latitude},
          }),
        );
        isFirstLocationRef.current = false;
      },
      () => {},
      {enableHighAccuracy: true, timeout: 10000, maximumAge: 1000},
    );

    const watchId = Geolocation.watchPosition(
      pos => {
        const {latitude, longitude} = pos.coords;
        console.log("位置更新:", longitude, latitude); // 添加日志
        webViewRef.current?.postMessage(
          JSON.stringify({
            type: "UPDATE_ICON_LOCATION",
            location: {lon: longitude, lat: latitude},
          }),
        );
      },
      err => {
        console.error("watchPosition 错误:", err); // 更详细的错误日志
        // 根据错误类型显示不同提示
        if (err.code === 1) {
          showCustomToast("error", "定位权限被拒绝");
        } else if (err.code === 2) {
          showCustomToast("error", "位置不可用");
        } else if (err.code === 3) {
          showCustomToast("error", "定位超时");
        }
      },
      {enableHighAccuracy: true, distanceFilter: 1, interval: 1000, fastestInterval: 500},
    );

    watchIdRef.current = watchId as any;
  };

  // 停止定位
  const stopPositionWatch = () => {
    if (watchIdRef.current != null) {
      Geolocation.clearWatch(watchIdRef.current as any);
      watchIdRef.current = null;
    }
  };

  // 地图十字光标点击
  const onMapCursorDot = () => {
    setDotTotal(dotTotal + 1);
    setPopupTips("打点成功，请继续添加下一个点位");
    webViewRef.current?.postMessage(JSON.stringify({type: "CURSOR_DOT_MARKER"}));
  };

  // 撤销打点
  const onRevokeDot = () => {
    if (!dotTotal) {
      return;
    }
    setDotTotal(dotTotal - 1);
    setPopupTips("撤销成功，请继续添加下一个点位");
    webViewRef.current?.postMessage(JSON.stringify({type: "REMOVE_DOT_MARKER"}));
  };

  // 打点
  const onDot = async () => {
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      setShowPermissionPopup(true);
      return;
    }
    // GPS打点
    await onGpsDot();
  };

  // GPS打点
  const onGpsDot = async () => {
    await Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;

        setDotTotal(prev => prev + 1);
        setPopupTips("打点成功，请继续添加下一个点位");

        webViewRef.current?.postMessage(
          JSON.stringify({
            type: "DOT_MARKER",
            location: {lon: longitude, lat: latitude},
          }),
        );
      },
      error => {
        showCustomToast("error", "获取定位失败，请检查权限");
      },
      {enableHighAccuracy: true, timeout: 10000, maximumAge: 1000},
    );
  };

  // 保存
  const onSave = () => {
    console.log("保存", dotTotal, "面积:", polygonArea);
    if (dotTotal < 3) {
      showCustomToast("error", "未形成闭合图形，请至少保证有3个及以上点位");

      return;
    }
  };

  // 接收WebView消息
  const receiveWebviewMessage = (event: any) => {
    console.log("📬 WebView Message:", event.nativeEvent.data);
    let data = event.nativeEvent?.data;
    if (!data) return;
    try {
      data = JSON.parse(data);
    } catch (e) {
      console.log("WebView raw:", event.nativeEvent.data);
      return;
    }
    if (data && data.type) handleWebviewMessage(data);
  };

  // 处理webview消息
  const handleWebviewMessage = (data: {type: string; message?: string; area?: string}) => {
    console.log("处理webview消息", data);
    switch (data.type) {
      case "WEBVIEW_MAP_READY":
        setIsWebViewReady(true);
        if (hasLocationPermission) {
          startPositionWatch();
        }
        break;
      case "WEBVIEW_DOT_REPEAT":
        showCustomToast("error", "当前点位已保存，请前往下一个点位");
        break;
      case "WEBVIEW_DOT_SUCCESS":
        if (data.message) {
          setPopupTips(data.message);
        }
        if (data.area) {
          setPolygonArea(data.area);
        }
        break;
      case "WEBVIEW_CANCEL_DOT_SUCCESS":
        if (data.message) {
          setPopupTips(data.message);
        }
        if (data.area) {
          setPolygonArea(data.area);
        }
        break;
      default:
        break;
    }
  };

  // 监听朝向变化，发送给WebView
  useOptimizedHeading(heading => {
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "UPDATE_MARKER_ROTATION",
        rotation: heading,
      }),
    );
  });

  useFocusEffect(() => {
    beforeRemoveRef.current = navigation.addListener("beforeRemove", e => {
      // 阻止默认行为（阻止返回）
      e.preventDefault();

      // 如果确认弹窗已显示，说明已经拦截过一次，不需要重复弹出
      if (!showBackPopup) {
        setShowBackPopup(true); // 显示确认弹窗
      }
    });

    // Android 实体返回键监听（同样拦截）
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!showBackPopup) {
        setShowBackPopup(true);
      }
      return true; // 阻止默认行为
    });

    return () => {
      beforeRemoveRef.current();
      backHandler.remove();
      stopPositionWatch();
    };
  });

  return (
    <View style={EnclosureScreenStyles.container}>
      {/* 权限弹窗 */}
      <PermissionPopup
        visible={showPermissionPopup}
        onAccept={handleAcceptPermission}
        onReject={handleRejectPermission}
        title={"开启位置权限"}
        message={"获取位置权限将用于获取当前定位与记录轨迹"}
      />
      {/* 顶部导航 */}
      <LandEnclosureCustomNavBar
        navTitle="圈地"
        showRightIcon={true}
        onBackView={() => {
          setShowBackPopup(true);
        }}
      />
      {/* 地图 */}
      <View style={EnclosureScreenStyles.mapBox}>
        <View style={EnclosureScreenStyles.popupTips}>
          <Text style={EnclosureScreenStyles.popupTipsText}>{popupTips}</Text>
        </View>
        <View style={EnclosureScreenStyles.map}>
          <WebView
            ref={webViewRef}
            source={{uri: "file:///android_asset/web/enclosureMap.html"}}
            originWhitelist={["*"]}
            mixedContentMode="always"
            javaScriptEnabled
            domStorageEnabled
            allowFileAccess
            allowsInlineMediaPlayback
            onMessage={receiveWebviewMessage}
            style={{flex: 1}}
          />
          <View style={EnclosureScreenStyles.mapCopyright}>
            <Image source={require("../../assets/images/home/icon-td.png")} style={EnclosureScreenStyles.iconImg} />
            <Text style={EnclosureScreenStyles.copyrightText}>
              ©地理信息公共服务平台（天地图）GS（2024）0568号-甲测资字1100471
            </Text>
          </View>
        </View>
        {/* 右侧控制按钮 */}
        <View style={EnclosureScreenStyles.rightControl}>
          <MapControlButton
            iconUrl={require("../../assets/images/home/icon-layer.png")}
            iconName="图层"
            onPress={onToggleMapLayer}
          />
        </View>
        <View style={EnclosureScreenStyles.locationControl}>
          <MapControlButton
            iconUrl={require("../../assets/images/home/icon-location.png")}
            iconName="定位"
            onPress={onLocatePosition}
            style={{marginTop: 16}}
          />
        </View>
        {/* 底部按钮 */}
        <View style={EnclosureScreenStyles.footerButtonGroup}>
          <TouchableOpacity style={[EnclosureScreenStyles.buttonBase, EnclosureScreenStyles.buttonRevoke]} onPress={onRevokeDot}>
            <Text style={EnclosureScreenStyles.revokeText}>撤销</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[EnclosureScreenStyles.buttonBase, EnclosureScreenStyles.buttonDot]} onPress={onDot}>
            <Image source={require("@/assets/images/common/icon-plus.png")} style={EnclosureScreenStyles.dotIcon} />
            <Text style={EnclosureScreenStyles.dotText}>打点</Text>
          </TouchableOpacity>
          {isShowSaveButton ? (
            <TouchableOpacity style={[EnclosureScreenStyles.buttonBase, EnclosureScreenStyles.buttonSave]} onPress={onSave}>
              <Text style={[EnclosureScreenStyles.saveText, {color: dotTotal >= 3 ? "#08ae3c" : "#999"}]}>保存</Text>
            </TouchableOpacity>
          ) : (
            <View style={[EnclosureScreenStyles.buttonBase, EnclosureScreenStyles.placeholder]} />
          )}
        </View>
        {/* 十字光标 */}
        <TouchableOpacity style={EnclosureScreenStyles.locationCursor} activeOpacity={1} onPress={onMapCursorDot}>
          {mapStore.mapType === "标准地图" ? (
            <Image source={require("@/assets/images/common/icon-cursor-green.png")} style={EnclosureScreenStyles.cursorIcon} />
          ) : (
            <Image source={require("@/assets/images/common/icon-cursor.png")} style={EnclosureScreenStyles.cursorIcon} />
          )}
        </TouchableOpacity>
        {/* 图层切换弹窗 */}
        {showMapSwitcher && <MapSwitcher onClose={() => setShowMapSwitcher(false)} onSelectMap={handleSelectMap} />}
        {/* 返回上级页面确认弹窗 */}
        <Popup
          visible={showBackPopup}
          title="是否退出圈地"
          msgText="退出后不会保留已打点位"
          leftBtnText="退出"
          rightBtnText="继续圈地"
          onLeftBtn={() => {
            setShowBackPopup(false);
            beforeRemoveRef.current();
            navigation.goBack();
          }}
          onRightBtn={() => {
            setShowBackPopup(false);
          }}
        />
      </View>
    </View>
  );
});

export default EnclosureScreen;
