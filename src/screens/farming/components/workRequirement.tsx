import {Global} from "@/styles/global";
import React from "react";
import {View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Dimensions} from "react-native";

// 获取屏幕宽度
const {width: screenWidth} = Dimensions.get("window");

// 作业要求数据定义
const operationRequirements = {
  // 扩展表头（模拟6列）
  tableHeads: ["农资名称", "每亩用量", "任务亩数", "农资总量", "使用时段", "作业标准"],
  // 农资用量表格数据（匹配扩展表头）
  pesticideData: [
    {
      name: "25%吡唑醚菌酯",
      perAcre: "20克",
      taskAcre: "12亩",
      total: "1.5kg",
      time: "上午8-10点",
      standard: "均匀喷洒",
    },
    {
      name: "25%吡唑醚菌酯",
      perAcre: "20克",
      taskAcre: "12亩",
      total: "1.5kg",
      time: "上午8-10点",
      standard: "均匀喷洒",
    },
    {
      name: "水",
      perAcre: "20升",
      taskAcre: "12亩",
      total: "120升",
      time: "上午8-10点",
      standard: "无",
    },
  ],
};

const workRequirement = () => {
  return (
    <View style={styles.container}>
      {operationRequirements ? (
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.titleRow}>
            <View style={styles.titleLeft}>
              <View style={styles.greenBar} />
              <Text style={styles.mainTitle}>农资用量</Text>
            </View>
            <TouchableOpacity style={styles.usageBtn}>
              <Text style={styles.usageBtnText}>用量分布</Text>
              <Image source={require("@/assets/images/common/icon-right-green.png")} style={styles.iconImage} />
            </TouchableOpacity>
          </View>

          <View style={styles.tableHorizontalWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={true} decelerationRate="fast">
              <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                  {operationRequirements.tableHeads.map((head, index) => (
                    <Text key={index} style={styles.tableHeaderText}>
                      {head}
                    </Text>
                  ))}
                </View>
                {operationRequirements.pesticideData.map((item, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCellText}>{item.name}</Text>
                    <Text style={styles.tableCellText}>{item.perAcre}</Text>
                    <Text style={styles.tableCellText}>{item.taskAcre}</Text>
                    <Text style={styles.tableCellText}>{item.total}</Text>
                    <Text style={styles.tableCellText}>{item.time}</Text>
                    <Text style={styles.tableCellText}>{item.standard}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.otherRequirements}>
            <View style={{flexDirection: "row", alignItems: "center"}}>
              <View style={styles.greenBar} />
              <Text style={styles.mainTitle}>其他要求</Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.noDataContainer}>
          <Image source={require("@/assets/images/common/contract-empty.png")} style={styles.noDataIcon} resizeMode="contain" />
          <Text style={styles.noDataText}>暂无数据</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 15,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  titleLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  greenBar: {
    width: 4,
    height: 16,
    backgroundColor: Global.colors.primary,
    marginRight: 6,
  },
  mainTitle: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  usageBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  usageBtnText: {
    fontSize: 16,
    fontWeight: "400",
    color: Global.colors.primary,
  },
  iconImage: {
    width: 20,
    height: 20,
  },
  tableHorizontalWrapper: {
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
    marginBottom: 20,
    minHeight: 100,
  },
  tableContainer: {
    width: screenWidth + 200,
    paddingBottom: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#eee",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tableHeaderText: {
    width: 120,
    textAlign: "center",
    fontSize: 14,
    color: "#333",
    fontWeight: "400",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tableCellText: {
    width: 120,
    textAlign: "center",
    fontSize: 14,
    color: "#666",
  },
  otherRequirements: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
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

export default workRequirement;
