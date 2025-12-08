// 新增农事
import {View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Modal, ScrollView, TextInput} from "react-native";
import {FarmStackParamList} from "@/types/navigation";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import CustomStatusBar from "@/components/common/CustomStatusBar";
import {useCallback, useEffect, useMemo, useState} from "react";
import FarmTimePicker from "./components/FarmTimePicker";
import PopupBottom from "@/components/common/PopupBottom";
import {
  addFarming,
  deleteFarming,
  editFarming,
  farmingDetailInfo,
  farmingScientceList,
  farmingTypeList,
} from "@/services/farming";
import {dictDataList} from "@/services/common";
import Popup from "@/components/common/Popup";
import {AddFarmingParams} from "@/types/farming";

// 类型定义
interface DictDataListItem {
  dictLabel: string;
  dictValue: string;
}

// 农事类型列表item
interface FarmTypeListItem {
  farmingTypeName: string;
  farmingTypeId: string;
}

// 农技方案列表item
interface FarmScientceListItem {
  farmingScienceId: string;
  farmingScienceName: string;
}

// 农事类型选择列表
interface FarmTypeListType {
  farmTypeName: string;
  icon: boolean;
  value?: string;
}
// 农事选择项
interface FarmSelect {
  farmCrop: {dictLabel: string; dictValue: string};
  farmType: {farmingScienceTypeName: string; farmingScienceTypeId: string};
  farmNorm: {farmingScienceName: string; farmingScienceId: string};
}

const {width: SCREEN_WIDTH} = Dimensions.get("window");

