// 租赁时间选择器组件
import {Global} from "@/styles/global";
import {debounce} from "lodash";
import React, {useState, useEffect, useRef} from "react";
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
  const prevVisibleRef = useRef<boolean>(false);

  // 防抖更新天数和修正索引（避免快速切换年月导致内存堆积）
  const debouncedUpdateDays = useRef(
    debounce((year: number, month: number) => {
      updateDays(year, month);
    }, 50),
  ).current;

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

  // 计算当月天数
  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month, 0).getDate();
  };

  // 更新天数列表 + 同步修正日索引
  const updateDays = (year: number, month: number) => {
    if (!visible) return; // 弹窗关闭时直接返回

    // 1. 更新天数列表
    const daysInMonth = getDaysInMonth(year, month);
    const dayList: number[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      dayList.push(i);
    }
    setDays(dayList);

    setDayIndex(prevDayIndex => {
      const validIndex = Math.min(prevDayIndex, daysInMonth - 1);
      return validIndex !== prevDayIndex ? validIndex : prevDayIndex;
    });
  };

  useEffect(() => {
    // 仅在visible从false变为true，且年月数组已初始化时执行
    if (visible && !prevVisibleRef.current && years.length > 0 && months.length > 0) {
      // 获取当前系统日期
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const currentDay = now.getDate();

      // 计算正确索引
      const newYearIndex = currentYear - 1990;
      const newMonthIndex = currentMonth - 1;
      const newDayIndex = currentDay - 1;

      // 同步更新所有状态（无异步，避免竞态）
      setYearIndex(newYearIndex);
      setMonthIndex(newMonthIndex);
      setDayIndex(newDayIndex);
      updateDays(currentYear, currentMonth);
    }
    // 更新ref记录当前visible状态
    prevVisibleRef.current = visible;
  }, [visible, years, months]); // 仅依赖基础状态，无频繁变化的函数

  // 年份变化时：防抖更新天数和索引
  useEffect(() => {
    if (years.length === 0 || months.length === 0 || !visible) return;
    const selectedYear = years[yearIndex];
    const selectedMonth = months[monthIndex];
    debouncedUpdateDays(selectedYear, selectedMonth);
  }, [yearIndex, years, months, visible, debouncedUpdateDays]);

  // 月份变化时：防抖更新天数和索引
  useEffect(() => {
    if (years.length === 0 || months.length === 0 || !visible) return;
    const selectedYear = years[yearIndex];
    const selectedMonth = months[monthIndex];
    debouncedUpdateDays(selectedYear, selectedMonth);
  }, [monthIndex, years, months, visible, debouncedUpdateDays]);

  // 组件卸载时清理防抖定时器（关键：防止内存泄漏）
  useEffect(() => {
    return () => {
      if (debouncedUpdateDays) {
        // 清理防抖的超时任务
        const timeoutIds = (debouncedUpdateDays as any).timeoutId;
        if (timeoutIds) clearTimeout(timeoutIds);
      }
    };
  }, [debouncedUpdateDays]);

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
