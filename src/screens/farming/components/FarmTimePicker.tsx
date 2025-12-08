import React, {useState, useEffect} from "react";
import {View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform} from "react-native";
import {Picker} from "@react-native-picker/picker";

const {width: SCREEN_WIDTH} = Dimensions.get("window");

interface FarmTimePickerProps {
  time: string;
  onClosePopup: (time: [string, string]) => void;
}

const FarmTimePicker: React.FC<FarmTimePickerProps> = ({time, onClosePopup}) => {
  const [timeSelect, setTimeSelect] = useState<string>("start");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [pickerIndex, setPickerIndex] = useState<number[]>([0, 0, 0]);
  const [years, setYears] = useState<number[]>([]);
  const [months, setMonths] = useState<number[]>([]);
  const [days, setDays] = useState<number[]>([]);

  // 初始化日期数据
  useEffect(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // 生成年份（1990-2200）
    const yearList = [];
    for (let i = 1990; i <= 2200; i++) {
      yearList.push(i);
    }
    setYears(yearList);

    // 生成月份（1-12）
    const monthList = [];
    for (let i = 1; i <= 12; i++) {
      monthList.push(i);
    }
    setMonths(monthList);

    // 初始化天数
    updateDays(year, month);

    // 设置默认选中
    setPickerIndex([year - 1990, month - 1, day - 1]);
    setStartTime(`${year}-${month}-${day}`);

    // 解析传入的时间
    if (time) {
      const [start, end] = time.split("~");
      setStartTime(start);
      setEndTime(end);
    }
  }, [time]);

  // 根据年月更新天数
  const updateDays = (year: number, month: number) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const dayList = [];
    for (let i = 1; i <= daysInMonth; i++) {
      dayList.push(i);
    }
    setDays(dayList);

    // 修正日期索引
    if (pickerIndex[2] >= daysInMonth) {
      setPickerIndex([pickerIndex[0], pickerIndex[1], daysInMonth - 1]);
    }
  };

  // 处理选择器变化
  const handleChange = (column: number, value: number) => {
    const newIndex = [...pickerIndex];
    newIndex[column] = value;
    setPickerIndex(newIndex);

    const selectedYear = years[newIndex[0]];
    const selectedMonth = months[newIndex[1]];

    // 更新天数
    updateDays(selectedYear, selectedMonth);

    // 更新选中时间
    const selectedDay = days[newIndex[2]];
    const formattedDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;

    if (timeSelect === "start") {
      setStartTime(formattedDate);
    } else {
      setEndTime(formattedDate);
    }
  };

  // 处理时间选择切换（开始/结束）
  const handleTimeInput = (type: string) => {
    setTimeSelect(type);
  };

  // 确认选择
  const handleConfirm = () => {
    onClosePopup([startTime, endTime]);
  };

  // 关闭弹窗
  const closePopup = () => {
    onClosePopup(["", ""]);
  };

  return (
    <View style={styles.container}>
      {/* 遮罩层 */}
      <TouchableOpacity style={styles.overlay} onPress={closePopup} />

      {/* 选择器内容 */}
      <View style={styles.pickerContent}>
        {/* 顶部按钮 */}
        <View style={styles.pickerTop}>
          <TouchableOpacity style={styles.pickerCancel} onPress={closePopup}>
            <Text style={styles.pickerBtnText}>取消</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pickerConfirm} onPress={handleConfirm}>
            <Text style={[styles.pickerBtnText, styles.confirmText]}>确认</Text>
          </TouchableOpacity>
        </View>

        {/* 时间选择项 */}
        <View style={styles.pickerInput}>
          <TouchableOpacity
            style={[styles.pickerInputItem, timeSelect === "start" && styles.timeActive]}
            onPress={() => handleTimeInput("start")}>
            <Text style={styles.inputTitle}>开始时间</Text>
            <Text style={styles.inputTime}>{startTime || "请选择开始时间"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pickerInputItem, timeSelect === "end" && styles.timeActive]}
            onPress={() => handleTimeInput("end")}>
            <Text style={styles.inputTitle}>结束时间</Text>
            <Text style={styles.inputTime}>{endTime || "请选择结束时间"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.androidPicker}>
          <Picker
            selectedValue={years[pickerIndex[0]]}
            style={styles.pickerColumn}
            onValueChange={(value: number) => handleChange(0, years.indexOf(value))}>
            {years.map(year => (
              <Picker.Item key={year} label={`${year}年`} value={year} />
            ))}
          </Picker>
          <Picker
            selectedValue={months[pickerIndex[1]]}
            style={styles.pickerColumn}
            onValueChange={(value: number) => handleChange(1, months.indexOf(value))}>
            {months.map(month => (
              <Picker.Item key={month} label={`${month}月`} value={month} />
            ))}
          </Picker>
          <Picker
            selectedValue={days[pickerIndex[2]]}
            style={styles.pickerColumn}
            onValueChange={(value: number) => handleChange(2, days.indexOf(value))}>
            {days.map(day => (
              <Picker.Item key={day} label={`${day}日`} value={day} />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  pickerContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 10,
  },
  pickerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  pickerCancel: {
    padding: 4,
  },
  pickerConfirm: {
    padding: 4,
  },
  pickerBtnText: {
    fontSize: 16,
    color: "#666",
  },
  confirmText: {
    color: "#08ae3c",
    fontWeight: "500",
  },
  pickerInput: {
    flexDirection: "row",
    width: SCREEN_WIDTH,
    height: 50,
    backgroundColor: "#f5f5f5",
  },
  pickerInputItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 3,
  },
  timeActive: {
    backgroundColor: "#08ae3c",
  },
  inputTitle: {
    fontSize: 13,
    color: "#666",
  },
  inputTime: {
    fontSize: 18,
    color: "#666",
  },
  pickerView: {
    height: 100,
    width: SCREEN_WIDTH,
  },
  androidPicker: {
    flexDirection: "row",
    height: 100,
    width: SCREEN_WIDTH,
  },
  pickerColumn: {
    flex: 1,
  },
});

export default FarmTimePicker;
