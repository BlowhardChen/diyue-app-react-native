import ExpandButton from "@/screens/land/components/ExpandButton";
import {FarmingMapDetailInfoData} from "@/types/farming";
import React, {useState} from "react";
import {View, Text, StyleSheet, TouchableOpacity} from "react-native";

type FarmingTaskBottomPopupProps = {
  farmingDetailInfo: FarmingMapDetailInfoData;
  onManagePress: () => void;
  onViewWorkPress: () => void;
  onMarkPress: () => void;
};

const FarmingTaskBottomPopup = ({
  farmingDetailInfo,
  onManagePress,
  onViewWorkPress,
  onMarkPress,
}: FarmingTaskBottomPopupProps) => {
  const {farmingTypeName, totalLandCount, workLandCount, status, totalArea, userVos, workArea} = farmingDetailInfo || {};

  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <View style={styles.popupContainer}>
      <ExpandButton isExpanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)} />
      {isExpanded && (
        <View style={styles.container}>
          {/* 标题行 */}
          <View style={styles.headerRow}>
            <View style={styles.farmingDetailInfoWrapper}>
              <Text style={styles.farmingTypeNameText}>{farmingTypeName}</Text>
              <Text style={[styles.workStatusText, {backgroundColor: status === "0" ? "#F58700" : "#08AE3C"}]}>
                {status === "0" ? "作业中" : "已完成"}
              </Text>
            </View>
            <Text style={[styles.areaText, {color: status === "0" ? "#F58700" : "#08AE3C"}]}>
              {totalArea}
              <Text style={[styles.unitText, {color: status === "0" ? "#F58700" : "#08AE3C"}]}>亩</Text>
            </Text>
          </View>

          {/* 作业人 */}
          <View style={styles.operatorWrapper}>
            <Text style={styles.operatorText}>
              作业人：
              {userVos?.length > 0 ? userVos.map(item => (item.userName ? item.userName : item.mobile)).join("、") : "暂无作业人"}
            </Text>
          </View>

          {/* 进度区域 */}
          <View style={styles.progressRow}>
            <View style={[styles.progressWrapper, {backgroundColor: status === "0" ? "#FFF2E2" : "#EBFBF0"}]}>
              <Text style={styles.progressText}>
                已作业
                <Text style={{fontSize: 18, fontWeight: "500", color: status === "0" ? "#F58700" : "#08AE3C"}}>
                  {workArea ?? "0"}
                </Text>
                亩，完成地块
                <Text style={{fontSize: 18, fontWeight: "500", color: status === "0" ? "#F58700" : "#08AE3C"}}>
                  {workLandCount ?? "0"}/{totalLandCount}
                </Text>
                个
              </Text>
            </View>
          </View>

          {/* 按钮栏 */}
          <View style={styles.buttonRow}>
            {status === "0" && (
              <TouchableOpacity style={[styles.buttonItem, styles.firstButton]} onPress={onManagePress}>
                <Text style={styles.buttonText}>农事管理</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.buttonItem, styles.middleButton, {backgroundColor: status === "0" ? "#F58700" : "#08AE3C"}]}
              onPress={onViewWorkPress}>
              <Text style={styles.buttonText}>作业数据</Text>
            </TouchableOpacity>
            {status === "0" && (
              <TouchableOpacity style={[styles.buttonItem, styles.lastButton]} onPress={onMarkPress}>
                <Text style={styles.buttonText}>标注地块</Text>
              </TouchableOpacity>
            )}
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
  farmingDetailInfoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  farmingTypeNameText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
  },
  workStatusText: {
    fontSize: 14,
    color: "#fff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  areaText: {
    fontSize: 20,
    fontWeight: "500",
  },
  unitText: {
    fontSize: 14,
    fontWeight: "500",
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
    backgroundColor: "#007AFF",
  },
  middleButton: {
    backgroundColor: "#FF9500",
  },
  lastButton: {
    backgroundColor: "#08AE3C",
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});

export default FarmingTaskBottomPopup;
