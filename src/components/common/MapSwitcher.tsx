// 地图切换器组件
import React, {useState, useEffect} from "react";
import {View, Text, Image, TouchableOpacity, Modal, ScrollView} from "react-native";
import {observer} from "mobx-react-lite";
import {mapStore} from "@/stores/mapStore";
import {MapSwitcherstyles} from "./styles/MapSwitcher";
import {showCustomToast} from "./CustomToast";
import CustomLayerPopup from "./CustomLayerPopup";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import {RootStackParamList} from "@/types/navigation";
import {addCustomLayer, getCustomLayersList} from "@/services/land";
import {debounce} from "lodash";

interface Props {
  onClose: () => void;
  onSelectMap: (params: {type: string; layerUrl: string}) => void;
}

const MapSwitcher: React.FC<Props> = observer(({onClose, onSelectMap}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [mapCustomLayer, setMapCustomLayer] = useState("");
  const [customMapLayerList, setCustomMapLayerList] = useState<{name: string; url: string}[]>([]);
  const [showCustomLayerPopup, setShowCustomLayerPopup] = useState(false);

  useEffect(() => {
    setMapCustomLayer(mapStore.customMapLayer);
  }, [mapStore.mapType, mapStore.customMapLayer]);

  useEffect(() => {
    getCustomLayersListData();
  }, []);

  // 选择地图
  const handleSelectMap = (type: string, url: string) => {
    if (type === "自定义") {
      mapStore.setMapType("自定义");
      mapStore.setCustomMapType(url);
      setMapCustomLayer(url);
      onClose();
    } else {
      mapStore.setMapType(type);
      setMapCustomLayer(""); // 重置自定义图层高亮
      onSelectMap({type, layerUrl: ""});
    }
  };

  // 自定义图层管理
  const handleCustomLayerManage = () => {
    onClose();
    navigation.navigate("CustomLayer");
  };

  // 手动添加自定义图层
  const handleAddCustomLayer = () => {
    setShowCustomLayerPopup(true);
  };

  // 添加自定义图层
  const addCustomLayerFun = debounce(async (name: string, url: string) => {
    try {
      await addCustomLayer({name: name, url: url});
      setCustomMapLayerList([...customMapLayerList, {name, url}]);
      setShowCustomLayerPopup(false);
    } catch (error: any) {
      showCustomToast("error", error?.data?.message || "添加自定义图层失败");
    } finally {
      setShowCustomLayerPopup(false);
    }
  }, 300);

  // 扫码添加自定义图层
  const handleScanCustomLayer = () => {
    onClose();
    navigation.navigate("ScanAddCustomLayer");
  };

  // 关闭自定义图层弹窗
  const onCloseCustomLayerPopup = () => {
    setShowCustomLayerPopup(false);
  };

  // 获取自定义图层列表
  const getCustomLayersListData = async () => {
    try {
      const {data} = await getCustomLayersList({});
      console.log("自定义图层列表", data);
      if (data?.length) {
        setCustomMapLayerList([...customMapLayerList, ...data]);
      }
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
              {customMapLayerList?.map((item, index) => (
                <View style={MapSwitcherstyles.mapItemContainer} key={`customLayer_${index}`}>
                  <TouchableOpacity style={MapSwitcherstyles.mapItem} onPress={() => handleSelectMap("自定义", item.url)}>
                    <Text
                      style={[
                        MapSwitcherstyles.mapItemText,
                        mapStore.mapType === "自定义" && mapCustomLayer === item.url && MapSwitcherstyles.active,
                      ]}>
                      {item.name}
                    </Text>
                    {mapStore.mapType === "自定义" && mapCustomLayer === item.url && (
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
        <CustomLayerPopup rightBtnText="添加" onLeftBtn={onCloseCustomLayerPopup} onRightBtn={addCustomLayerFun} />
      )}
    </Modal>
  );
});

export default MapSwitcher;
