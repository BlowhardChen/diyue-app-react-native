import ExpandButton from "@/screens/land/components/ExpandButton";
import {Global} from "@/styles/global";
import React, {useState} from "react";
import {View, Text, StyleSheet, TouchableOpacity, Image, ScrollView} from "react-native";

// 模拟数据
const dailyData = {
  date: "2025-08-23",
  summary: {
    acreage: "200亩",
    duration: "20h",
    plots: "10个",
  },
  records: [
    {
      id: 1,
      operator: "王五",
      acreage: "20.2亩",
      duration: "1h",
      time: "11:00",
      mapImg: "https://picsum.photos/80/80",
    },
    {
      id: 2,
      operator: "王五",
      acreage: "20.2亩",
      duration: "1h",
      time: "11:00",
      mapImg: "https://picsum.photos/80/80",
    },
    {
      id: 3,
      operator: "王五",
      acreage: "20.2亩",
      duration: "1h",
      time: "11:00",
      mapImg: "https://picsum.photos/80/80",
    },
  ],
};

const HistoryWorkDetailPopup = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  // 跳转历史作业详情
  const jumpHistoryWorkDetail = (type: "before" | "after", date: string) => {};

  return (
    <View style={styles.popupContainer}>
      <ExpandButton isExpanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)} />
      {isExpanded && (
        <View style={styles.container}>
          {/* 日期导航栏 */}
          <View style={styles.dateBar}>
            <TouchableOpacity style={styles.navBtn} onPress={() => jumpHistoryWorkDetail("before", dailyData.date)}>
              <Text style={styles.navTextGray}>前一天</Text>
            </TouchableOpacity>
            <Text style={styles.dateText}>{dailyData.date}</Text>
            <TouchableOpacity style={styles.navBtn} onPress={() => jumpHistoryWorkDetail("after", dailyData.date)}>
              <Text style={styles.navTextGreen}>后一天</Text>
            </TouchableOpacity>
          </View>

          {/* 汇总数据卡片 */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{dailyData.summary.acreage}</Text>
                <Text style={styles.summaryLabel}>作业亩数</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{dailyData.summary.duration}</Text>
                <Text style={styles.summaryLabel}>作业时长</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{dailyData.summary.plots}</Text>
                <Text style={styles.summaryLabel}>作业地块</Text>
              </View>
            </View>
          </View>

          {/* 作业记录列表 */}
          <ScrollView style={styles.recordList} showsVerticalScrollIndicator={false}>
            {dailyData.records.map(record => (
              <View key={record.id} style={styles.recordItem}>
                {/* 地块地图 */}
                <Image source={{uri: record.mapImg}} style={styles.mapImg} resizeMode="cover" />
                {/* 作业信息 */}
                <View style={styles.recordInfo}>
                  <View style={styles.recordInfoItem}>
                    <Text style={styles.operatorName}>{record.operator}</Text>
                    <Text style={styles.recordTime}>{record.time}</Text>
                  </View>
                  <View style={{flexDirection: "row", alignItems: "center"}}>
                    <Text style={styles.recordDetail}>
                      作业时长: <Text style={{color: "#000", fontWeight: "500"}}>{record.duration}</Text>
                    </Text>
                    <Text style={[styles.recordDetail, {marginLeft: 16}]}>
                      作业亩数: <Text style={{color: "#000", fontWeight: "500"}}>{record.acreage}</Text>
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
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
    elevation: 1,
  },
  dateBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  navBtn: {
    padding: 8,
  },
  navTextGray: {
    fontSize: 16,
    fontWeight: "400",
    color: Global.colors.primary,
  },
  navTextGreen: {
    fontSize: 16,
    fontWeight: "400",
    color: Global.colors.primary,
  },
  dateText: {
    fontSize: 20,
    color: "#000",
    fontWeight: "500",
  },
  summaryContainer: {
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#f5f5f5",
    paddingVertical: 10,
    borderRadius: 4,
  },
  summaryItem: {
    paddingHorizontal: 12,
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
  },
  recordList: {
    maxHeight: 300,
    marginTop: 10,
    paddingHorizontal: 16,
  },
  recordItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  mapImg: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordInfoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  operatorName: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
    marginBottom: 5,
  },
  recordDetail: {
    fontSize: 14,
    color: "#666",
  },
  recordTime: {
    fontSize: 14,
    color: "#999",
  },
});

export default HistoryWorkDetailPopup;
