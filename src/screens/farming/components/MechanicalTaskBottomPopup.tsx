import React, {useState} from "react";
import {View, Text, StyleSheet, TouchableOpacity, GestureResponderEvent} from "react-native";

type MechanicalTaskBottomPopupProps = {
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

const MechanicalTaskBottomPopup = ({taskInfo, onManagePress, onViewWorkPress, onMarkPress}: MechanicalTaskBottomPopupProps) => {
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

  return (
    <View style={styles.popupContainer}>
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

        {/* 底部数据指标 */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>20-25cm</Text>
            <Text style={styles.metricValue}>深耕深度</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>25cm</Text>
            <Text style={styles.metricValue}>旋耕深度</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>30斤</Text>
            <Text style={styles.metricValue}>亩种用量</Text>
          </View>
        </View>
      </View>
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
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
    paddingVertical: 4,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: "#E5E5E5",
  },
  metricLabel: {
    fontSize: 18,
    color: "#333333",
    fontWeight: "500",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    color: "rgba(102,102,102,0.65)",
    fontWeight: "500",
  },
});

export default MechanicalTaskBottomPopup;
