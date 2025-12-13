// 租赁时间选择器组件
import {Global} from "@/styles/global";
import React, {useState, useEffect, useCallback} from "react";
import {View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions} from "react-native";
import {WheelPicker} from "react-native-wheel-picker-android";

const {width: SCREEN_WIDTH} = Dimensions.get("window");

interface LeaseTimePickerProps {
  visible: boolean; // 控制弹窗显示隐藏
  onClose: () => void; // 关闭弹窗回调
  onConfirm: (date: string) => void; // 确认选择回调
}

const LeaseTimePicker: React.FC<LeaseTimePickerProps> = ({visible, onClose, onConfirm}) => {
  const [yearIndex, setYearIndex] = useState<number>(0);
  const [monthIndex, setMonthIndex] = useState<number>(0);
  const [dayIndex, setDayIndex] = useState<number>(0);
  const [years, setYears] = useState<number[]>([]);
  const [months, setMonths] = useState<number[]>([]);
  const [days, setDays] = useState<number[]>([]);

  // 初始化基础数据（年份/月份数组，仅首次执行）
  useEffect(() => {
    // 初始化年份（1990-2200）
    const yearList: number[] = [];
    for (let i = 1990; i <= 2200; i++) {
      yearList.push(i);
    }
    setYears(yearList);

    // 初始化月份（1-12）
    const monthList: number[] = [];
    for (let i = 1; i <= 12; i++) {
      monthList.push(i);
    }
    setMonths(monthList);
  }, []);

  // 计算当月天数（抽离为独立函数，确保引用稳定）
  const getDaysInMonth = useCallback((year: number, month: number): number => {
    return new Date(year, month, 0).getDate();
  }, []);

  // 更新日期数组（抽离为独立函数）
  const updateDays = useCallback(
    (year: number, month: number, targetDayIndex?: number) => {
      const daysInMonth = getDaysInMonth(year, month);
      const dayList: number[] = [];
      for (let i = 1; i <= daysInMonth; i++) {
        dayList.push(i);
      }
      setDays(dayList);

      // 确定最终的日期索引（优先用传入的目标索引，否则用当前索引）
      const finalDayIndex = targetDayIndex ?? dayIndex;
      // 确保索引不越界
      const validDayIndex = Math.min(finalDayIndex, daysInMonth - 1);
      if (validDayIndex !== dayIndex) {
        setDayIndex(validDayIndex);
      }
    },
    [dayIndex, getDaysInMonth],
  );

  // 弹窗打开时强制重置为当前日期
  useEffect(() => {
    if (visible && years.length > 0 && months.length > 0) {
      // 获取当前系统日期（实时获取，确保每次打开都是最新）
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // 月份从 0 开始，需 +1
      const currentDay = now.getDate();

      // 计算正确的索引
      const newYearIndex = currentYear - 1990; // 年份数组从 1990 开始
      const newMonthIndex = currentMonth - 1; // 月份数组从 1 开始
      const newDayIndex = currentDay - 1; // 日期数组从 1 开始

      // 同步更新所有状态（避免异步竞态）
      setYearIndex(newYearIndex);
      setMonthIndex(newMonthIndex);
      setDayIndex(newDayIndex);

      // 立即更新天数（使用目标dayIndex，确保天数数组正确后索引有效）
      updateDays(currentYear, currentMonth, newDayIndex);
    }
  }, [visible, years, months, updateDays]);

  // 年份变化时更新天数
  useEffect(() => {
    if (years.length === 0 || months.length === 0 || yearIndex >= years.length) return;
    const selectedYear = years[yearIndex];
    const selectedMonth = months[monthIndex];
    updateDays(selectedYear, selectedMonth);
  }, [yearIndex, years, months, updateDays]);

  // 月份变化时更新天数
  useEffect(() => {
    if (years.length === 0 || months.length === 0 || monthIndex >= months.length) return;
    const selectedYear = years[yearIndex];
    const selectedMonth = months[monthIndex];
    updateDays(selectedYear, selectedMonth);
  }, [monthIndex, years, months, updateDays]);

  // 确认选择
  const handleConfirm = () => {
    if (years.length === 0 || months.length === 0 || days.length === 0) return;
    const selectedYear = years[yearIndex];
    const selectedMonth = months[monthIndex];
    const selectedDay = days[dayIndex];
    const formattedDate = `${selectedYear}-${selectedMonth.toString().padStart(2, "0")}-${selectedDay
      .toString()
      .padStart(2, "0")}`;
    onConfirm(formattedDate);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} />
        <View style={styles.pickerContent}>
          {/* 顶部操作栏 */}
          <View style={styles.pickerTop}>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.pickerButton, styles.cancel]}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={[styles.pickerButton, styles.confirm]}>确认</Text>
            </TouchableOpacity>
          </View>

          {/* 三级滚轮选择区域 */}
          <View style={styles.wheelContainer}>
            {/* 年份滚轮 */}
            <WheelPicker
              data={years.map(item => `${item} 年`)}
              selectedItem={yearIndex}
              onItemSelected={index => setYearIndex(index)}
              itemTextSize={18}
              selectedItemTextSize={18}
              itemTextFontFamily="System"
              selectedItemTextFontFamily="System"
              selectedItemTextColor="#000000"
              indicatorColor="#e7e7e7"
              isCyclic={false}
              style={styles.wheel}
            />

            {/* 月份滚轮 */}
            <WheelPicker
              data={months.map(item => `${item} 月`)}
              selectedItem={monthIndex}
              onItemSelected={index => setMonthIndex(index)}
              itemTextSize={18}
              selectedItemTextSize={18}
              itemTextFontFamily="System"
              selectedItemTextFontFamily="System"
              selectedItemTextColor="#000000"
              indicatorColor="#e7e7e7"
              isCyclic={false}
              style={styles.wheel}
            />

            {/* 日期滚轮 */}
            <WheelPicker
              data={days.map(item => `${item} 日`)}
              selectedItem={dayIndex}
              onItemSelected={index => setDayIndex(index)}
              itemTextSize={18}
              selectedItemTextSize={18}
              itemTextFontFamily="System"
              selectedItemTextFontFamily="System"
              selectedItemTextColor="#000000"
              indicatorColor="#e7e7e7"
              isCyclic={false}
              style={styles.wheel}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

// 样式定义
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  overlayTouchable: {
    flex: 1,
  },
  pickerContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingBottom: 10,
  },
  pickerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e7e7e7",
  },
  pickerButton: {
    fontSize: 16,
  },
  cancel: {
    color: "#666666",
  },
  confirm: {
    color: Global.colors.primary,
    fontWeight: "500",
  },
  wheelContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 5,
    height: 150,
  },
  wheel: {
    width: (SCREEN_WIDTH - 32) / 3,
    height: 125,
  },
});

export default LeaseTimePicker;
