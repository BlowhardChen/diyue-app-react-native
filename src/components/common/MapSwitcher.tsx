// 地图切换器组件
import React, {useState, useEffect} from "react";
import {View, Text, Image, TextInput, TouchableOpacity, Modal, StyleSheet, Dimensions} from "react-native";
import {observer} from "mobx-react-lite";
import {mapStore} from "@/stores/mapStore";
import {MapSwitcherstyles} from "./styles/MapSwitcher";

const {width} = Dimensions.get("window");
const clonseIconUrl = require("@/assets/images/home/icon-close.png");
const normMapImg = require("@/assets/images/home/map-norm.png");
const normMapImgActive = require("@/assets/images/home/map-norm-active.png");
const satelliteMapImg = require("@/assets/images/home/map-satellite.png");
const satelliteMapImgActive = require("@/assets/images/home/map-satellite-active.png");
const divMapImg = require("@/assets/images/home/map-diy.png");
const divMapImgActive = require("@/assets/images/home/map-diy-active.png");
const closeInputIcon = require("@/assets/images/farming/icon-close.png");

interface Props {
  onClose: () => void;
  onSelectMap: (params: {type: string; layerUrl: string}) => void;
}

const MapSwitcher: React.FC<Props> = observer(({onClose, onSelectMap}) => {
  const [isShowDiyMapLayer, setIsShowDiyMapLayer] = useState(false);
  const [mapDivLayer, setMapDivLayer] = useState("");

  useEffect(() => {
    setMapDivLayer(mapStore.customMapLayer);
  }, []);

  const handleSelectMap = (type: string) => {
    if (type === "自定义") {
      onSelectMap({type, layerUrl: mapDivLayer});
      mapStore.setMapType("自定义");
      mapStore.setCustomMapType(mapDivLayer);
    } else {
      onSelectMap({type, layerUrl: ""});
      mapStore.setMapType(type);
    }
  };

  const saveCustomLayer = () => {
    if (!mapDivLayer) return;
    setIsShowDiyMapLayer(false);
    handleSelectMap("自定义");
  };

  return (
    <Modal transparent={true} animationType="slide" onRequestClose={onClose}>
      {/* 遮罩层 */}
      <TouchableOpacity style={MapSwitcherstyles.overlay} activeOpacity={1} onPress={onClose} />

      <View style={MapSwitcherstyles.container}>
        {/* Header */}
        <View style={MapSwitcherstyles.header}>
          <Text style={MapSwitcherstyles.headerTitle}>{isShowDiyMapLayer ? "自定义图层" : "图层"}</Text>
          <TouchableOpacity style={MapSwitcherstyles.headerClose} onPress={onClose}>
            <Image source={clonseIconUrl} style={MapSwitcherstyles.closeIcon} />
          </TouchableOpacity>
        </View>

        {/* 地图类型选择 */}
        {!isShowDiyMapLayer ? (
          <View style={MapSwitcherstyles.mapContent}>
            {/* 标准地图 */}
            <TouchableOpacity style={MapSwitcherstyles.mapItem} onPress={() => handleSelectMap("标准地图")}>
              <Image
                source={mapStore.mapType === "标准地图" ? normMapImgActive : normMapImg}
                style={MapSwitcherstyles.mapImage}
              />
              <Text style={[MapSwitcherstyles.mapTitle, mapStore.mapType === "标准地图" && MapSwitcherstyles.active]}>
                标准地图
              </Text>
            </TouchableOpacity>

            {/* 卫星地图 */}
            <TouchableOpacity style={MapSwitcherstyles.mapItem} onPress={() => handleSelectMap("卫星地图")}>
              <Image
                source={mapStore.mapType === "卫星地图" ? satelliteMapImgActive : satelliteMapImg}
                style={MapSwitcherstyles.mapImage}
              />
              <Text style={[MapSwitcherstyles.mapTitle, mapStore.mapType === "卫星地图" && MapSwitcherstyles.active]}>
                卫星地图
              </Text>
            </TouchableOpacity>

            {/* 自定义地图 */}
            <TouchableOpacity style={MapSwitcherstyles.mapItem} onPress={() => handleSelectMap("自定义")}>
              <Image source={mapStore.mapType === "自定义" ? divMapImgActive : divMapImg} style={MapSwitcherstyles.mapImage} />
              <View style={{alignItems: "center"}}>
                <Text style={[MapSwitcherstyles.mapTitle, mapStore.mapType === "自定义" && MapSwitcherstyles.active]}>
                  自定义地图
                </Text>
                <TouchableOpacity onPress={() => setIsShowDiyMapLayer(true)}>
                  <Text style={MapSwitcherstyles.editTip}>点击编辑地图源</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={MapSwitcherstyles.customLayerBox}>
            <View style={MapSwitcherstyles.inputWrapper}>
              <TextInput
                style={MapSwitcherstyles.input}
                value={mapDivLayer}
                onChangeText={setMapDivLayer}
                placeholder="请输入自定义地图地址"
              />
              {mapDivLayer.length > 0 && (
                <TouchableOpacity onPress={() => setMapDivLayer("")}>
                  <Image source={closeInputIcon} style={MapSwitcherstyles.clearIcon} />
                </TouchableOpacity>
              )}
            </View>
            <View style={MapSwitcherstyles.buttonWrapper}>
              <TouchableOpacity
                style={[MapSwitcherstyles.saveButton, {opacity: mapDivLayer ? 1 : 0.5}]}
                disabled={!mapDivLayer}
                onPress={saveCustomLayer}>
                <Text style={MapSwitcherstyles.saveText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
});

export default MapSwitcher;
