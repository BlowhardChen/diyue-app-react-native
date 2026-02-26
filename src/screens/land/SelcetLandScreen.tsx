// 选择地块
import {View, Text, TouchableOpacity, Image, ScrollView, Platform, StyleSheet} from "react-native";
import {EnclosureScreenStyles} from "./styles/EnclosureScreen";
import {useEffect, useRef, useState} from "react";
import {observer} from "mobx-react-lite";
import {mapStore} from "@/stores/mapStore";
import MapControlButton from "@/components/land/MapControlButton";
import MapSwitcher from "@/components/common/MapSwitcher";
import PermissionPopup from "@/components/common/PermissionPopup";
import WebView from "react-native-webview";
import Geolocation from "@react-native-community/geolocation";
import useOptimizedHeading from "@/hooks/useOptimizedHeading";
import KeepAwake from "react-native-keep-awake";
import {useNavigation} from "@react-navigation/native";
import {checkLocationPermission, requestLocationPermission} from "@/utils/checkPermissions";
import {showCustomToast} from "@/components/common/CustomToast";
import {LandListData, MapWebviewMessage} from "@/types/land";
import {getLandListData} from "@/services/land";
import {SelectLandScreenStyles} from "./styles/SelectLandScreen";
import SelectLandListItem from "@/components/land/SelectLandListItem";
import LinearGradient from "react-native-linear-gradient";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import LandOperationPopup from "@/components/land/LandOperationPopup";
import {Global} from "@/styles/global";
import {updateStore} from "@/stores/updateStore";

interface landListInfoItem extends LandListData {
  isSelect: boolean;
}

type SelectLandRouteParams = {
  type: string;
  farmingTypeId?: string;
  lands?: LandListData[];
  onSelectLandResult: (result: LandListData[]) => void;
  landRequest?: () => Promise<LandListData[]>;
};

