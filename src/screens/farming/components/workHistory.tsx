import FarmingTimePicker from "@/components/common/FarmingTimePicker";
import {FarmStackParamList} from "@/types/navigation";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import React, {useState} from "react";
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Image} from "react-native";

// 模拟作业数据
const operationData = {
  // 汇总数据
  summary: {
    acreage: "200亩",
    duration: "20h",
    plots: "10个",
  },
  // 时间筛选
  dateRange: "2025.08.23～2025.10.30",
  // 历史作业列表
  historyList: [
    {
      date: "2025-08-23",
      duration: "8h",
      acreage: "200亩",
      plots: "2个",
    },
    {
      date: "2025-08-22",
      duration: "8h",
      acreage: "200亩",
      plots: "2个",
    },
    {
      date: "2025-08-21",
      duration: "8h",
      acreage: "200亩",
      plots: "2个",
    },
  ],
};

const workHistory = () => {
  const navigation = useNavigation<StackNavigationProp<FarmStackParamList>>();
  const [showDateFilterPopup, setShowDateFilterPopup] = useState(false);

  // 打开日期筛选弹窗
  const openDateFilterPopup = () => {
    console.log("打开日期筛选弹窗");
    setShowDateFilterPopup(true);
  };

  // 关闭日期筛选弹窗
  const closeDateFilterPopup = () => {
    setShowDateFilterPopup(false);
  };

  // 确认日期筛选
  const confirmDateFilter = (startTime: string, endTime: string) => {
    console.log("确认日期筛选：", startTime, endTime);
    setShowDateFilterPopup(false);
  };

  // 查看作业历史详情
  const viewHistoryDetail = () => {
    navigation.navigate("HistoryWorkDetail", {farmingId: ""});
  };
  return (
    <View style={styles.container}>
      {operationData ? (
        <>
          {/* 日期筛选栏 */}
          <TouchableOpacity style={styles.dateFilterBar} onPress={openDateFilterPopup}>
            <Text style={styles.dateRangeText}>{operationData.dateRange}</Text>
            <View style={styles.dropdownBtn}>
              <Image source={require("@/assets/images/farming/icon-down.png")} style={styles.dropdownIcon} resizeMode="contain" />
            </View>
          </TouchableOpacity>

          {/* 汇总数据卡片 */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{operationData.summary.acreage}</Text>
              <Text style={styles.summaryLabel}>作业亩数</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{operationData.summary.duration}</Text>
              <Text style={styles.summaryLabel}>作业时长</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{operationData.summary.plots}</Text>
              <Text style={styles.summaryLabel}>作业地块</Text>
            </View>
          </View>

          {/* 历史作业列表 */}
          <ScrollView style={styles.historyListContainer} showsVerticalScrollIndicator={false}>
            {operationData.historyList.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                {/* 时间轴线圆点 */}
                <View style={styles.timelineDot} />
                {/* 轴线竖线（最后一项不显示） */}
                {index !== operationData.historyList.length - 1 && <View style={styles.timelineLine} />}
                {/* 作业信息 */}
                <View style={styles.historyInfo}>
                  <TouchableOpacity style={styles.historyHeader} onPress={viewHistoryDetail}>
                    <Text style={styles.historyDate}>{item.date}</Text>
                    <View style={styles.arrowBtn}>
                      <Image
                        source={require("@/assets/images/common/icon-right-gray.png")}
                        style={styles.arrowIcon}
                        resizeMode="contain"
                      />
                    </View>
                  </TouchableOpacity>
                  <View style={styles.historyDetailContainer}>
                    <Text style={styles.historyDetail}>作业时长: </Text>
                    <Text style={styles.historyText}> {item.duration}</Text>
                    <Text style={styles.historyDetail}>作业亩数: </Text>
                    <Text style={styles.historyText}>{item.acreage}</Text>
                    <Text style={styles.historyDetail}>作业地块: </Text>
                    <Text style={styles.historyText}>{item.plots}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </>
      ) : (
        <View style={styles.noDataContainer}>
          <Image source={require("@/assets/images/common/contract-empty.png")} style={styles.noDataIcon} resizeMode="contain" />
          <Text style={styles.noDataText}>暂无数据</Text>
        </View>
      )}
      <FarmingTimePicker visible={showDateFilterPopup} onClose={closeDateFilterPopup} onConfirm={confirmDateFilter} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
  },
  dateFilterBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  dateRangeText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  dropdownBtn: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownIcon: {
    width: 16,
    height: 16,
  },
  summaryCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingVertical: 15,
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: "flex-start",
  },
  summaryValue: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "400",
  },
  historyListContainer: {
    height: 220,
  },
  historyItem: {
    flexDirection: "row",
    position: "relative",
  },
  timelineDot: {
    width: 12,
    height: 12,
    marginTop: 12,
    borderRadius: 6,
    backgroundColor: "#ccc",
    marginRight: 15,
    zIndex: 1,
  },
  timelineLine: {
    width: 0,
    height: "100%",
    borderLeftWidth: 1,
    borderStyle: "dashed",
    borderLeftColor: "#d4d4d4",
    position: "absolute",
    left: 5.5,
    top: 14,
  },
  historyInfo: {
    flex: 1,
    paddingBottom: 20,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  historyDate: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  arrowBtn: {
    padding: 4,
  },
  arrowIcon: {
    width: 16,
    height: 16,
  },
  historyDetailContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  historyDetail: {
    fontSize: 15,
    color: "#666",
  },
  historyText: {
    marginRight: 16,
    fontSize: 15,
    color: "#000",
    fontWeight: "500",
  },
  noDataContainer: {
    flex: 1,
    marginVertical: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataIcon: {
    width: 86,
    height: 84,
  },
  noDataText: {
    marginTop: 12,
    fontSize: 18,
    color: "#000000",
  },
});

export default workHistory;
