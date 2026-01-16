// 新建农事
import {View, Text, TouchableOpacity, ScrollView, TextInput, Image, Pressable} from "react-native";
import {FarmStackParamList} from "@/types/navigation";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import CustomStatusBar from "@/components/common/CustomStatusBar";
import {dictDataList} from "@/services/common";
import {AddFarmingParams, FarmingTypeListItem} from "@/types/farming";
import {AddFarmScreenStyles} from "./styles/AddFarmScreen";
import {useEffect, useState} from "react";
import {farmingTypeList} from "@/services/farming";
import {showCustomToast} from "@/components/common/CustomToast";
import {LandListData} from "@/types/land";

// 字典数据类型定义
interface DictData {
  dictLabel: string;
  dictValue: string;
  icon?: string; // 作物图标可选
}

type LandStackParamList = {
  SelectLand: {type: string; onSelectLandResult: (result: LandListData[]) => void};
};

const AddFarmScreen = () => {
  const navigation = useNavigation<StackNavigationProp<LandStackParamList>>();
  const [farmCropList, setFarmCropList] = useState<DictData[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<DictData | null>(null);
  const [farmingTypeListData, setFarmingTypeListData] = useState<FarmingTypeListItem[]>([]);
  const [showFarmingTypeList, setShowFarmingTypeList] = useState(false);
  const [selectedFarmingTypes, setSelectedFarmingTypes] = useState<FarmingTypeListItem[]>([]);
  const [selectedLand, setSelectedLand] = useState<string>("");
  const [farmingName, setFarmingName] = useState<string>("");
  const [isFarmParComplete, setIsFarmParComplete] = useState(false);
  const [hostingLand, setHostingLand] = useState<LandListData[]>([]);
  const [circulationLand, setCirculationLand] = useState<LandListData[]>([]);

  // 初始化获取作物列表
  useEffect(() => {
    getFarmCropList();
  }, []);

  // 监听表单完整性，更新保存按钮状态
  useEffect(() => {
    const isComplete = !!selectedCrop && selectedFarmingTypes.length > 0 && !!selectedLand && !!farmingName;
    setIsFarmParComplete(isComplete);
  }, [selectedCrop, selectedFarmingTypes, selectedLand, farmingName]);

  // 自动生成农事名称
  useEffect(() => {
    if (selectedCrop && selectedFarmingTypes.length > 0) {
      const year = new Date().getFullYear();
      const farmingLabels = selectedFarmingTypes.map(item => item.farmingTypeName).join("-");
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
    await getFarmingTypeList(crop);
  };

  // 获取农事类型列表
  const getFarmingTypeList = async (crop: DictData): Promise<void> => {
    try {
      const {data} = await farmingTypeList({dictValue: crop.dictValue || ""});
      if (!data || data.length === 0) {
        setShowFarmingTypeList(false);
        showCustomToast("error", `当前作物${crop.dictLabel}暂无农事`);
        return;
      }
      setShowFarmingTypeList(true);
      setFarmingTypeListData(data || []);
    } catch (error) {
      showCustomToast("error", `获取${crop.dictLabel}农事类型列表失败`);
    }
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
      type: "select",
      onSelectLandResult: result => {
        handleSelectLandResult(result);
      },
    });
  };

  // 处理选择地块结果
  const handleSelectLandResult = (result: LandListData[]) => {
    console.log("处理选择地块结果", result);
    const circulationLand = result.filter(item => item.landType === "1");
    const hostingLand = result.filter(item => item.landType === "2");
    setHostingLand(hostingLand);
    setCirculationLand(circulationLand);
    console.log("托管地块", hostingLand);
    console.log("流转地块", circulationLand);
  };

  // 计算地块亩数之和
  const calculateTotalArea = (land: LandListData[]) => {
    return Number(land.reduce((total, item) => total + Number(item.actualAcreNum || 0), 0).toFixed(2));
  };

  // 保存农事
  const saveAddFarm = async () => {};

  return (
    <View style={AddFarmScreenStyles.container}>
      {/* 自定义状态栏 */}
      <CustomStatusBar navTitle={"新建农事"} onBack={() => navigation.goBack()} />

      {/* 主内容区 */}
      <ScrollView style={AddFarmScreenStyles.content} showsVerticalScrollIndicator={false}>
        {/* 选择作物区域 */}
        <View style={AddFarmScreenStyles.sectionContainer}>
          <View style={AddFarmScreenStyles.sectionHeader}>
            <View style={AddFarmScreenStyles.mark} />
            <Text style={AddFarmScreenStyles.sectionTitle}>
              选择作物 <Text style={{color: "#999"}}>(单选)</Text>
            </Text>
          </View>
          <View style={AddFarmScreenStyles.cropGrid}>
            {/* {farmCropList.map(item => (
              <Pressable
                key={item.dictValue}
                style={[
                  AddFarmScreenStyles.cropItem,
                  selectedCrop?.dictValue === item.dictValue && AddFarmScreenStyles.cropItemActive,
                ]}
                onPress={() => handleCropSelect(item)}>
                <Image source={{uri: item.icon}} style={AddFarmScreenStyles.cropIcon} resizeMode="contain" />
                <Text
                  style={[
                    AddFarmScreenStyles.cropText,
                    selectedCrop?.dictValue === item.dictValue && AddFarmScreenStyles.cropTextActive,
                  ]}>
                  {item.dictLabel}
                </Text>
              </Pressable>
            ))} */}
            <Pressable
              style={[AddFarmScreenStyles.cropItem, selectedCrop?.dictValue === "wheat" && AddFarmScreenStyles.cropItemActive]}
              onPress={() => handleCropSelect({dictValue: "wheat", dictLabel: "小麦"})}>
              <Image
                source={require("@/assets/images/farming/icon-wheat.png")}
                style={AddFarmScreenStyles.cropIcon}
                resizeMode="contain"
              />
              <Text
                style={[AddFarmScreenStyles.cropText, selectedCrop?.dictValue === "wheat" && AddFarmScreenStyles.cropTextActive]}>
                小麦
              </Text>
            </Pressable>
            <Pressable
              style={[AddFarmScreenStyles.cropItem, selectedCrop?.dictValue === "corn" && AddFarmScreenStyles.cropItemActive]}
              onPress={() => handleCropSelect({dictValue: "corn", dictLabel: "玉米"})}>
              <Image
                source={require("@/assets/images/farming/icon-corn.png")}
                style={AddFarmScreenStyles.cropIcon}
                resizeMode="contain"
              />
              <Text
                style={[AddFarmScreenStyles.cropText, selectedCrop?.dictValue === "corn" && AddFarmScreenStyles.cropTextActive]}>
                玉米
              </Text>
            </Pressable>
            <Pressable
              style={[AddFarmScreenStyles.cropItem, selectedCrop?.dictValue === "soybean" && AddFarmScreenStyles.cropItemActive]}
              onPress={() => handleCropSelect({dictValue: "soybean", dictLabel: "大豆"})}>
              <Image
                source={require("@/assets/images/farming/icon-soybean.png")}
                style={AddFarmScreenStyles.cropIcon}
                resizeMode="contain"
              />
              <Text
                style={[
                  AddFarmScreenStyles.cropText,
                  selectedCrop?.dictValue === "soybean" && AddFarmScreenStyles.cropTextActive,
                ]}>
                大豆
              </Text>
            </Pressable>
            <Pressable
              style={[AddFarmScreenStyles.cropItem, selectedCrop?.dictValue === "rice" && AddFarmScreenStyles.cropItemActive]}
              onPress={() => handleCropSelect({dictValue: "rice", dictLabel: "水稻"})}>
              <Image
                source={require("@/assets/images/farming/icon-rice.png")}
                style={AddFarmScreenStyles.cropIcon}
                resizeMode="contain"
              />
              <Text
                style={[AddFarmScreenStyles.cropText, selectedCrop?.dictValue === "rice" && AddFarmScreenStyles.cropTextActive]}>
                水稻
              </Text>
            </Pressable>
          </View>
          {/* 选择农事区域 */}
          {showFarmingTypeList && (
            <View style={{marginTop: 12}}>
              <View style={AddFarmScreenStyles.sectionHeader}>
                <View style={AddFarmScreenStyles.mark} />
                <Text style={AddFarmScreenStyles.sectionTitle}>
                  选择农事 <Text style={{color: "#999"}}>(多选)</Text>
                </Text>
              </View>
              <View style={AddFarmScreenStyles.farmingGrid}>
                {farmingTypeListData.map(item => {
                  const isSelected = selectedFarmingTypes.some(t => t.farmingTypeId === item.farmingTypeId);
                  return (
                    <Pressable
                      key={item.farmingTypeId}
                      style={[AddFarmScreenStyles.farmingItem, isSelected && AddFarmScreenStyles.farmingItemActive]}
                      onPress={() => handleFarmingTypeToggle(item)}>
                      <Text style={[AddFarmScreenStyles.farmingText, isSelected && AddFarmScreenStyles.farmingTextActive]}>
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
        <View style={AddFarmScreenStyles.sectionContainer}>
          <View style={AddFarmScreenStyles.sectionHeader}>
            <View style={AddFarmScreenStyles.mark} />
            <Text style={AddFarmScreenStyles.sectionTitle}>选择地块</Text>
          </View>
          {hostingLand.length > 0 || circulationLand.length > 0 ? (
            <TouchableOpacity style={AddFarmScreenStyles.landSelectBtn} onPress={handleLandSelect}>
              <View style={AddFarmScreenStyles.selectLandTextContnet}>
                {circulationLand.length > 0 && (
                  <Text style={AddFarmScreenStyles.selectLandText}>
                    <Text style={{color: "#08AE3C"}}>{circulationLand.length}</Text>
                    <Text>个流转地块，共</Text>
                    <Text style={{color: "#08AE3C"}}>{calculateTotalArea(circulationLand)}</Text>
                    <Text>亩</Text>
                  </Text>
                )}
                {hostingLand.length > 0 && (
                  <Text style={AddFarmScreenStyles.selectLandText}>
                    <Text style={{color: "#1DB3FF"}}>{hostingLand.length}</Text>
                    <Text>个托管地块，共</Text>
                    <Text style={{color: "#1DB3FF"}}>{calculateTotalArea(hostingLand)}</Text>
                    <Text>亩</Text>
                  </Text>
                )}
              </View>
              <Image source={require("@/assets/images/common/icon-right-gray.png")} style={AddFarmScreenStyles.editIconImg} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={AddFarmScreenStyles.landSelectBtn} onPress={handleLandSelect}>
              <Text style={AddFarmScreenStyles.landSelectText}>{selectedLand || "点击选择"}</Text>
              <Image source={require("@/assets/images/common/icon-right-gray.png")} style={AddFarmScreenStyles.editIconImg} />
            </TouchableOpacity>
          )}
        </View>

        {/* 农事名称区域 */}
        <View style={AddFarmScreenStyles.sectionContainer}>
          <View style={AddFarmScreenStyles.sectionHeader}>
            <View style={AddFarmScreenStyles.mark} />
            <Text style={AddFarmScreenStyles.sectionTitle}>农事名称</Text>
          </View>
          <View style={AddFarmScreenStyles.nameInputContainer}>
            <TextInput
              style={AddFarmScreenStyles.nameInput}
              value={farmingName}
              onChangeText={setFarmingName}
              placeholder="请输入农事名称"
              placeholderTextColor="#999"
            />
            <Image source={require("@/assets/images/common/icon-edit.png")} style={AddFarmScreenStyles.editIconImg} />
          </View>
        </View>
      </ScrollView>

      {/* 保存按钮 */}
      <View style={AddFarmScreenStyles.btnSave}>
        <TouchableOpacity
          style={[AddFarmScreenStyles.btn, !isFarmParComplete && AddFarmScreenStyles.btnDisabled]}
          onPress={saveAddFarm}
          disabled={!isFarmParComplete}>
          <Text style={AddFarmScreenStyles.btnText}>保存</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddFarmScreen;