const SelectLandScreen = observer(({route}: {route: {params: SelectLandRouteParams}}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [popupTips, setPopupTips] = useState("请点击打点按钮打点或点击十字光标标点");
  const [showMapSwitcher, setShowMapSwitcher] = useState(false);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const isFirstLocationRef = useRef(true);
  const [isShowCheckLandList, setIsShowCheckLandList] = useState(false);
  const [isCheckedAll, setIsCheckedAll] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0); // 已选数量
  const [totalArea, setTotalArea] = useState(0); // 总面积
  const [landListInfo, setLandListInfo] = useState<landListInfoItem[] | []>([]);
  const [operationVisible, setOperationVisible] = useState(false);
  const [selectedLandInfo, setSelectedLandInfo] = useState<landListInfoItem[] | []>([]);
  const [mergeCoordinates, setMergeCoordinates] = useState<{lat: number; lng: number}[]>([]);
  const [mergeArea, setMergeArea] = useState(0);

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

  // 获取地块数据
  useEffect(() => {
    getLandInfoData();
  }, [updateStore.isUpdateLand]);

  // 监听landListInfo变化，更新全选状态和已选数量
  useEffect(() => {
    if (landListInfo.length === 0) {
      setIsCheckedAll(false);
      setSelectedLandInfo([]);
      return;
    }
    // 检查所有项的isSelect是否都为true
    const allSelected = landListInfo.every(item => item.isSelect);
    setIsCheckedAll(allSelected);
    // 监听 landListInfo 变化，自动更新 selectedLandInfo
    const selectedLands = landListInfo.filter(item => item.isSelect);
    setSelectedLandInfo(selectedLands);
  }, [landListInfo]);

  useEffect(() => {
    if (!route.params.type) return;
    switch (route.params.type) {
      case "merge":
        setPopupTips("请选择需要合并的地块");
        break;
      case "transfer":
        setPopupTips("请选择需要转移的地块");
        break;
      case "select":
        setPopupTips("请选择需要选择的地块");
        break;
      case "farming":
        setPopupTips("请选择农事地块");
        break;
      default:
        setPopupTips("请选择需要操作的地块");
        break;
    }
  }, [route.params.type]);

  // 当WebView准备好时，应用保存的地图类型
  useEffect(() => {
    if (isWebViewReady) {
      applySavedMapType();
      getLandInfoData();
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

  // 全选
  const onCheckAll = () => {
    const newCheckedState = !isCheckedAll;
    // 更新本地所有地块的选中状态
    const updatedLandList = landListInfo.map(item => ({...item, isSelect: newCheckedState}));
    setLandListInfo(updatedLandList);

    // 更新已选数量和总面积
    setSelectedCount(newCheckedState ? updatedLandList.length : 0);
    if (!newCheckedState) {
      setTotalArea(0);
    } else {
      const total = updatedLandList.reduce((acc, cur) => acc + cur.actualAcreNum, 0);
      setTotalArea(Number(total.toFixed(2)));
    }
    // 向 WebView 发送批量更新选中状态的消息
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "UPDATE_ALL_LAND_SELECTION",
        data: updatedLandList, // 传递所有地块的最新状态
      }),
    );
  };

  // 打开地块列表
  const onOpenCheckLand = () => {
    setIsShowCheckLandList(!isShowCheckLandList);
  };

  // 选中地块
  const onSeletLand = (item: landListInfoItem) => {
    updateLocalSelectState(item);
  };

  // 更新单个地块的本地选中状态
  const updateLocalSelectState = (item: landListInfoItem) => {
    // 切换该地块的选中状态
    const newSelectState = !item.isSelect;
    const updatedLandList = landListInfo.map(land => (land.id === item.id ? {...land, isSelect: newSelectState} : land));
    setLandListInfo(updatedLandList);

    // 更新已选数量和总面积
    const selectedItems = updatedLandList.filter(land => land.isSelect);
    setSelectedCount(selectedItems.length);
    const totalArea = selectedItems.reduce((acc, cur) => acc + cur.actualAcreNum, 0);
    setTotalArea(Number(totalArea.toFixed(2)));

    // 向 WebView 发送该地块的状态更新
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "UPDATE_LAND_SELECTION",
        id: item.id,
        isSelected: newSelectState,
      }),
    );

    // 同步全选框状态：判断所有地块是否都已选中
    const allSelected = updatedLandList.every(land => land.isSelect);
    setIsCheckedAll(allSelected);
  };

  // 地块操作
  const onLandOperation = () => {
    if (!selectedCount) return;
    switch (route.params.type) {
      case "merge":
        // 移除选中地块
        removeSelectedLands(selectedLandInfo);
        // 绘制合并地块
        webViewRef.current?.postMessage(
          JSON.stringify({
            type: "DRAW_MERGE_LAND",
            data: selectedLandInfo,
          }),
        );
        break;
      case "transfer":
        setOperationVisible(true);
        break;
      case "select":
        if (route.params.onSelectLandResult) {
          route.params.onSelectLandResult(selectedLandInfo);
          navigation.goBack();
        }
        break;
      case "farming":
        if (route.params.onSelectLandResult) {
          route.params.onSelectLandResult(selectedLandInfo);
          navigation.goBack();
        }
        break;
      default:
        showCustomToast("error", "请选择操作类型");
        break;
    }
  };

  // 移除选中地块
  const removeSelectedLands = (selectedLands?: landListInfoItem[]) => {
    console.log("移除选中地块:", selectedLands);
    if (!selectedLands) return;
    selectedLands.forEach(item => {
      webViewRef.current?.postMessage(
        JSON.stringify({
          type: "REMOVE_SPECIFY_LAND",
          data: item,
        }),
      );
    });
  };

  // 地块操作成功回调
  const handleOperationSuccess = (type: string, selectedLands?: landListInfoItem[]) => {
    setOperationVisible(false);
    showCustomToast("success", `${type === "merge" ? "合并" : "转移"}地块成功`);
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "REMOVE_MERGE_LAND",
      }),
    );
    if (type === "transfer") {
      removeSelectedLands(selectedLands);
    }
  };

  // 地块操作失败回调
  const handleOperationError = (type: string) => {
    console.log("操作失败:", type);
    setOperationVisible(false);
    showCustomToast("error", `${type === "merge" ? "合并" : "转移"}地块失败，请稍后重试`);
  };

  // 关闭操作弹窗
  const closeOperationPopup = (type: string) => {
    setOperationVisible(false);
    if (type === "merge") {
      // 移除合并地块
      webViewRef.current?.postMessage(
        JSON.stringify({
          type: "REMOVE_MERGE_LAND",
        }),
      );
      // 重新绘制原始地块
      webViewRef.current?.postMessage(
        JSON.stringify({
          type: "DRAW_LAND_SELECTION",
          data: landListInfo,
        }),
      );
    }
  };

  // 获取地块数据
  const getLandInfoData = async () => {
    try {
      const routeLands = route.params.lands || [];
      const routeLandIds = new Set(routeLands.map(item => item.id));

      let landData: LandListData[] = [];
      if (route.params.type === "farming" && route.params.landRequest) {
        landData = await route.params.landRequest();
      } else {
        const {data} = await getLandListData({quitStatus: "0"});
        landData = data || [];
      }

      const processedLandData = landData.map((item: LandListData) => ({
        ...item,
        isSelect: routeLandIds.has(item.id),
      }));

      const selectedItems = processedLandData.filter((item: {isSelect: any}) => item.isSelect);
      setSelectedCount(selectedItems.length);

      const totalAcreage = selectedItems.reduce((acc: any, cur: {actualAcreNum: any}) => acc + (cur.actualAcreNum || 0), 0);
      setTotalArea(Number(totalAcreage.toFixed(2)));

      setIsCheckedAll(processedLandData.length > 0 && selectedItems.length === processedLandData.length);

      setLandListInfo(processedLandData);

      webViewRef.current?.postMessage(
        JSON.stringify({
          type: "DRAW_LAND_SELECTION",
          data: processedLandData,
        }),
      );
    } catch (error) {
      showCustomToast("error", "获取地块数据失败，请稍后重试");
      console.error("获取地块数据异常:", error);
    }
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
          locateDevicePosition(true);
        }
        break;
      // 报错处理
      case "WEBVIEW_ERROR":
        showCustomToast("error", data.message ?? "操作失败");
        break;
      // 点击地块
      case "POLYGON_CLICK":
        let selectedLand = landListInfo.find(item => item.id === data.id) as landListInfoItem;
        updateLocalSelectState(selectedLand);
        break;
      case "DRAW_MERGED_LAND_COORDINATES":
        setOperationVisible(true);
        let coordinates: {lat: number; lng: number}[] = [];
        if (data.mergeCoordinates) {
          coordinates = data.mergeCoordinates.map(item => ({lat: item[1], lng: item[0]}));
        }
        setMergeCoordinates(coordinates || []);
        setMergeArea(data.mergeArea || 0);
        break;
      // 控制台日志
      case "WEBVIEW_CONSOLE_LOG":
        console.log("WEBVIEW_CONSOLE_LOG", data);
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
      <LinearGradient style={[styles.headerContainer, {paddingTop: insets.top}]} colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0)"]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconWrapper} onPress={() => navigation.goBack()}>
            <Image source={require("@/assets/images/common/icon-back-radius.png")} style={styles.iconImage} />
          </TouchableOpacity>
          <Text style={styles.title}>批量选择地块</Text>
          <View style={styles.iconWrapper} />
        </View>
      </LinearGradient>
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
            <Image source={require("@/assets/images/home/icon-td.png")} style={EnclosureScreenStyles.iconImg} />
            <Text style={EnclosureScreenStyles.copyrightText}>
              ©地理信息公共服务平台（天地图）GS（2024）0568号-甲测资字1100471
            </Text>
          </View>
        </View>
        {/* 地块类型图标 */}
        <View style={EnclosureScreenStyles.landType}>
          <View style={EnclosureScreenStyles.landTypeItem}>
            <Image source={require("@/assets/images/home/icon-green.png")} style={EnclosureScreenStyles.icon} />
            <Text style={EnclosureScreenStyles.text}>流转</Text>
          </View>

          <View style={EnclosureScreenStyles.landTypeItem}>
            <Image source={require("@/assets/images/home/icon-blue.png")} style={EnclosureScreenStyles.icon} />
            <Text style={EnclosureScreenStyles.text}>托管</Text>
          </View>
        </View>
        {/* 右侧控制按钮 */}
        <View style={EnclosureScreenStyles.rightControl}>
          <MapControlButton iconUrl={require("@/assets/images/home/icon-layer.png")} iconName="图层" onPress={onToggleMapLayer} />
        </View>
        <View style={EnclosureScreenStyles.locationControl}>
          <MapControlButton
            iconUrl={require("@/assets/images/home/icon-location.png")}
            iconName="定位"
            onPress={onLocatePosition}
            style={{marginTop: 16}}
          />
        </View>
        {/* 选中地块列表 */}
        {isShowCheckLandList ? (
          <View style={SelectLandScreenStyles.landListContainer}>
            <ScrollView style={[SelectLandScreenStyles.landListBox, {height: 460}]}>
              {landListInfo.map((item: any) => (
                <SelectLandListItem key={item.id} landListInfoItem={item} onSeletLand={onSeletLand} />
              ))}
            </ScrollView>
          </View>
        ) : null}
        {/* 底部按钮 */}
        <View style={SelectLandScreenStyles.checkContainer}>
          <View style={SelectLandScreenStyles.checkBottomContainer}>
            <View style={SelectLandScreenStyles.checkButtonContainer}>
              <TouchableOpacity onPress={onCheckAll}>
                <Image
                  source={
                    isCheckedAll
                      ? require("@/assets/images/home/icon-check-active.png")
                      : require("@/assets/images/home/icon-check.png")
                  }
                  style={SelectLandScreenStyles.checkIcon}
                />
              </TouchableOpacity>
              <Text>全选</Text>
            </View>
            <View style={SelectLandScreenStyles.checkTextContainer}>
              <View style={SelectLandScreenStyles.checkText}>
                <Text>已选</Text>
                <Text style={SelectLandScreenStyles.checkTextNumber}>{selectedCount}</Text>
                <Text>个，</Text>
                <Text>共计</Text>
                <Text style={SelectLandScreenStyles.checkTextNumber}>{totalArea}</Text>
                <Text>亩</Text>
              </View>
              <TouchableOpacity onPress={onOpenCheckLand}>
                <Image
                  source={
                    isShowCheckLandList
                      ? require("@/assets/images/common/icon-bottom.png")
                      : require("@/assets/images/common/icon-top.png")
                  }
                  style={SelectLandScreenStyles.checkTextIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={[
              SelectLandScreenStyles.manageButtonContainer,
              selectedCount ? {backgroundColor: Global.colors.primary} : {backgroundColor: "rgba(8,174,60,.6)"},
            ]}
            onPress={onLandOperation}>
            <View style={SelectLandScreenStyles.manageButtonTextContainer}>
              <Text style={SelectLandScreenStyles.manageButtonText}>
                {route.params.type === "merge" ? "合并" : route.params.type === "transfer" ? "转移" : "确定"}
              </Text>
              <Text style={SelectLandScreenStyles.manageButtonText}>{selectedCount ? `(${selectedCount})` : ""}</Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* 图层切换弹窗 */}
        {showMapSwitcher && <MapSwitcher onClose={() => setShowMapSwitcher(false)} onSelectMap={handleSelectMap} />}
        {/* 地块操作弹窗 */}
        {operationVisible && (
          <LandOperationPopup
            selectedLands={selectedLandInfo}
            operationType={route.params.type}
            coordinates={mergeCoordinates}
            acreageNum={mergeArea}
            onOperationSuccess={handleOperationSuccess}
            onOperationError={handleOperationError}
            onClose={closeOperationPopup}
          />
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapBox: {flex: 1},
  rightControl: {
    position: "absolute",
    top: 100,
    right: 16,
  },
  locationControl: {
    position: "absolute",
    top: 240,
    right: 16,
  },
  map: {flex: 1},
  mapCopyright: {position: "absolute", bottom: 0, left: 0, flexDirection: "row", alignItems: "flex-end"},
  iconImg: {width: 40, height: 20},
  copyrightText: {fontSize: 8, color: "#fff"},
  headerContainer: {
    position: "absolute",
    top: 0,
    width: "100%",
    zIndex: 999,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: Platform.OS === "ios" ? 44 : 56,
  },
  title: {
    fontSize: 20,
    color: "#fff",
  },
  iconWrapper: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  iconImage: {
    width: 38,
    height: 38,
    resizeMode: "contain",
  },
});

export default SelectLandScreen;
