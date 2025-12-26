import {Global} from "@/styles/global";
import React, {useState, useEffect} from "react";
import {View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions} from "react-native";
import {WheelPicker} from "react-native-wheel-picker-android";

// 屏幕宽度
const {width: screenWidth} = Dimensions.get("window");

interface LeaseTermPickerProps {
  visible: boolean;
  onClosePopup: () => void;
  onConfirm: (year: number) => void;
  defaultYear?: number; // 新增：默认选中的年份
}

const LeaseTermPicker: React.FC<LeaseTermPickerProps> = ({
  visible,
  onClosePopup,
  onConfirm,
  defaultYear = 1, // 默认值设为1年
}) => {
  // 年份数组
  const years = [1, 2, 3, 4, 5];
  // 选中索引
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 根据默认年份更新选中索引
  useEffect(() => {
    if (visible) {
      // 仅在弹窗显示时更新
      const index = years.findIndex(year => year === defaultYear);
      // 如果找到对应年份则选中，否则默认选中第一个（1年）
      setSelectedIndex(index >= 0 ? index : 0);
    }
  }, [visible, defaultYear]); // 监听弹窗显示状态和默认年份变化

  // 确认选择
  const handleConfirm = () => {
    const selectedYear = years[selectedIndex];
    onConfirm(selectedYear);
    onClosePopup();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClosePopup}>
      {/* 遮罩层 */}
      <View style={styles.overlay}>
        {/* 点击遮罩关闭 */}
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClosePopup} />

        {/* 选择器内容容器 */}
        <View style={styles.pickerContent}>
          {/* 顶部取消/确认按钮 */}
          <View style={styles.pickerTop}>
            <TouchableOpacity onPress={onClosePopup}>
              <Text style={[styles.pickerButton, styles.cancel]}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={[styles.pickerButton, styles.confirm]}>确认</Text>
            </TouchableOpacity>
          </View>

          {/* WheelPicker 选择器 */}
          <View style={styles.wheelContainer}>
            <WheelPicker
              data={years.map(year => `${year}年`)}
              selectedItem={selectedIndex}
              onItemSelected={index => setSelectedIndex(index)}
              itemTextSize={15}
              selectedItemTextSize={20}
              itemTextFontFamily="System"
              selectedItemTextFontFamily="System"
              selectedItemTextColor="#000000"
              itemTextColor="#333333"
              indicatorColor="rgba(0, 0, 0, 0.1)"
              isCyclic={false}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // 遮罩层
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  // 可点击的遮罩区域
  overlayTouchable: {
    flex: 1,
  },
  // 选择器内容容器
  pickerContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  // 顶部按钮栏
  pickerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  // 按钮通用样式
  pickerButton: {
    fontSize: 16,
    fontWeight: "400",
  },
  // 取消按钮样式
  cancel: {
    color: "#7c8196",
  },
  // 确认按钮样式
  confirm: {
    color: Global.colors.primary,
  },
  // 滚轮容器
  wheelContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 5,
    height: 150,
  },
  // 滚轮样式
  wheel: {
    width: screenWidth - 30,
    height: 100,
  },
});

export default LeaseTermPicker;
