import ExpandButton from "@/screens/land/components/ExpandButton";
import React, {useState} from "react";
import {View, Text, StyleSheet, TouchableOpacity, GestureResponderEvent} from "react-native";

type FarmingTaskBottomPopupProps = {
  taskInfo: {
    taskType: string;
    taskStatus: string;
    area: string;
    operator: string;
    completedArea: string;
    completedBlocks: number;
    totalBlocks: number;
  };
  onManagePress: () => void;
  onViewWorkPress: () => void;
  onMarkPress: () => void;
};

const FarmingTaskBottomPopup = ({taskInfo, onManagePress, onViewWorkPress, onMarkPress}: FarmingTaskBottomPopupProps) => {
  // 解构对象参数，设置默认值
  const {
    taskType = "犁地",
    taskStatus = "作业中",
    area = "20.2",
    operator = "张三",
    completedArea = "12.5",
    completedBlocks = 2,
    totalBlocks = 8,
  } = taskInfo || {};

  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <View style={styles.popupContainer}>
      <ExpandButton isExpanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)} />
      {isExpanded && (
        <View style={styles.container}>
          {/* 标题行 */}
          <View style={styles.headerRow}>
            <View style={styles.taskInfoWrapper}>
              <Text style={styles.taskTypeText}>{taskType}</Text>
              <Text style={styles.taskStatusText}>{taskStatus}</Text>
            </View>
            <Text style={styles.areaText}>
              {area}
              <Text style={styles.unitText}>亩</Text>
            </Text>
          </View>

          {/* 作业人 */}
          <View style={styles.operatorWrapper}>
            <Text style={styles.operatorText}>作业人：{operator}</Text>
          </View>

          {/* 进度区域 */}
          <View style={styles.progressRow}>
            <View style={styles.progressWrapper}>
              <Text style={styles.progressText}>
                已作业<Text style={{fontSize: 18, fontWeight: "500", color: "#F58700"}}>{completedArea}</Text>亩，完成地块
                <Text style={{fontSize: 18, fontWeight: "500", color: "#F58700"}}>
                  {completedBlocks}/{totalBlocks}
                </Text>
                个
              </Text>
            </View>
          </View>

          {/* 按钮栏 */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.buttonItem, styles.firstButton]} onPress={onManagePress}>
              <Text style={styles.buttonText}>农事管理</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.buttonItem, styles.middleButton]} onPress={onViewWorkPress}>
              <Text style={styles.buttonText}>作业数据</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.buttonItem, styles.lastButton]} onPress={onMarkPress}>
              <Text style={styles.buttonText}>标注地块</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  popupContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingVertical: 12,
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  taskInfoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  taskTypeText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
  },
  taskStatusText: {
    fontSize: 14,
    color: "#fff",
    backgroundColor: "#F58700",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  areaText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#F58700",
  },
  unitText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#F58700",
  },
  operatorWrapper: {
    paddingHorizontal: 16,
  },
  operatorText: {
    fontSize: 16,
    color: "rgba(0,0,0,0.65)",
    marginBottom: 8,
  },
  progressRow: {
    paddingHorizontal: 16,
  },
  progressWrapper: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 12,
    backgroundColor: "#FFF2E2",
  },
  progressText: {
    fontSize: 16,
    color: "rgba(0,0,0,0.65)",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F5F5F5",
  },
  buttonRow: {
    marginTop: 6,
    borderTopWidth: 1,
    padding: 16,
    borderTopColor: "#E5E5E5",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  buttonItem: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  firstButton: {
    backgroundColor: "#007AFF", // 农事管理
  },
  middleButton: {
    backgroundColor: "#FF9500", // 作业数据
  },
  lastButton: {
    backgroundColor: "#08AE3C", // 标注地块
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});

export default FarmingTaskBottomPopup;
