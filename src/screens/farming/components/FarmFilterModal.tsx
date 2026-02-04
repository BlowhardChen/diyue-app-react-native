// 农事地图筛选弹窗
import React, {useState, useEffect} from "react";
import {View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Image} from "react-native";
import {Global} from "@/styles/global";
import {FarmingTypeListItem, FarmTypeListItem} from "@/types/farming";
import {dictDataList} from "@/services/common";
import {farmingTypeList} from "@/services/farming";
import {showCustomToast} from "@/components/common/CustomToast";

// 字典数据类型定义
interface DictData {
  dictLabel: string;
  dictValue: string;
  icon?: string;
}

const cropIcons = {
  wheat: require("@/assets/images/farming/icon-wheat.png"),
  corn: require("@/assets/images/farming/icon-corn.png"),
  soybean: require("@/assets/images/farming/icon-soybean.png"),
  rice: require("@/assets/images/farming/icon-rice.png"),
};

// 组件属性类型
interface FarmFilterModalProps {
  visible: boolean;
  onConfirm: (filters: {cropType: DictData; farmingTypes: FarmingTypeListItem[]}) => void;
  onClose: () => void;
}

const FarmFilterModal: React.FC<FarmFilterModalProps> = ({visible, onConfirm, onClose}) => {
  // 选中的作物类型
  const [farmCropList, setFarmCropList] = useState<DictData[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<DictData | null>(null);
  const [farmingTypeListData, setFarmingTypeListData] = useState<FarmingTypeListItem[]>([]);
  const [showFarmingTypeList, setShowFarmingTypeList] = useState(false);
  const [selectedFarmingTypes, setSelectedFarmingTypes] = useState<FarmingTypeListItem[]>([]);

  // 切换作物选择
  const handleCropSelect = async (crop: DictData) => {
    setSelectedCrop(crop);
    await getFarmingTypeList(crop);
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

  useEffect(() => {
    getFarmCropList();
  }, []);

  // 重置筛选条件
  const handleReset = () => {
    setSelectedCrop(null);
    setSelectedFarmingTypes([]);
  };

  // 确定筛选
  const handleConfirm = () => {
    onConfirm({
      cropType: selectedCrop as DictData,
      farmingTypes: selectedFarmingTypes,
    });
  };

  // 点击蒙层关闭筛选器
  const handleMaskClick = () => {
    onClose?.();
  };

  // 获取农事作物列表
  const getFarmCropList = async (): Promise<void> => {
    try {
      const {data} = await dictDataList({dictType: "farm_crops_type"});
      const updatedList = data?.map(item => {
        return {...item, icon: cropIcons[item.dictValue as keyof typeof cropIcons]};
      });
      setFarmCropList(updatedList || []);
    } catch (error) {
      showCustomToast("error", "获取作物列表失败");
    }
  };

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

  // 不显示时直接返回空视图
  if (!visible) return null;

  return (
    <View style={styles.modalContainer}>
      <View style={styles.filterContainer}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
          {/* 作物类型标题 */}
          <View style={styles.filterTitleContainer}>
            <View style={styles.mark} />
            <Text style={styles.filterTitle}>作物类型</Text>
          </View>
          {/* 作物类型选项网格 */}
          <View style={styles.optionsGrid}>
            {farmCropList.map(crop => (
              <TouchableOpacity
                key={crop.dictValue}
                style={[styles.optionItem, selectedCrop?.dictValue === crop.dictValue && styles.selectedOption]}
                activeOpacity={1}
                onPress={() => handleCropSelect(crop)}>
                <Text style={[styles.optionText, selectedCrop?.dictValue === crop.dictValue && styles.selectedText]}>
                  {crop.dictLabel}
                </Text>
                {selectedCrop?.dictValue === crop.dictValue && (
                  <Image source={require("@/assets/images/common/icon-subscript.png")} style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* 农事类型选项网格 */}
          {showFarmingTypeList && (
            <>
              {/* 农事类型标题 */}
              <View style={[styles.filterTitleContainer, {marginTop: 20}]}>
                <View style={styles.mark} />
                <Text style={styles.filterTitle}>农事类型</Text>
              </View>
              <View style={styles.optionsGrid}>
                {farmingTypeListData.map(farming => (
                  <TouchableOpacity
                    key={farming.farmingTypeId}
                    style={[
                      styles.optionItem,
                      selectedFarmingTypes.some(item => item.farmingTypeId === farming.farmingTypeId) && styles.selectedOption,
                    ]}
                    activeOpacity={1}
                    onPress={() => handleFarmingTypeToggle(farming)}>
                    <Text
                      style={[
                        styles.optionText,
                        selectedFarmingTypes.some(item => item.farmingTypeId === farming.farmingTypeId) && styles.selectedText,
                      ]}>
                      {farming.farmingTypeName}
                    </Text>
                    {selectedFarmingTypes.some(item => item.farmingTypeId === farming.farmingTypeId) && (
                      <Image source={require("@/assets/images/common/icon-subscript.png")} style={styles.checkIcon} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          {/* 按钮区域 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.resetButton} activeOpacity={1} onPress={handleReset}>
              <Text style={styles.resetButtonText}>重置</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} activeOpacity={1} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>确定</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
      <TouchableOpacity style={styles.filterBottom} onPress={handleMaskClick}></TouchableOpacity>
    </View>
  );
};

const {width: SCREEN_WIDTH} = Dimensions.get("window");
const FILTER_WIDTH = SCREEN_WIDTH - 32;

const styles = StyleSheet.create({
  modalContainer: {
    position: "absolute",
    top: 142,
    width: SCREEN_WIDTH,
    flexDirection: "column",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, .5)",
  },
  filterContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5E5",
  },
  scrollContainer: {
    // minHeight: 300,
  },
  filterTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  mark: {
    width: 4,
    height: 18,
    backgroundColor: Global.colors.primary,
    marginRight: 10,
  },
  filterTitle: {
    fontSize: 18,
    color: "#000",
    fontWeight: "500",
  },
  // 选项网格布局
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  // 单个选项样式
  optionItem: {
    position: "relative",
    width: (FILTER_WIDTH - 12) / 2,
    height: 40,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#F5F5F5",
    borderRadius: 6,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  // 选中的选项样式
  selectedOption: {
    borderColor: Global.colors.primary,
    backgroundColor: Global.colors.primary + "10",
  },
  // 选项文字
  optionText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "400",
  },
  // 选中的文字样式
  selectedText: {
    color: Global.colors.primary,
    fontWeight: "500",
  },
  // 勾选图标
  checkIcon: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 20,
    height: 18,
  },
  // 按钮容器
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
    paddingBottom: 8,
  },
  // 重置按钮
  resetButton: {
    flex: 1,
    height: 44,
    backgroundColor: "#F5F6F8",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },
  // 确定按钮
  confirmButton: {
    flex: 1,
    height: 44,
    backgroundColor: Global.colors.primary,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  filterBottom: {
    width: FILTER_WIDTH,
    flex: 1,
  },
});

export default FarmFilterModal;
