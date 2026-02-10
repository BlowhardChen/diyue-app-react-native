// 地图切换器组件
import React, {useState, useEffect} from "react";
import {View, Text, Image, TouchableOpacity, Modal, ScrollView} from "react-native";
import {observer} from "mobx-react-lite";
import {mapStore} from "@/stores/mapStore";
import {MapSwitcherstyles} from "./styles/MapSwitcher";
import {showCustomToast} from "./CustomToast";
import CustomLayerPopup from "./CustomLayerPopup";

interface Props {
  onClose: () => void;
  onSelectMap: (params: {type: string; layerUrl: string}) => void;
}

const MapSwitcher: React.FC<Props> = observer(({onClose, onSelectMap}) => {
  const [mapCustomLayer, setMapCustomLayer] = useState("");
  const [customMapLayerList, setCustomMapLayerList] = useState<{layerName: string; layerUrl: string}[]>([
    {
      layerName: "自定义图层1",
      layerUrl: "https://yangge.life/maps/vt?lyrs=s&x={x}&y={y}&z={z}",
    },
    {
      layerName: "自定义图层2",
      layerUrl: "https://tugemap.site/maps/vt?lyrs=s&x={x}&y={y}&z={z}&src=app&scale=2&from=app",
    },
    {
      layerName: "自定义图层3",
      layerUrl: "https://map.tugemap.site/maps/vt?lyrs=s&x={x}&y={y}&z={z}&src=app&scale=2&from=app",
    },
  ]);
  const [showCustomLayerPopup, setShowCustomLayerPopup] = useState(false);

  useEffect(() => {
    setMapCustomLayer(mapStore.customMapLayer);
    // getCustomLayersList();
  }, []);

  // 选择地图
  const handleSelectMap = (type: string, layerUrl: string) => {
    if (type === "自定义") {
      onSelectMap({type, layerUrl});
      mapStore.setMapType("自定义");
      mapStore.setCustomMapType(layerUrl);
    } else {
      onSelectMap({type, layerUrl: ""});
      mapStore.setMapType(type);
    }
  };

  // 自定义图层管理
  const handleCustomLayerManage = () => {};

  // 手动添加自定义图层
  const handleAddCustomLayer = () => {
    setShowCustomLayerPopup(true);
  };

  // 扫码添加自定义图层
  const handleScanCustomLayer = () => {};

  // 关闭自定义图层弹窗
  const onCloseCustomLayerPopup = () => {
    setShowCustomLayerPopup(false);
  };

  // 获取自定义图层列表
  const getCustomLayersList = async () => {
    try {
      // const { data } = await customLayersList();
      // if (data?.length) {
      //   setCustomMapLayerList(data);
      // }
    } catch (error: any) {
      showCustomToast("error", error?.data?.message || "获取自定义图层列表失败");
    }
  };

  return (
    <Modal transparent={true} animationType="slide" onRequestClose={onClose}>
      {/* 遮罩层 */}
      <TouchableOpacity style={MapSwitcherstyles.overlay} activeOpacity={1} onPress={onClose} />

      <View style={MapSwitcherstyles.container}>
        {/* Header */}
        <View style={MapSwitcherstyles.header}>
          <Text style={MapSwitcherstyles.headerTitle}>图层</Text>
          <TouchableOpacity style={MapSwitcherstyles.headerClose} onPress={onClose}>
            <Image source={require("@/assets/images/home/icon-close.png")} style={MapSwitcherstyles.closeIcon} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={MapSwitcherstyles.customLayerManage} onPress={handleCustomLayerManage}>
          <Text style={MapSwitcherstyles.customLayerManageText}>自定义图层管理</Text>
          <Image source={require("@/assets/images/common/icon-right.png")} style={MapSwitcherstyles.closeIcon} />
        </TouchableOpacity>

        <ScrollView style={MapSwitcherstyles.mapContentContainer}>
          <View style={MapSwitcherstyles.mapItemContainer}>
            <TouchableOpacity style={MapSwitcherstyles.mapItem} onPress={() => handleSelectMap("标准地图", "")}>
              <Text style={[MapSwitcherstyles.mapItemText, mapStore.mapType === "标准地图" && MapSwitcherstyles.active]}>
                标准地图
              </Text>
              {mapStore.mapType === "标准地图" && (
                <Image source={require("@/assets/images/common/icon-city-checked.png")} style={MapSwitcherstyles.mapItemIcon} />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={MapSwitcherstyles.mapItem} onPress={() => handleSelectMap("卫星地图", "")}>
              <Text style={[MapSwitcherstyles.mapItemText, mapStore.mapType === "卫星地图" && MapSwitcherstyles.active]}>
                卫星地图
              </Text>
              {mapStore.mapType === "卫星地图" && (
                <Image source={require("@/assets/images/common/icon-city-checked.png")} style={MapSwitcherstyles.mapItemIcon} />
              )}
            </TouchableOpacity>
          </View>
          {customMapLayerList?.length > 0 && (
            <View>
              {customMapLayerList?.map(item => (
                <View style={MapSwitcherstyles.mapItemContainer}>
                  <TouchableOpacity
                    style={MapSwitcherstyles.mapItem}
                    key={item.layerUrl}
                    onPress={() => handleSelectMap("自定义", item.layerUrl)}>
                    <Text style={[MapSwitcherstyles.mapItemText, mapCustomLayer === item.layerUrl && MapSwitcherstyles.active]}>
                      {item.layerName}
                    </Text>
                    {mapStore.mapType === "自定义" && mapCustomLayer === item.layerUrl && (
                      <Image
                        source={require("@/assets/images/common/icon-city-checked.png")}
                        style={MapSwitcherstyles.mapItemIcon}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
        <View style={MapSwitcherstyles.buttonContainer}>
          <TouchableOpacity
            style={[MapSwitcherstyles.saveButton, {marginRight: 8, backgroundColor: "#F58700"}]}
            onPress={handleAddCustomLayer}>
            <Text style={MapSwitcherstyles.saveText}>手动添加</Text>
          </TouchableOpacity>
          <TouchableOpacity style={MapSwitcherstyles.saveButton} onPress={handleScanCustomLayer}>
            <Text style={MapSwitcherstyles.saveText}>扫码添加</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 自定义图层弹窗 */}
      {showCustomLayerPopup && (
        <CustomLayerPopup rightBtnText="添加" onLeftBtn={onCloseCustomLayerPopup} onRightBtn={handleAddCustomLayer} />
      )}
    </Modal>
  );
});

export default MapSwitcher;
