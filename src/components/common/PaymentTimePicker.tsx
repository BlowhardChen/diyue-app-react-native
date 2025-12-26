// 付款时间选择器组件（仅月日）
import {Global} from "@/styles/global";
import React, {useState, useEffect, useCallback, useRef} from "react";
import {View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions} from "react-native";
import {WheelPicker} from "react-native-wheel-picker-android";

const {width: SCREEN_WIDTH} = Dimensions.get("window");

interface PaymentTimePickerProps {
  visible: boolean; // 控制弹窗显示隐藏
  onClose: () => void; // 关闭弹窗回调
  onConfirm: (date: string) => void; // 确认选择回调（格式：MM-DD）
  initialDate?: string; // 新增：默认选中的日期（格式：MM-DD）
}

const PaymentTimePicker: React.FC<PaymentTimePickerProps> = ({visible, onClose, onConfirm, initialDate}) => {
  const [monthIndex, setMonthIndex] = useState<number>(0);
  const [dayIndex, setDayIndex] = useState<number>(0);
  const [months, setMonths] = useState<number[]>([]);
  const [days, setDays] = useState<number[]>([]);
  const currentYear = new Date().getFullYear();
  // 新增：标记是否是首次初始化，避免手动滑动时重置
  const isFirstInit = useRef(true);

  // 初始化月份数组（1-12）
  useEffect(() => {
    const monthList: number[] = [];
    for (let i = 1; i <= 12; i++) {
      monthList.push(i);
    }
    setMonths(monthList);
  }, []);

  // 计算当月天数（纯函数，无外部依赖）
  const getDaysInMonth = useCallback((year: number, month: number): number => {
    return new Date(year, month, 0).getDate();
  }, []);

  // 更新日期数组（仅依赖getDaysInMonth，移除dayIndex依赖）
  const updateDays = useCallback(
    (year: number, month: number, targetDayIndex?: number) => {
      const daysInMonth = getDaysInMonth(year, month);
      const dayList: number[] = [];
      for (let i = 1; i <= daysInMonth; i++) {
        dayList.push(i);
      }
      setDays(dayList);

      // 只有传入了目标索引，才更新dayIndex（避免自动重置）
      if (targetDayIndex !== undefined) {
        const validDayIndex = Math.min(targetDayIndex, daysInMonth - 1);
        setDayIndex(validDayIndex);
      }
    },
    [getDaysInMonth], // 仅依赖getDaysInMonth，移除dayIndex
  );

  // 解析MM-DD格式的日期字符串（纯函数）
  const parseDateString = useCallback(
    (dateStr: string): {month: number; day: number} => {
      if (!dateStr || !dateStr.includes("-")) {
        // 无初始值时返回当前日期
        const now = new Date();
        return {
          month: now.getMonth() + 1,
          day: now.getDate(),
        };
      }
      const [month, day] = dateStr.split("-").map(Number);
      // 边界校验
      const validMonth = Math.max(1, Math.min(12, month));
      const validDay = Math.max(1, Math.min(getDaysInMonth(currentYear, validMonth), day));
      return {month: validMonth, day: validDay};
    },
    [currentYear, getDaysInMonth],
  );

  // 弹窗打开时初始化日期（仅在visible从false→true时执行）
  useEffect(() => {
    if (visible && months.length > 0 && isFirstInit.current) {
      // 优先使用传入的initialDate，否则使用当前日期
      const {month: targetMonth, day: targetDay} = parseDateString(initialDate || "");

      const newMonthIndex = targetMonth - 1;
      const newDayIndex = targetDay - 1;

      setMonthIndex(newMonthIndex);
      updateDays(currentYear, targetMonth, newDayIndex);
      // 首次初始化完成后，标记为false
      isFirstInit.current = false;
    }

    // 弹窗关闭时，重置首次初始化标记
    if (!visible) {
      isFirstInit.current = true;
    }
  }, [visible, months, currentYear, initialDate, parseDateString, updateDays]);

  // 月份变化时更新天数（仅更新天数数组，不主动重置dayIndex）
  useEffect(() => {
    if (!visible || months.length === 0 || monthIndex >= months.length) return;
    const selectedMonth = months[monthIndex];
    // 仅更新天数数组，不传targetDayIndex → 不修改dayIndex
    updateDays(currentYear, selectedMonth);
  }, [monthIndex, months, currentYear, updateDays, visible]); // 增加visible依赖，避免弹窗关闭时执行

  // 确认选择
  const handleConfirm = () => {
    if (months.length === 0 || days.length === 0) return;
    const selectedMonth = months[monthIndex];
    const selectedDay = days[dayIndex];
    // 格式化：MM-DD
    const formattedDate = `${selectedMonth.toString().padStart(2, "0")}-${selectedDay.toString().padStart(2, "0")}`;
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

          {/* 双滚轮选择区域（月 + 日） */}
          <View style={styles.wheelContainer}>
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
              onItemSelected={index => setDayIndex(index)} // 手动滑动时更新dayIndex，无副作用
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

// 样式定义（适配双滚轮）
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
  // 调整滚轮宽度为双列布局
  wheel: {
    width: (SCREEN_WIDTH - 64) / 2,
    height: 125,
  },
});

export default PaymentTimePicker;
