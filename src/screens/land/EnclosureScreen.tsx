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
import {LandListData, MapWebviewMessage, SaveLandParams, SaveLandResponse} from "@/types/land";
import {getToken} from "@/utils/tokenUtils";
import {addLand, getLandListData} from "@/services/land";
import {getNowDate} from "@/utils/public";
import {StackNavigationProp} from "@react-navigation/stack";
import CustomLoading from "@/components/common/CustomLoading";

type EnclosureStackParamList = {
  LandInfoEdit: {navigation: string; queryInfo: SaveLandResponse};
};

const EnclosureScreen = observer(() => {
  const navigation = useNavigation<StackNavigationProp<EnclosureStackParamList>>();
  const [popupTips, setPopupTips] = useState("请点击打点按钮打点或点击十字光标标点");
  const [dotTotal, setDotTotal] = useState(0);
  const [showMapSwitcher, setShowMapSwitcher] = useState(false);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [showBackPopup, setShowBackPopup] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const beforeRemoveRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const isFirstLocationRef = useRef(true);
  const [isPolygonIntersect, setIsPolygonIntersect] = useState(false);
  const [showSaveSuccessPopup, setShowSaveSuccessPopup] = useState(false);
  const [landInfo, setLandInfo] = useState<SaveLandResponse>();
  const [isSaving, setIsSaving] = useState(false);
  const [enclosureLandData, setEnclosureLandData] = useState<LandListData[]>();

  // 启用屏幕常亮
  useEffect(() => {
    KeepAwake.activate();
    return () => {
      KeepAwake.deactivate();
    };
  }, []);

  // 初始化定位服务
  useEffect(() => {
    getLocationService();
  }, []);

  // 初始化定位权限
  useEffect(() => {
    initLocationPermission();
  }, []);

  // 获取已圈地地块数据
  useEffect(() => {
    getEnclosureLandData();
  }, []);

  // 当WebView准备好时，应用保存的地图类型
  useEffect(() => {
    if (isWebViewReady) {
      applySavedMapType();
    }
  }, [isWebViewReady, mapStore.mapType]);

  // 初始化定位权限和地图图层
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

  // 应用保存的地图类型
  const applySavedMapType = () => {
    switch (mapStore.mapType) {
      case "标准地图":
        switchMapLayer("TIANDITU_ELEC");
        break;
      case "卫星地图":
        switchMapLayer("TIANDITU_SAT");
        break;
      case "自定义":
        switchMapLayer("CUSTOM", mapStore.customMapLayer);
        break;
      default:
        switchMapLayer("TIANDITU_SAT");
    }
  };

  // 切换地图图层
  const onToggleMapLayer = () => {
    setShowMapSwitcher(true);
  };

  // 处理地图选择
  const handleSelectMap = ({type, layerUrl}: {type: string; layerUrl: string}) => {
    // 保存选择的地图类型到mapStore
    mapStore.setMapType(type);
    if (type === "自定义" && layerUrl) {
      mapStore.setCustomMapType(layerUrl);
    }

    // 应用选择的地图
    handleSelectMapLayer(type, layerUrl);

    setShowMapSwitcher(false);
  };

  // 处理地图图层选择逻辑
  const handleSelectMapLayer = (type: string, layerUrl: string) => {
    switch (type) {
      case "标准地图":
        switchMapLayer("TIANDITU_ELEC");
        break;
      case "卫星地图":
        switchMapLayer("TIANDITU_SAT");
        break;
      case "自定义":
        if (layerUrl) {
          switchMapLayer("CUSTOM", layerUrl);
        } else {
          showCustomToast("error", "请输入有效的自定义图层URL");
        }
        break;
      default:
        break;
    }
  };

  // 切换地图图层
  const switchMapLayer = (layerType: string, layerUrl?: string) => {
    if (!isWebViewReady) return;

    const message = {
      type: "SWITCH_LAYER",
      layerType,
    };

    // 只有自定义图层才添加layerUrl属性
    if (layerType === "CUSTOM" && layerUrl) {
      (message as any).customUrl = layerUrl;
    }

    webViewRef.current?.postMessage(JSON.stringify(message));
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
      showCustomToast("error", "IP定位失败");
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
        console.log("位置更新:", longitude, latitude);
        webViewRef.current?.postMessage(
          JSON.stringify({
            type: "UPDATE_ICON_LOCATION",
            location: {lon: longitude, lat: latitude},
          }),
        );
      },
      err => {
        console.error("watchPosition 错误:", err);
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
    webViewRef.current?.postMessage(JSON.stringify({type: "CURSOR_DOT_MARKER"}));
  };

  // 撤销打点
  const onRevokeDot = () => {
    if (!dotTotal) {
      return;
    }
    setDotTotal(dotTotal - 1);
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
  const onSave = async () => {
    if (dotTotal < 3) {
      return;
    }

    if (isPolygonIntersect) {
      return;
    }
    const token = await getToken();
    // 向WebView发送保存请求
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "SAVE_POLYGON",
        token,
      }),
    );
  };

  // 保存地块
  const saveLandFunc = async (landParams: SaveLandParams) => {
    try {
      setIsSaving(true);
      const {data} = await addLand({
        landName: getNowDate(),
        list: landParams.polygonPath,
        acreageNum: landParams.area,
        actualAcreNum: landParams.area,
        url: landParams.landUrl ?? "",
      });
      console.log("保存地块", data);
      setLandInfo(data);
      setIsSaving(false);
      setShowSaveSuccessPopup(true);
    } catch (error) {
      setIsSaving(false);
    }
  };

  // 编辑地块信息
  const editEnclosureInfo = async () => {
    setShowSaveSuccessPopup(false);
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "CONTINUE_ENCLOSURE",
      }),
    );
    navigation.navigate("LandInfoEdit", {navigation: "Enclosure", queryInfo: landInfo as SaveLandResponse});
  };

  // 继续圈地
  const continueEnclosure = async () => {
    setShowSaveSuccessPopup(false);
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "CONTINUE_ENCLOSURE",
      }),
    );
  };

  // 获取已圈地地块数据
  const getEnclosureLandData = async () => {
    const {data} = await getLandListData({quitStatus: "0"});
    console.log("获取已圈地地块数据", data);
    setEnclosureLandData(data);
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "DRAW_ENCLOSURE_LAND",
        data,
      }),
    );
  };

  // 接收WebView消息
  const receiveWebviewMessage = (event: any) => {
    console.log("📬 接收WebView消息:", event.nativeEvent.data);
    let data = event.nativeEvent?.data;
    if (!data) return;
    try {
      data = JSON.parse(data);
    } catch (e) {
      return;
    }
    if (data && data.type) handleWebviewMessage(data);
  };

  // 处理webview消息
  const handleWebviewMessage = async (data: MapWebviewMessage) => {
    switch (data.type) {
      // 地图准备完成
      case "WEBVIEW_READY":
        setIsWebViewReady(true);
        if (hasLocationPermission) {
          startPositionWatch();
        }
        break;
      // 重复打点
      case "WEBVIEW_DOT_REPEAT":
        showCustomToast("error", "当前点位已保存，请前往下一个点位");
        break;
      // 打点更新
      case "WEBVIEW_UPDATE_DOT_TOTAL":
        handleDotTotalChange(data);
        break;
      // 地块多边形自相交
      case "WEBVIEW_POLYGON_INTERSECT":
        setIsPolygonIntersect(data.isPolygonIntersect as boolean);
        if (data.isPolygonIntersect && data.message) {
          setPopupTips(data.message);
        }
        break;
      // 保存地块
      case "SAVE_POLYGON":
        saveLandFunc(data.saveLandParams as SaveLandParams);
        break;
      // 报错处理
      case "WEBVIEW_ERROR":
        showCustomToast("error", data.message ?? "操作失败");
        break;
      // 点击地块
      case "POLYGON_CLICK":
        // let enclosureLand;
        // if (enclosureLandData) {
        //   enclosureLand = enclosureLandData.find(item => item.id === data.id);
        // }
        // console.log("EnclosureScreen点击地块", enclosureLand);
        // webViewRef.current?.postMessage(
        //   JSON.stringify({
        //     type: "SHOW_COMMON_DOT",
        //     data: enclosureLand?.gpsList,
        //   }),
        // );
        break;
      // 借点成功
      case "WEBVIEW_BORROW_DOT":
        if (data.point) {
          setPopupTips(data.message ?? "借点成功，请继续添加下一个点位");
          webViewRef.current?.postMessage(
            JSON.stringify({
              type: "DOT_MARKER",
              location: {lon: data.point.lon, lat: data.point.lat},
            }),
          );
        }

        break;
      // 控制台日志
      case "WEBVIEW_CONSOLE_LOG":
        console.log("WEBVIEW_CONSOLE_LOG", data);
        break;
      default:
        break;
    }
  };

  // 处理点变换消息提示
  const handleDotTotalChange = (data: MapWebviewMessage) => {
    switch (data.total) {
      case 0:
        setPopupTips("请点击打点按钮或十字光标打点");
        break;
      case 1:
        setPopupTips("请继续添加下一个点位");
        break;
      case 2:
        setPopupTips("已生成线段，请继续添加下一个点位");
        break;
      case 3:
        setPopupTips(data.message ? data.message : "已形成闭合区域，是否保存");
        break;
      default:
        setPopupTips(data.message ? data.message : "已形成闭合区域，是否保存");
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
        <View style={EnclosureScreenStyles.map} collapsable={false}>
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
          <TouchableOpacity style={[EnclosureScreenStyles.buttonBase, EnclosureScreenStyles.buttonSave]} onPress={onSave}>
            <Text style={[EnclosureScreenStyles.saveText, {color: dotTotal >= 3 ? "#08ae3c" : "#999"}]}>保存</Text>
          </TouchableOpacity>
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
        {/* 保存成功弹窗 */}
        <Popup
          visible={showSaveSuccessPopup}
          showIcon={true}
          showTitle={false}
          msgText="地块保存成功"
          leftBtnText="信息编辑"
          rightBtnText="继续圈地"
          onLeftBtn={() => {
            editEnclosureInfo();
          }}
          onRightBtn={() => {
            continueEnclosure();
          }}
        />
      </View>
      {/* loading弹窗 */}
      <CustomLoading visible={isSaving} text="地块保存中..." />
    </View>
  );
});

export default EnclosureScreen;
