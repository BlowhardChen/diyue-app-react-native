import React, {useState, useEffect, useRef} from "react";
import {View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions} from "react-native";
import {WheelPicker} from "react-native-wheel-picker-android";
import {debounce} from "lodash";

// 设备屏宽（适配原750rpx满宽布局）
const SCREEN_WIDTH = Dimensions.get("window").width;

// 组件Props类型定义
interface FarmingTimePickerProps {
  visible: boolean; // 控制弹窗显示/隐藏
  time?: string; // 回显时间，格式："YYYY-MM-DD~YYYY-MM-DD"
  onClose: () => void; // 关闭弹窗回调
  onConfirm: (startTime: string, endTime: string) => void; // 确认回调，返回开始/结束时间
}

// 获取指定年月的天数
const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

// 格式化日期为YYYY-MM-DD（补零）
const formatDate = (year: number, month: number, day: number): string => {
  const paddedMonth = month.toString().padStart(2, "0");
  const paddedDay = day.toString().padStart(2, "0");
  return `${year}-${paddedMonth}-${paddedDay}`;
};

// 解析日期字符串为年月日
const parseDate = (dateString: string): {year: number; month: number; day: number} | null => {
  const parts = dateString.split("-").map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return {year: parts[0], month: parts[1], day: parts[2]};
  }
  return null;
};

