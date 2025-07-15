import React, {useState, useEffect} from "react";
import {View, Text, Image, TextInput, TouchableOpacity} from "react-native";
import {observer} from "mobx-react-lite";
import {mapStore} from "@/stores/mapStore";
import {styles} from "./styles/MapSwitcher";

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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{isShowDiyMapLayer ? "自定义图层" : "图层"}</Text>
        <TouchableOpacity style={styles.headerClose} onPress={onClose}>
          <Image source={clonseIconUrl} style={styles.closeIcon} />
        </TouchableOpacity>
      </View>

      {/* 地图类型选择 */}
      {!isShowDiyMapLayer ? (
        <View style={styles.mapContent}>
          {/* 标准地图 */}
          <TouchableOpacity style={styles.mapItem} onPress={() => handleSelectMap("标准地图")}>
            <Image source={mapStore.mapType === "标准地图" ? normMapImgActive : normMapImg} style={styles.mapImage} />
            <Text style={[styles.mapTitle, mapStore.mapType === "标准地图" && styles.active]}>标准地图</Text>
          </TouchableOpacity>

          {/* 卫星地图 */}
          <TouchableOpacity style={styles.mapItem} onPress={() => handleSelectMap("卫星地图")}>
            <Image source={mapStore.mapType === "卫星地图" ? satelliteMapImgActive : satelliteMapImg} style={styles.mapImage} />
            <Text style={[styles.mapTitle, mapStore.mapType === "卫星地图" && styles.active]}>卫星地图</Text>
          </TouchableOpacity>

          {/* 自定义地图 */}
          <TouchableOpacity style={styles.mapItem} onPress={() => handleSelectMap("自定义")}>
            <Image source={mapStore.mapType === "自定义" ? divMapImgActive : divMapImg} style={styles.mapImage} />
            <View style={{alignItems: "center"}}>
              <Text style={[styles.mapTitle, mapStore.mapType === "自定义" && styles.active]}>自定义地图</Text>
              <TouchableOpacity onPress={() => setIsShowDiyMapLayer(true)}>
                <Text style={styles.editTip}>点击编辑地图源</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.customLayerBox}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={mapDivLayer}
              onChangeText={setMapDivLayer}
              placeholder="请输入自定义地图地址"
            />
            {mapDivLayer.length > 0 && (
              <TouchableOpacity onPress={() => setMapDivLayer("")}>
                <Image source={closeInputIcon} style={styles.clearIcon} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              style={[styles.saveButton, {opacity: mapDivLayer ? 1 : 0.5}]}
              disabled={!mapDivLayer}
              onPress={saveCustomLayer}>
              <Text style={styles.saveText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
});

export default MapSwitcher;
