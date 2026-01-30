// 农事地图筛选弹窗
import React, {useState, useEffect} from "react";
import {View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Image} from "react-native";
import {Global} from "@/styles/global";

// 定义筛选选项类型
type CropType = "小麦" | "玉米" | "大豆" | "水稻";
type FarmingType = "犁地" | "旋耕" | "深耕" | "播种";

// 组件属性类型
interface FarmFilterModalProps {
  visible: boolean;
  onConfirm: (filters: {cropTypes: CropType[]; farmingTypes: FarmingType[]}) => void;
  onClose: () => void;
  initialFilters?: {
    cropTypes: CropType[];
    farmingTypes: FarmingType[];
  };
}

const FarmFilterModal: React.FC<FarmFilterModalProps> = ({
  visible,
  onConfirm,
  onClose,
  initialFilters = {cropTypes: [], farmingTypes: []},
}) => {
  // 选中的作物类型
  const [selectedCrops, setSelectedCrops] = useState<CropType[]>([]);
  // 选中的农事类型
  const [selectedFarming, setSelectedFarming] = useState<FarmingType[]>([]);

  // 初始化选中状态
  useEffect(() => {
    setSelectedCrops([...initialFilters.cropTypes]);
    setSelectedFarming([...initialFilters.farmingTypes]);
  }, [initialFilters]);

  // 切换作物类型选中状态
  const toggleCrop = (crop: CropType) => {
    setSelectedCrops(prev => (prev.includes(crop) ? prev.filter(item => item !== crop) : [...prev, crop]));
  };

  // 切换农事类型选中状态
  const toggleFarming = (farming: FarmingType) => {
    setSelectedFarming(prev => (prev.includes(farming) ? prev.filter(item => item !== farming) : [...prev, farming]));
  };

  // 重置筛选条件
  const handleReset = () => {
    setSelectedCrops([]);
    setSelectedFarming([]);
  };

  // 确定筛选
  const handleConfirm = () => {
    onConfirm({
      cropTypes: selectedCrops,
      farmingTypes: selectedFarming,
    });
  };

  // 点击蒙层关闭筛选器
  const handleMaskClick = () => {
    onClose?.();
  };

  // 作物类型列表
  const cropOptions: CropType[] = ["小麦", "玉米", "大豆", "水稻"];
  // 农事类型列表
  const farmingOptions: FarmingType[] = ["犁地", "旋耕", "深耕", "播种"];

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
            {cropOptions.map(crop => (
              <TouchableOpacity
                key={crop}
                style={[styles.optionItem, selectedCrops.includes(crop) && styles.selectedOption]}
                activeOpacity={1}
                onPress={() => toggleCrop(crop)}>
                <Text style={[styles.optionText, selectedCrops.includes(crop) && styles.selectedText]}>{crop}</Text>
                {selectedCrops.includes(crop) && (
                  <Image source={require("@/assets/images/common/icon-subscript.png")} style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
          {/* 农事类型标题 */}
          <View style={[styles.filterTitleContainer, {marginTop: 20}]}>
            <View style={styles.mark} />
            <Text style={styles.filterTitle}>农事类型</Text>
          </View>
          {/* 农事类型选项网格 */}
          <View style={styles.optionsGrid}>
            {farmingOptions.map(farming => (
              <TouchableOpacity
                key={farming}
                style={[styles.optionItem, selectedFarming.includes(farming) && styles.selectedOption]}
                activeOpacity={1}
                onPress={() => toggleFarming(farming)}>
                <Text style={[styles.optionText, selectedFarming.includes(farming) && styles.selectedText]}>{farming}</Text>
                {selectedFarming.includes(farming) && (
                  <Image source={require("@/assets/images/common/icon-subscript.png")} style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
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
    minHeight: 300,
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