const FarmingTimePicker: React.FC<FarmingTimePickerProps> = ({visible, time, onClose, onConfirm}) => {
  // 状态定义
  const [timeSelect, setTimeSelect] = useState<"start" | "end">("start");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [years, setYears] = useState<number[]>([]);
  const [months, setMonths] = useState<number[]>([]);
  const [days, setDays] = useState<number[]>([]);
  const [yearIndex, setYearIndex] = useState<number>(0);
  const [monthIndex, setMonthIndex] = useState<number>(0);
  const [dayIndex, setDayIndex] = useState<number>(0);
  const prevVisibleRef = useRef<boolean>(false);

  // 防抖更新天数和修正索引
  const debouncedUpdateDays = useRef(
    debounce((year: number, month: number) => {
      updateDays(year, month);
    }, 50),
  ).current;

  // 初始化基础数据
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

  // 更新天数列表 + 同步修正日索引
  const updateDays = (year: number, month: number) => {
    if (!visible) return;

    // 更新天数列表
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

  // 初始化默认时间+props回显
  useEffect(() => {
    // 仅在visible从false变为true，且年月数组已初始化时执行
    if (visible && !prevVisibleRef.current && years.length > 0 && months.length > 0) {
      const now = new Date();
      const defaultYear = now.getFullYear();
      const defaultMonth = now.getMonth() + 1;
      const defaultDay = now.getDate();

      // 计算正确索引
      const newYearIndex = defaultYear - 1990;
      const newMonthIndex = defaultMonth - 1;
      const newDayIndex = defaultDay - 1;

      // 同步更新所有状态
      setYearIndex(newYearIndex);
      setMonthIndex(newMonthIndex);
      setDayIndex(newDayIndex);
      updateDays(defaultYear, defaultMonth);

      const defaultStart = formatDate(defaultYear, defaultMonth, defaultDay);
      setStartTime(defaultStart);

      if (time) {
        const [start, end] = time.split("~");
        setStartTime(start || defaultStart);
        setEndTime(end || "");
      }
    }
    // 更新ref记录当前visible状态
    prevVisibleRef.current = visible;
  }, [visible, years, months, time]);

  // 核心修复：监听年月日索引变化，实时更新startTime/endTime
  useEffect(() => {
    // 数组未初始化时直接返回，避免索引越界
    if (years.length === 0 || months.length === 0 || days.length === 0 || !visible) return;

    // 根据当前索引获取选中的年月日
    const selectedYear = years[yearIndex];
    const selectedMonth = months[monthIndex];
    const selectedDay = days[dayIndex];
    // 格式化为标准日期字符串
    const currentSelectedDate = formatDate(selectedYear, selectedMonth, selectedDay);

    // 根据当前选中的是开始/结束时间，实时更新对应状态
    if (timeSelect === "start") {
      setStartTime(currentSelectedDate);
    } else {
      setEndTime(currentSelectedDate);
    }
  }, [yearIndex, monthIndex, dayIndex, years, months, days, timeSelect, visible]);

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

  // 组件卸载时清理防抖定时器
  useEffect(() => {
    return () => {
      if (debouncedUpdateDays) {
        const timeoutIds = (debouncedUpdateDays as any).timeoutId;
        if (timeoutIds) clearTimeout(timeoutIds);
      }
    };
  }, [debouncedUpdateDays]);

  // 切换开始/结束时间选择
  const handleTimeInput = (type: "start" | "end") => {
    setTimeSelect(type);

    // 切换时，将选择器定位到当前选中的时间索引
    const targetTime = type === "start" ? startTime : endTime;
    if (targetTime && years.length > 0 && months.length > 0) {
      const date = parseDate(targetTime);
      if (date) {
        const newYearIndex = date.year - 1990;
        const newMonthIndex = date.month - 1;
        const newDayIndex = date.day - 1;

        setYearIndex(newYearIndex);
        setMonthIndex(newMonthIndex);
        setDayIndex(newDayIndex);
        updateDays(date.year, date.month);
      }
    }
  };

  // 确认选择：仅做回调和关闭，移除原有状态更新逻辑（已由索引监听实现）
  const handleConfirm = () => {
    if (years.length === 0 || months.length === 0 || days.length === 0) return;

    // 验证开始时间不能晚于结束时间
    if (endTime && startTime > endTime) {
      console.warn("开始时间不能晚于结束时间");
      return;
    }

    // 直接将实时更新的startTime/endTime传给父组件
    onConfirm(startTime, endTime);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent={true}>
      {/* 蒙层 */}
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.pickerContent} activeOpacity={1} onPress={e => e.stopPropagation()}>
          {/* 顶部取消/确认按钮 */}
          <View style={styles.pickerTop}>
            <TouchableOpacity style={styles.pickerCancel} onPress={onClose}>
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pickerConfirm} onPress={handleConfirm}>
              <Text style={styles.confirmText}>确认</Text>
            </TouchableOpacity>
          </View>

          {/* 开始/结束时间选择栏 - 实时显示startTime/endTime */}
          <View style={styles.pickerInput}>
            {/* 开始时间项 */}
            <TouchableOpacity
              style={[styles.pickerInputItem, timeSelect === "start" && styles.pickerInputItemActive]}
              onPress={() => handleTimeInput("start")}>
              <Text style={[styles.inputTitle, timeSelect === "start" && styles.inputTitleActive]}>开始时间</Text>
              <Text style={[styles.inputTime, timeSelect === "start" && styles.inputTimeActive]}>
                {startTime || "请选择开始时间"}
              </Text>
            </TouchableOpacity>

            {/* 结束时间项 */}
            <TouchableOpacity
              style={[styles.pickerInputItem, timeSelect === "end" && styles.pickerInputItemActive]}
              onPress={() => handleTimeInput("end")}>
              <Text style={[styles.inputTitle, timeSelect === "end" && styles.inputTitleActive]}>结束时间</Text>
              <Text style={[styles.inputTime, timeSelect === "end" && styles.inputTimeActive]}>
                {endTime || "请选择结束时间"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 时间选择器（年/月/日） */}
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
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// 样式表（无修改，保持原有样式）
const styles = StyleSheet.create({
  // 蒙层
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  // 选择器主容器
  pickerContent: {
    width: SCREEN_WIDTH,
    backgroundColor: "#fff",
  },

  // 顶部按钮栏
  pickerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  pickerCancel: {
    paddingHorizontal: 12,
  },

  pickerConfirm: {
    paddingHorizontal: 12,
  },

  cancelText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "400",
  },

  confirmText: {
    fontSize: 18,
    color: "#08ae3c",
    fontWeight: "400",
  },

  // 开始/结束时间输入栏
  pickerInput: {
    width: SCREEN_WIDTH,
    backgroundColor: "#f5f5f5",
    flexDirection: "row",
  },

  pickerInputItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 6,
  },

  pickerInputItemActive: {
    backgroundColor: "#08ae3c",
  },

  inputTitle: {
    fontSize: 13,
    color: "#666",
  },

  inputTitleActive: {
    color: "#fff",
  },

  inputTime: {
    fontSize: 18,
    color: "#666",
  },

  inputTimeActive: {
    color: "#fff",
  },

  // 时间选择器容器
  wheelContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 5,
    height: 150,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },

  // 选择器列
  wheel: {
    width: (SCREEN_WIDTH - 32) / 3,
    height: 125,
  },
});

export default FarmingTimePicker;
