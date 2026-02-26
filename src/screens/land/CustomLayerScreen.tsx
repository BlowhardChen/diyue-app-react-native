// 自定义图层
import CustomLayerPopup from "@/components/common/CustomLayerPopup";
import CustomStatusBar from "@/components/common/CustomStatusBar";
import {showCustomToast} from "@/components/common/CustomToast";
import Popup from "@/components/common/Popup";
import {deleteCustomLayer, getCustomLayersList} from "@/services/land";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import {debounce} from "lodash";
import React, {useEffect} from "react";
import {useState} from "react";
import {StyleSheet} from "react-native";
import {View, Text, Image, TouchableOpacity} from "react-native";

type RootStackParamList = {
  Main: undefined;
  MyScreen: undefined;
  Login: undefined;
  EditPassword: {mobile: string};
  PersonalInfo: undefined;
};

const CustomLayerScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [isShowPopup, setShowPopup] = useState(false);
  const [showCustomLayerPopup, setShowCustomLayerPopup] = useState(false);
  const [customMapLayerList, setCustomMapLayerList] = useState<{name: string; url: string}[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<{name: string; url: string}>({
    name: "",
    url: "",
  });
  const [layerId, setLayerId] = useState("");

  useEffect(() => {
    getCustomLayersListData();
  }, []);

  // 关闭提示弹窗
  const closePopup = () => {
    setShowPopup(false);
  };

  // 确认提示弹窗
  const confirmPopup = debounce(async () => {
    try {
      await deleteCustomLayer(layerId);
      showCustomToast("success", "自定义图层删除成功");
      getCustomLayersListData();
      setShowPopup(false);
    } catch (error: any) {
      showCustomToast("error", error?.data?.message || "自定义图层删除失败");
    }
  }, 300);

  // 编辑图层
  const editLayer = (item: {id: string; name: string; url: string}) => {
    console.log("编辑图层", item);
    if ([15, 16, 17].includes(Number(item.id))) {
      showCustomToast("error", "默认自定义图层不允许编辑");
      return;
    }
    setSelectedLayer(item);
    setShowCustomLayerPopup(true);
  };

  // 删除图层
  const deleteLayer = (item: any) => {
    if ([15, 16, 17].includes(Number(item.id))) {
      showCustomToast("error", "默认自定义图层不允许删除");
      return;
    }
    setLayerId(item.id);
    setShowPopup(true);
  };

  // 关闭自定义图层弹窗
  const onCloseCustomLayerPopup = () => {
    setShowCustomLayerPopup(false);
  };

  // 自定义图层确认
  const handleConfirmCustomLayer = debounce(async () => {
    try {
      showCustomToast("success", "自定义图层修改成功");
      setShowCustomLayerPopup(false);
      getCustomLayersListData();
    } catch (error: any) {
      showCustomToast("error", error?.data?.message || "自定义图层修改失败");
    } finally {
      setShowCustomLayerPopup(false);
    }
  }, 300);

  // 获取自定义图层列表
  const getCustomLayersListData = async () => {
    try {
      const {data} = await getCustomLayersList({});
      console.log("自定义图层列表", data);
      setCustomMapLayerList(data || []);
    } catch (error: any) {
      showCustomToast("error", error?.data?.message || "获取自定义图层列表失败");
    }
  };

  // 渲染自定义图层列表项
  const renderLayerListItem = (item: any, index: number) => {
    return (
      <View style={styles.settingListItemContent} key={`item_${index}`}>
        <View style={styles.settingListItem}>
          <Text style={styles.itemText}>{item.name}</Text>
          <View style={styles.arrowIconContainer}>
            <TouchableOpacity onPress={() => editLayer(item)}>
              <Image source={require("@/assets/images/common/icon-edit-grey.png")} style={styles.arrowIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteLayer(item)}>
              <Image source={require("@/assets/images/common/icon-delete.png")} style={[styles.arrowIcon, {marginLeft: 12}]} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.typeItemDivider} />
      </View>
    );
  };

  return (
    <>
      <Popup
        visible={isShowPopup}
        title="提示"
        msgText="请确认是否删除该图层"
        leftBtnText="取消"
        rightBtnText="删除"
        rightBtnStyle={{color: "#FF3D3B"}}
        onLeftBtn={closePopup}
        onRightBtn={confirmPopup}
      />
      {/* 自定义图层弹窗 */}
      {showCustomLayerPopup && (
        <CustomLayerPopup
          rightBtnText="确定修改"
          layerNameProp={selectedLayer.name}
          layerUrlProp={selectedLayer.url}
          onLeftBtn={onCloseCustomLayerPopup}
          onRightBtn={handleConfirmCustomLayer}
        />
      )}
      <CustomStatusBar navTitle="自定义图层" onBack={() => navigation.goBack()} />
      {customMapLayerList.length > 0 ? (
        <View style={styles.settingList}>{customMapLayerList.map((item, index) => renderLayerListItem(item, index))}</View>
      ) : (
        <View style={styles.noDataContainer}>
          <Image source={require("@/assets/images/common/contract-empty.png")} style={styles.noDataIcon} resizeMode="contain" />
          <Text style={styles.noDataText}>暂无数据</Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  settingList: {
    width: "100%",
    backgroundColor: "#F5F5F5",
    marginTop: 10,
  },
  settingListItemContent: {
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  settingListItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    backgroundColor: "#fff",
  },
  itemText: {
    fontWeight: "500",
    fontSize: 18,
    color: "#000000",
  },
  arrowIconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  arrowIcon: {
    width: 26,
    height: 26,
  },
  typeItemDivider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#D6D6D6",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataIcon: {
    width: 86,
    height: 84,
  },
  noDataText: {
    marginTop: 12,
    fontSize: 18,
    color: "#000",
  },
});

export default CustomLayerScreen;