const AddFarmScreen = ({route}: {route: {params: {title?: string; farmingId?: string}}}) => {
  const navigation = useNavigation<StackNavigationProp<FarmStackParamList>>();
  const [navTitleType, setNavTitleType] = useState<string>("新建");
  const [farmIndex, setFarmIndex] = useState<number>(0);
  const [farmType, setFarmType] = useState<FarmTypeListType[]>([
    {farmTypeName: "农事作物", icon: true, value: ""},
    {farmTypeName: "农事类型", icon: true, value: ""},
    {farmTypeName: "技术标准", icon: true, value: ""},
  ]);
  const [farmLand, setFarmLand] = useState<FarmTypeListType[]>([
    {farmTypeName: "农事地块", icon: true, value: ""},
    {farmTypeName: "作业时间", icon: true, value: ""},
    {farmTypeName: "机耕队", icon: false, value: ""},
  ]);
  const [farmCropList, setFarmCropList] = useState<DictDataListItem[]>([]);
  const [farmTypeList, setFarmTypeList] = useState<FarmTypeListItem[]>([]);
  const [farmNormList, setFarmNormList] = useState<FarmScientceListItem[]>([]);
  const [farmParams, setFarmParams] = useState<AddFarmingParams>({
    farmingName: "",
    dictLabel: "",
    dictValue: "",
    totalArea: "",
    detailaddress: "",
    workBeginTime: "",
    workEndTime: "",
    teamMobile: "",
    farmingScienceId: "",
    farmingScienceName: "",
    farmingScienceTypeName: "",
    farmingScienceTypeId: "",
    farmingLands: [],
  });
  const [farmSelect, setFarmSelect] = useState<FarmSelect>({
    farmCrop: {dictLabel: "", dictValue: ""},
    farmType: {farmingScienceTypeName: "", farmingScienceTypeId: ""},
    farmNorm: {farmingScienceName: "", farmingScienceId: ""},
  });
  const [showFarmPopup, setShowFarmPopup] = useState({
    showFarmCrop: false,
    showFarmType: false,
    showFarmNorm: false,
    showTimePicker: false,
    showDeleteConfirm: false,
  });

  useEffect(() => {
    if (route.params && route.params.title) {
      setNavTitleType(route.params.title);
    }
  }, []);

  // 右侧按钮点击事件
  const handleRightPress = () => {
    if (navTitleType === "删除") {
    } else {
      return;
    }
  };

  const isFarmTypeComplete = useMemo(() => {
    return farmType.every(item => item.value);
  }, [farmType]);

  const isFarmLandComplete = useMemo(() => {
    return farmLand.every(item => item.value);
  }, [farmLand]);

  // 处理农事类型点击
  const handleFarmType = useCallback(
    (type: FarmTypeListType, index: number) => {
      setFarmIndex(index);
      switch (type.farmTypeName) {
        case "农事作物":
          setShowFarmPopup(prev => ({...prev, showFarmCrop: true}));
          break;
        case "农事类型":
          if (!farmSelect.farmCrop.dictLabel) {
            alert("请先选择农事作物");
            break;
          }
          setShowFarmPopup(prev => ({...prev, showFarmType: true}));
          getFarmTypeList();
          break;
        case "技术标准":
          if (!farmSelect.farmType.farmingScienceTypeName) {
            alert("请先选择农事类型");
            break;
          }
          setShowFarmPopup(prev => ({...prev, showFarmNorm: true}));
          getFarmNormList();
          break;
        default:
          break;
      }
    },
    [farmSelect],
  );

  // 处理农事地块等点击
  const handleFarmLand = useCallback(
    (type: FarmTypeListType, index: number) => {
      setFarmIndex(index);
      switch (type.farmTypeName) {
        case "农事地块":
          if (!farmSelect.farmType.farmingScienceTypeName) {
            alert("请先选择农事类型");
            break;
          }
          // navigation.navigate("SelectLand", {
          //   type: "select",
          //   title: "add",
          //   farmingTypeId: farmSelect.farmType.farmingScienceTypeId,
          //   farmCrop: farmSelect.farmCrop.dictValue,
          // });
          break;
        case "作业时间":
          setShowFarmPopup(prev => ({...prev, showTimePicker: true}));
          break;
        default:
          break;
      }
    },
    [farmSelect, navigation],
  );

  const closeFarmCropPopup = useCallback(() => {
    setShowFarmPopup(prev => ({...prev, showFarmCrop: false}));
  }, []);

  const closeFarmTypePopup = useCallback(() => {
    setShowFarmPopup(prev => ({...prev, showFarmType: false}));
  }, []);

  const closeFarmNormPopup = useCallback(() => {
    setShowFarmPopup(prev => ({...prev, showFarmNorm: false}));
  }, []);

  const closeTimePickerPopup = useCallback(
    (time: [string, string]) => {
      setShowFarmPopup(prev => ({...prev, showTimePicker: false}));
      if (time && time.length === 2) {
        setFarmLand(prev => {
          const newList = [...prev];
          newList[farmIndex].value = `${time[0]}~${time[1]}`;
          return newList;
        });
        setFarmParams(prev => ({
          ...prev,
          workBeginTime: time[0],
          workEndTime: time[1],
        }));
      }
    },
    [farmIndex],
  );

  // 选择农事作物
  const selectFarmCrop = useCallback(
    (crop: DictDataListItem) => {
      setFarmSelect(prev => ({
        ...prev,
        farmCrop: {dictLabel: crop.dictLabel, dictValue: crop.dictValue},
      }));
      setFarmType(prev => {
        const newList = [...prev];
        newList[farmIndex].value = crop.dictLabel;
        newList[1].value = "";
        newList[2].value = "";
        return newList;
      });
      closeFarmCropPopup();
    },
    [farmIndex, closeFarmCropPopup],
  );

  // 选择农事类型
  const selectFarmType = useCallback(
    (type: FarmTypeListItem) => {
      setFarmSelect(prev => ({
        ...prev,
        farmType: {
          farmingScienceTypeName: type.farmingTypeName,
          farmingScienceTypeId: type.farmingTypeId,
        },
      }));
      setFarmType(prev => {
        const newList = [...prev];
        newList[farmIndex].value = type.farmingTypeName;
        newList[2].value = "";
        return newList;
      });
      closeFarmTypePopup();
    },
    [farmIndex, closeFarmTypePopup],
  );

  // 选择技术标准
  const selectFarmNorm = useCallback(
    (norm: FarmScientceListItem) => {
      setFarmSelect(prev => ({
        ...prev,
        farmNorm: {
          farmingScienceId: norm.farmingScienceId,
          farmingScienceName: norm.farmingScienceName,
        },
      }));
      setFarmType(prev => {
        const newList = [...prev];
        newList[farmIndex].value = norm.farmingScienceName;
        return newList;
      });
      closeFarmNormPopup();
    },
    [farmIndex, closeFarmNormPopup],
  );

  // 查看技术标准
  const viewFarmNorm = useCallback((norm: FarmScientceListItem) => {
    // 待实现查看逻辑
  }, []);

  // 输入机耕队号码
  const inputTeamMobile = useCallback((text: string) => {
    setFarmParams(prev => ({...prev, teamMobile: text}));
    setFarmLand(prev => {
      const newList = [...prev];
      newList[2].value = text;
      return newList;
    });
  }, []);

  // 格式化参数
  const formatParams = useCallback(() => {
    setFarmParams(prev => ({
      ...prev,
      dictLabel: farmSelect.farmCrop.dictLabel,
      dictValue: farmSelect.farmCrop.dictValue,
      farmingScienceId: farmSelect.farmNorm.farmingScienceId,
      farmingScienceName: farmSelect.farmNorm.farmingScienceName,
      farmingScienceTypeId: farmSelect.farmType.farmingScienceTypeId,
      farmingScienceTypeName: farmSelect.farmType.farmingScienceTypeName,
      farmingName: `${farmSelect.farmCrop.dictLabel}-${farmType[1].value}`,
    }));
  }, [farmSelect, farmType]);

  // 保存农事
  const saveAddFarm = useCallback(async () => {
    formatParams();
    if (!isFarmTypeComplete || !isFarmLandComplete) {
      alert("当前有必填项尚未完成");
      return;
    }

    if (!route.params?.title || !route.params?.farmingId) return;

    try {
      const saveFunc =
        route.params?.title === "新建"
          ? addFarming(farmParams)
          : editFarming({farmingId: route.params?.farmingId as string, ...farmParams});
      await saveFunc;
      navigation.navigate("FarmMap");
    } catch (error) {
      console.error("保存失败:", error);
    }
  }, [
    route.params?.title,
    route.params?.farmingId,
    farmParams,
    isFarmTypeComplete,
    isFarmLandComplete,
    formatParams,
    navigation,
  ]);

  // 删除农事相关
  const deleteFarmFun = useCallback(() => {
    setShowFarmPopup(prev => ({...prev, showDeleteConfirm: true}));
  }, []);

  const closeFarmDeletePopup = useCallback(() => {
    setShowFarmPopup(prev => ({...prev, showDeleteConfirm: false}));
  }, []);

  const confirmDeleteFarm = useCallback(async () => {
    try {
      await deleteFarming({farmingId: route.params?.farmingId as string});
    } catch (error) {
      console.error("删除失败:", error);
    }
  }, [route.params?.farmingId, navigation]);

  // 获取农事作物列表
  const getFarmCropList = useCallback(async () => {
    try {
      const {data} = await dictDataList({dictType: "farm_crops_type"});
      setFarmCropList(data);
    } catch (error) {
      console.error("获取农事作物失败:", error);
    }
  }, []);

  // 获取农事类型列表
  const getFarmTypeList = useCallback(async () => {
    try {
      const {data} = await farmingTypeList({
        dictValue: farmSelect.farmCrop.dictValue,
      });
      setFarmTypeList(data);
    } catch (error) {
      console.error("获取农事类型失败:", error);
    }
  }, [farmSelect.farmCrop.dictValue]);

  // 获取技术标准列表
  const getFarmNormList = useCallback(async () => {
    try {
      const {data} = await farmingScientceList({
        dictValue: farmSelect.farmCrop.dictValue,
        farmingTypeId: farmSelect.farmType.farmingScienceTypeId,
      });
      setFarmNormList(data);
    } catch (error) {
      console.error("获取技术标准失败:", error);
    }
  }, [farmSelect.farmCrop.dictValue, farmSelect.farmType.farmingScienceTypeId]);

  // 获取农事详情
  const getFarmingDetailInfo = useCallback(async () => {
    try {
      const {data} = await farmingDetailInfo({farmingId: route.params?.farmingId as string});
      // 填充详情数据
      setFarmParams({
        farmingName: data.farmingName,
        dictLabel: data.farmingName,
        dictValue: data.farmingScienceTypeName,
        totalArea: data.totalArea,
        detailaddress: data.detailaddress,
        workBeginTime: data.workBeginTime,
        workEndTime: data.workEndTime,
        teamMobile: data.teamMobile,
        farmingLands: data.lands.map((item: any) => ({
          landId: item.id,
          landType: item.landType,
        })),
        farmingScienceId: data.farmingScienceTypeId,
        farmingScienceName: data.farmingScienceName,
        farmingScienceTypeId: data.farmingScienceTypeId,
        farmingScienceTypeName: data.farmingScienceTypeName,
      });

      setFarmType([
        {farmTypeName: "农事作物", icon: true, value: data.dictLabel},
        {
          farmTypeName: "农事类型",
          icon: true,
          value: data.farmingScienceTypeName,
        },
        {
          farmTypeName: "技术标准",
          icon: true,
          value: data.farmingScienceName,
        },
      ]);

      setFarmLand([
        {
          farmTypeName: "农事地块",
          icon: true,
          value: data.totalArea,
        },
        {
          farmTypeName: "作业时间",
          icon: true,
          value: `${data.workBeginTime}~${data.workEndTime}`,
        },
        {farmTypeName: "机耕队", icon: false, value: data.teamMobile},
      ]);

      setFarmSelect({
        farmCrop: {dictLabel: data.dictLabel, dictValue: data.dictValue},
        farmNorm: {
          farmingScienceId: data.farmingScienceId,
          farmingScienceName: data.farmingScienceName,
        },
        farmType: {
          farmingScienceTypeId: data.farmingScienceTypeId,
          farmingScienceTypeName: data.farmingScienceTypeName,
        },
      });
    } catch (error) {
      console.error("获取农事详情失败:", error);
    }
  }, [route.params?.farmingId]);

  // 生命周期
  useEffect(() => {
    if (route.params?.title === "编辑" && route.params?.farmingId) {
      getFarmingDetailInfo();
    }

    // 监听选地块回调
    const unsubscribe = navigation.addListener("SelectLand", (data: any) => {
      setFarmParams(prev => ({
        ...prev,
        farmingLands: data.ids.map((item: any) => ({
          landId: item.id,
          landType: item.landType,
        })),
        totalArea: data.totalArea,
        detailaddress: data.detailaddress,
      }));
      setFarmLand(prev => {
        const newList = [...prev];
        newList[0].value = data.totalArea;
        return newList;
      });
    });

    return () => unsubscribe();
  }, [route.params?.title, route.params?.farmingId, getFarmCropList, getFarmingDetailInfo, navigation]);

  // 渲染列表项
  const renderFarmTypeItem = (item: FarmTypeListType, index: number) => (
    <TouchableOpacity key={index} style={styles.farmTypeListItem} onPress={() => handleFarmType(item, index)}>
      <View style={styles.itemLabel}>
        <Text style={styles.must}>*</Text>
        <Text style={styles.labelText}>{item.farmTypeName}</Text>
      </View>
      <View style={styles.itemInput}>
        <Text style={[styles.inputText, !item.value && styles.grayText, item.value && styles.ellipsis]}>
          {item.value || "请选择"}
        </Text>
        {item.icon && (
          <Image source={require("@/assets/images/common/icon-right.png")} style={styles.rightIcon} resizeMode="contain" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFarmLandItem = (item: FarmTypeListType, index: number) => (
    <TouchableOpacity key={index} style={styles.farmTypeListItem} onPress={() => handleFarmLand(item, index)}>
      <View style={styles.itemLabel}>
        <Text style={styles.must}>*</Text>
        <Text style={styles.labelText}>{item.farmTypeName}</Text>
      </View>
      <View style={styles.itemInput}>
        {item.farmTypeName === "机耕队" ? (
          <TextInput
            style={styles.input}
            placeholder="请输入"
            keyboardType="numeric"
            value={farmParams.teamMobile}
            onChangeText={inputTeamMobile}
          />
        ) : !item.value ? (
          <Text style={[styles.input, styles.grayText]}>请选择</Text>
        ) : item.farmTypeName === "农事地块" ? (
          <Text style={styles.inputText}>
            已选<Text style={styles.greenText}>{farmParams.farmingLands.length}</Text>
            个地块,共<Text style={styles.greenText}> {farmParams.totalArea} </Text>亩
          </Text>
        ) : (
          <Text style={styles.inputText}>{item.value}</Text>
        )}
        {item.icon && (
          <Image source={require("@/assets/images/common/icon-right.png")} style={styles.rightIcon} resizeMode="contain" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 自定义状态栏 */}
      <CustomStatusBar
        navTitle={`${navTitleType}农事`}
        onBack={() => navigation.goBack()}
        onRightPress={handleRightPress}
        rightTitle={navTitleType === "删除" ? "删除" : ""}
      />
      {/* 农事类型列表 */}
      <View style={styles.farmTypeList}>{farmType.map((item, index) => renderFarmTypeItem(item, index))}</View>

      {/* 农事地块等列表 */}
      <View style={styles.farmTypeList}>{farmLand.map((item, index) => renderFarmLandItem(item, index))}</View>

      {/* 保存按钮 */}
      <TouchableOpacity
        style={[styles.btnSave, !(isFarmTypeComplete && isFarmLandComplete) && styles.btnDisabled]}
        onPress={saveAddFarm}
        disabled={!(isFarmTypeComplete && isFarmLandComplete)}>
        <View style={styles.btn}>
          <Text style={styles.btnText}>保存</Text>
        </View>
      </TouchableOpacity>

      {/* 农事作物弹窗 */}
      <Modal visible={showFarmPopup.showFarmCrop} transparent animationType="slide" onRequestClose={closeFarmCropPopup}>
        <PopupBottom popupTitle="农事作物" showBack={false} onClose={closeFarmCropPopup}>
          <ScrollView style={styles.farmCropList}>
            {farmCropList.map((crop, index) => (
              <TouchableOpacity key={index} style={styles.farmCropItem} onPress={() => selectFarmCrop(crop)}>
                <Text style={[styles.cropText, farmSelect.farmCrop.dictValue === crop.dictValue && styles.farmActive]}>
                  {crop.dictLabel}
                </Text>
                {farmSelect.farmCrop.dictValue === crop.dictValue && (
                  <Image
                    source={require("@/assets/images/device/icon-agree.png")}
                    style={styles.agreeIcon}
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </PopupBottom>
      </Modal>

      {/* 农事类型弹窗 */}
      <Modal visible={showFarmPopup.showFarmType} transparent animationType="slide" onRequestClose={closeFarmTypePopup}>
        <PopupBottom popupTitle="农事类型" showBack={false} onClose={closeFarmTypePopup}>
          <ScrollView style={styles.farmCropList}>
            {farmTypeList.map((item, index) => (
              <TouchableOpacity key={index} style={styles.farmCropItem} onPress={() => selectFarmType(item)}>
                <Text
                  style={[styles.cropText, farmSelect.farmType.farmingScienceTypeId === item.farmingTypeId && styles.farmActive]}>
                  {item.farmingTypeName}
                </Text>
                {farmSelect.farmType.farmingScienceTypeId === item.farmingTypeId && (
                  <Image
                    source={require("@/assets/images/device/icon-agree.png")}
                    style={styles.agreeIcon}
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </PopupBottom>
      </Modal>

      {/* 技术标准弹窗 */}
      <Modal visible={showFarmPopup.showFarmNorm} transparent animationType="slide" onRequestClose={closeFarmNormPopup}>
        <PopupBottom popupTitle="技术标准" showBack={false} onClose={closeFarmNormPopup}>
          <ScrollView style={styles.farmNormList}>
            {farmNormList.map((norm, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.farmNormItem, farmSelect.farmNorm.farmingScienceId === norm.farmingScienceId && styles.normActive]}
                onPress={() => selectFarmNorm(norm)}>
                <View style={styles.normTitle}>
                  <Text
                    style={[
                      styles.normTitleText,
                      farmSelect.farmNorm.farmingScienceId === norm.farmingScienceId && styles.normActiveText,
                    ]}
                    numberOfLines={1}>
                    {norm.farmingScienceName}
                  </Text>
                  <TouchableOpacity style={styles.viewBtn} onPress={() => viewFarmNorm(norm)}>
                    <Text style={styles.viewBtnText}>查看</Text>
                  </TouchableOpacity>
                </View>
                <Image
                  source={
                    farmSelect.farmNorm.farmingScienceId === norm.farmingScienceId
                      ? require("@/assets/images/farming/icon-success-active.png")
                      : require("@/assets/images/farming/icon-success.png")
                  }
                  style={styles.normIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </PopupBottom>
      </Modal>

      {/* 时间选择器弹窗 */}
      <Modal
        visible={showFarmPopup.showTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => closeTimePickerPopup(["", ""])}>
        <FarmTimePicker time={farmLand[farmIndex]?.value || ""} onClosePopup={closeTimePickerPopup} />
      </Modal>

      {/* 删除确认弹窗 */}
      <Popup
        visible={showFarmPopup.showDeleteConfirm}
        title="提示"
        msgText="删除后被转移或分配的农事也将被清空，确认删除？"
        leftBtnText="取消"
        rightBtnText="退出登录"
        rightBtnStyle={{color: "#FF3D3B"}}
        onLeftBtn={closeFarmDeletePopup}
        onRightBtn={confirmDeleteFarm}
      />
    </View>
  );
};

export default AddFarmScreen;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    flex: 1,
    backgroundColor: "#f7f7f8",
  },
  farmTypeList: {
    marginTop: 8,
    backgroundColor: "#fff",
  },
  farmTypeListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: SCREEN_WIDTH,
    height: 52,
    paddingHorizontal: 6,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e7e7e7",
    boxSizing: "border-box",
  },
  itemLabel: {
    flexDirection: "row",
    alignItems: "center",
    width: 80,
  },
  must: {
    color: "#ff3d3b",
    marginRight: 2,
  },
  labelText: {
    fontSize: 16,
    color: "#000",
  },
  itemInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  inputText: {
    paddingLeft: 13,
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
  },
  grayText: {
    color: "gray",
  },
  greenText: {
    color: "#08ae3c",
  },
  ellipsis: {
    flex: 1,
  },
  rightIcon: {
    width: 26,
    height: 26,
  },
  btnSave: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: 84,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: -1},
    shadowOpacity: 0.1,
    shadowRadius: 0,
    elevation: 1, // Android阴影
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btn: {
    width: 343,
    height: 52,
    backgroundColor: "#08ae3c",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#fff",
  },
  farmCropList: {
    height: 282,
    paddingHorizontal: 16,
  },
  farmCropItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cropText: {
    fontSize: 18,
    color: "#000",
  },
  farmActive: {
    color: "#08ae3c",
  },
  agreeIcon: {
    width: 26,
    height: 26,
  },
  farmNormList: {
    height: 282,
    paddingHorizontal: 10,
  },
  farmNormItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 355,
    height: 66,
    paddingHorizontal: 16,
    marginTop: 8,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#d3d3d3",
    borderRadius: 8,
  },
  normActive: {
    backgroundColor: "#f7fff9",
    borderColor: "#08ae3c",
  },
  normTitle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginRight: 24,
  },
  normTitleText: {
    width: 225,
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
    numberOfLines: 1,
  },
  normActiveText: {
    color: "#08ae3c",
  },
  viewBtn: {
    width: 44,
    height: 26,
    borderWidth: 1,
    borderColor: "rgba(153,153,153,0.6)",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  viewBtnText: {
    fontSize: 14,
    color: "#666",
  },
  normIcon: {
    width: 20,
    height: 20,
  },
});
