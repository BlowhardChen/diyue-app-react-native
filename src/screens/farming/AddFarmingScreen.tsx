// 新建&编辑农事
import {View, Text, TouchableOpacity, ScrollView, TextInput, Image, Pressable, ImageSourcePropType} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import CustomStatusBar from "@/components/common/CustomStatusBar";
import {dictDataList} from "@/services/common";
import {AddFarmingParams, FarmingTypeListItem} from "@/types/farming";
import {AddFarmingScreenStyles} from "./styles/AddFarmingScreen";
import {useEffect, useState} from "react";
import {addFarming, editFarming, farmingLandList, farmingTypeList, getEditFarmingDetail} from "@/services/farming";
import {showCustomToast} from "@/components/common/CustomToast";
import {LandListData} from "@/types/land";
import {debounce, set} from "lodash";
import {updateStore} from "@/stores/updateStore";

// 字典数据类型定义
interface DictData {
  dictLabel: string;
  dictValue: string;
  imgUrl?: string;
}

type FarmingStackParamList = {
  SelectLand: {type: string; farmingTypeId?: string; lands: LandListData[]; onSelectLandResult: (result: LandListData[]) => void};
  FarmingMap: undefined;
};

const AddFarmingScreen = ({route}: {route: {params: {farmingId?: string}}}) => {
  const navigation = useNavigation<StackNavigationProp<FarmingStackParamList>>();
  const [farmCropList, setFarmCropList] = useState<DictData[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<DictData | null>(null);
  const [farmingTypeListData, setFarmingTypeListData] = useState<FarmingTypeListItem[]>([]);
  const [showFarmingTypeList, setShowFarmingTypeList] = useState(false);
  const [selectedFarmingTypes, setSelectedFarmingTypes] = useState<FarmingTypeListItem[]>([]);
  const [selectedLand, setSelectedLand] = useState<LandListData[]>([]);
  const [farmingName, setFarmingName] = useState<string>("");
  const [isFarmParComplete, setIsFarmParComplete] = useState(false);
  const [hostingLand, setHostingLand] = useState<LandListData[]>([]);
  const [circulationLand, setCirculationLand] = useState<LandListData[]>([]);

  // 初始化获取作物列表
  useEffect(() => {
    getFarmCropList();
    if (route.params?.farmingId) {
      getFarmingDetailData(route.params.farmingId);
    }
  }, []);

  useEffect(() => {
    if (selectedCrop) {
      getFarmingTypeList(selectedCrop);
    }
  }, [selectedCrop]);

  // 监听表单完整性，更新保存按钮状态
  useEffect(() => {
    const isComplete = !!selectedCrop && selectedFarmingTypes.length > 0 && !!selectedLand && !!farmingName;
    setIsFarmParComplete(isComplete);
  }, [selectedCrop, selectedFarmingTypes, selectedLand, farmingName]);

  // 自动生成农事名称
  useEffect(() => {
    if (selectedCrop && selectedFarmingTypes.length > 0) {
      const year = new Date().getFullYear();
      const farmingLabels = selectedFarmingTypes.map(item => item.farmingTypeName).join("");
      setFarmingName(`${year}-${selectedCrop.dictLabel}-${farmingLabels}`);
    }
  }, [selectedCrop, selectedFarmingTypes]);

  // 获取农事作物列表
  const getFarmCropList = async (): Promise<void> => {
    try {
      const {data} = await dictDataList({dictType: "farm_crops_type"});
      setFarmCropList(data || []);
    } catch (error) {
      showCustomToast("error", "获取作物列表失败");
    }
  };

  // 切换作物选择
  const handleCropSelect = async (crop: DictData) => {
    setSelectedCrop(crop);
  };

  // 切换农事操作选择（多选）
  const handleFarmingTypeToggle = (type: FarmingTypeListItem) => {
    const isSelected = selectedFarmingTypes.some(item => item.farmingTypeId === type.farmingTypeId);
    if (isSelected) {
      setSelectedFarmingTypes(selectedFarmingTypes.filter(item => item.farmingTypeId !== type.farmingTypeId));
    } else {
      setSelectedFarmingTypes([...selectedFarmingTypes, type]);
    }
  };

  // 选择地块
  const handleLandSelect = () => {
    navigation.navigate("SelectLand", {
      type: "farming",
      farmingTypeId: route.params?.farmingId || "",
      lands: selectedLand?.length ? selectedLand : [],
      onSelectLandResult: result => {
        handleSelectLandResult(result);
      },
    });
  };

  // 处理选择地块结果
  const handleSelectLandResult = (result: LandListData[]) => {
    setSelectedLand(result);
    setLandTypeData(result);
  };

  // 分类地块类型
  const setLandTypeData = (landList: LandListData[]) => {
    if (!landList.length) return;
    const circulationLand = landList.filter(item => item.landType === "1");
    const hostingLand = landList.filter(item => item.landType === "2");
    setHostingLand(hostingLand);
    setCirculationLand(circulationLand);
  };

  // 计算地块亩数之和
  const calculateTotalArea = (land: LandListData[]) => {
    return Number(land.reduce((total, item) => total + Number(item.actualAcreNum || 0), 0).toFixed(2));
  };

  // 保存农事
  const saveAddFarm = debounce(async () => {
    console.log("保存农事", selectedFarmingTypes);
    const params: AddFarmingParams = {
      farmingName,
      dictLabel: selectedCrop?.dictLabel || "",
      dictValue: selectedCrop?.dictValue || "",
      totalArea: calculateTotalArea(selectedLand),
      farmingLands: selectedLand.map(item => ({landType: item.landType, landId: item.id})),
      farmingJoinTypes: selectedFarmingTypes.map(item => ({
        farmingTypeId: item.farmingTypeId,
        farmingTypeName: item.farmingTypeName,
      })),
    };
    console.log("保存农事参数", params);
    try {
      if (!route.params?.farmingId) {
        await addFarming(params);
        showCustomToast("success", "新建农事成功");
      } else {
        await editFarming({farmingId: route.params?.farmingId || "", ...params});
        updateStore.setIsUpdateFarming(true);
        showCustomToast("success", "编辑农事成功");
        navigation.reset({
          index: 0,
          routes: [{name: "FarmingMap"}],
        });
      }
    } catch (error) {
      showCustomToast("error", "保存农事失败");
    }
  }, 300);

  // 获取农事类型列表
  const getFarmingTypeList = async (crop: DictData): Promise<void> => {
    try {
      const {data} = await farmingTypeList({dictValue: crop.dictValue || ""});
      if (!data || data.length === 0) {
        setShowFarmingTypeList(false);
        showCustomToast("error", `当前作物${crop.dictLabel}暂无农事类型`);
        return;
      }
      setShowFarmingTypeList(true);
      setFarmingTypeListData(data || []);
    } catch (error) {
      showCustomToast("error", `获取${crop.dictLabel}农事类型列表失败`);
    }
  };

  // 获取农事详情数据
  const getFarmingDetailData = async (id: string) => {
    try {
      const {data} = await getEditFarmingDetail(id);
      console.log("农事详情数据：", data);
      setSelectedCrop({dictLabel: data.dictLabel, dictValue: data.dictValue, imgUrl: data.imgUrl});
      setSelectedFarmingTypes(data.farmingJoinTypes || []);
      setLandTypeData(data.lands || []);
      setSelectedLand(data.lands || []);
      setFarmingName(data.farmingName || "");
    } catch (error) {
      showCustomToast("error", "获取农事详情失败，请稍后重试");
    }
  };

  return (
    <View style={AddFarmingScreenStyles.container}>
      {/* 自定义状态栏 */}
      <CustomStatusBar navTitle={route.params?.farmingId ? "编辑农事" : "新建农事"} onBack={() => navigation.goBack()} />

      {/* 主内容区 */}
      <ScrollView style={AddFarmingScreenStyles.content} showsVerticalScrollIndicator={false}>
        {/* 选择作物区域 */}
        <View style={AddFarmingScreenStyles.sectionContainer}>
          <View style={AddFarmingScreenStyles.sectionHeader}>
            <View style={AddFarmingScreenStyles.mark} />
            <Text style={AddFarmingScreenStyles.sectionTitle}>
              选择作物 <Text style={{color: "#999"}}>(单选)</Text>
            </Text>
          </View>
          <View style={AddFarmingScreenStyles.cropGrid}>
            {farmCropList.map(item => (
              <Pressable
                key={item.dictValue}
                style={[
                  AddFarmingScreenStyles.cropItem,
                  selectedCrop?.dictValue === item.dictValue && AddFarmingScreenStyles.cropItemActive,
                ]}
                onPress={() => handleCropSelect(item)}>
                <Image source={{uri: item.imgUrl}} style={AddFarmingScreenStyles.cropIcon} resizeMode="contain" />
                <Text
                  style={[
                    AddFarmingScreenStyles.cropText,
                    selectedCrop?.dictValue === item.dictValue && AddFarmingScreenStyles.cropTextActive,
                  ]}>
                  {item.dictLabel}
                </Text>
              </Pressable>
            ))}
          </View>
          {/* 选择农事区域 */}
          {showFarmingTypeList && (
            <View style={{marginTop: 12}}>
              <View style={AddFarmingScreenStyles.sectionHeader}>
                <View style={AddFarmingScreenStyles.mark} />
                <Text style={AddFarmingScreenStyles.sectionTitle}>
                  选择农事 <Text style={{color: "#999"}}>(多选)</Text>
                </Text>
              </View>
              <View style={AddFarmingScreenStyles.farmingGrid}>
                {farmingTypeListData.map(item => {
                  const isSelected = selectedFarmingTypes.some(t => t.farmingTypeId === item.farmingTypeId);
                  return (
                    <Pressable
                      key={item.farmingTypeId}
                      style={[AddFarmingScreenStyles.farmingItem, isSelected && AddFarmingScreenStyles.farmingItemActive]}
                      onPress={() => handleFarmingTypeToggle(item)}>
                      <Text style={[AddFarmingScreenStyles.farmingText, isSelected && AddFarmingScreenStyles.farmingTextActive]}>
                        {item.farmingTypeName}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        {/* 选择地块区域 */}
        <View style={AddFarmingScreenStyles.sectionContainer}>
          <View style={AddFarmingScreenStyles.sectionHeader}>
            <View style={AddFarmingScreenStyles.mark} />
            <Text style={AddFarmingScreenStyles.sectionTitle}>选择地块</Text>
          </View>
          {hostingLand.length > 0 || circulationLand.length > 0 ? (
            <TouchableOpacity style={AddFarmingScreenStyles.landSelectBtn} onPress={handleLandSelect}>
              <View style={AddFarmingScreenStyles.selectLandTextContnet}>
                {circulationLand.length > 0 && (
                  <Text style={AddFarmingScreenStyles.selectLandText}>
                    <Text style={{color: "#08AE3C"}}>{circulationLand.length}</Text>
                    <Text>个流转地块，共</Text>
                    <Text style={{color: "#08AE3C"}}>{calculateTotalArea(circulationLand)}</Text>
                    <Text>亩</Text>
                  </Text>
                )}
                {hostingLand.length > 0 && (
                  <Text style={AddFarmingScreenStyles.selectLandText}>
                    <Text style={{color: "#1DB3FF"}}>{hostingLand.length}</Text>
                    <Text>个托管地块，共</Text>
                    <Text style={{color: "#1DB3FF"}}>{calculateTotalArea(hostingLand)}</Text>
                    <Text>亩</Text>
                  </Text>
                )}
              </View>
              <Image source={require("@/assets/images/common/icon-right-gray.png")} style={AddFarmingScreenStyles.editIconImg} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={AddFarmingScreenStyles.landSelectBtn} onPress={handleLandSelect}>
              <Text style={AddFarmingScreenStyles.landSelectText}>
                {selectedLand.length > 0 ? `${selectedLand.length}个地块已选择` : "点击选择"}
              </Text>
              <Image source={require("@/assets/images/common/icon-right-gray.png")} style={AddFarmingScreenStyles.editIconImg} />
            </TouchableOpacity>
          )}
        </View>

        {/* 农事名称区域 */}
        <View style={AddFarmingScreenStyles.sectionContainer}>
          <View style={AddFarmingScreenStyles.sectionHeader}>
            <View style={AddFarmingScreenStyles.mark} />
            <Text style={AddFarmingScreenStyles.sectionTitle}>农事名称</Text>
          </View>
          <View style={AddFarmingScreenStyles.nameInputContainer}>
            <TextInput
              style={AddFarmingScreenStyles.nameInput}
              value={farmingName}
              onChangeText={setFarmingName}
              placeholder="请输入农事名称"
              placeholderTextColor="#999"
            />
            <Image source={require("@/assets/images/common/icon-edit.png")} style={AddFarmingScreenStyles.editIconImg} />
          </View>
        </View>
      </ScrollView>

      {/* 保存按钮 */}
      <View style={AddFarmingScreenStyles.btnSave}>
        <TouchableOpacity
          style={[AddFarmingScreenStyles.btn, !isFarmParComplete && AddFarmingScreenStyles.btnDisabled]}
          onPress={saveAddFarm}
          disabled={!isFarmParComplete}>
          <Text style={AddFarmingScreenStyles.btnText}>保存</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddFarmingScreen;
