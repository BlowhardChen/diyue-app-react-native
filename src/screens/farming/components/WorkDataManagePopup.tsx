import ExpandButton from "@/screens/land/components/ExpandButton";
import {Global} from "@/styles/global";
import React, {useEffect, useState} from "react";
import {View, Text, StyleSheet, TouchableOpacity, Dimensions} from "react-native";
import RealtimeData from "./RealtimeData";
import WorkRequirement from "./workRequirement";
import DeviceParameter from "./DeviceParameter";
import WorkHistory from "./workHistory";

const WorkDataManagePopup = ({farmingId}: {farmingId: string}) => {
  // 标签栏状态管理
  const [activeTab, setActiveTab] = useState("实时数据");
  const [isExpanded, setIsExpanded] = useState(true);
  // 标签列表
  const tabs = ["实时数据", "作业要求", "设备参数", "作业历史"];

  useEffect(() => {
    getFarmingWorkingData();
  });

  // 获取农事作业数据
  const getFarmingWorkingData = async () => {};

  return (
    <View style={styles.popupContainer}>
      <ExpandButton isExpanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)} />
      {isExpanded && (
        <View style={styles.container}>
          {/* 标签栏 */}
          <View style={styles.tabBar}>
            {tabs.map(tab => (
              <TouchableOpacity key={tab} style={[styles.tabItem]} onPress={() => setActiveTab(tab)}>
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                {activeTab === tab && (
                  <View style={[styles.activeTabIndicator, activeTab === tab && styles.activeTabIndicator]}></View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          {/* 实时数据 */}
          {activeTab === "实时数据" && <RealtimeData />}
          {/* 作业要求 */}
          {activeTab === "作业要求" && <WorkRequirement />}
          {/* 设备参数 */}
          {activeTab === "设备参数" && <DeviceParameter />}
          {/* 作业历史 */}
          {activeTab === "作业历史" && <WorkHistory />}
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
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    backgroundColor: "#fff",
  },
  tabItem: {
    flex: 1,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Global.colors.primary,
  },
  activeTabIndicator: {
    position: "absolute",
    bottom: 0,
    width: "75%",
    height: 3,
    backgroundColor: Global.colors.primary,
  },
  tabText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "400",
  },
  activeTabText: {
    color: Global.colors.primary,
    fontWeight: "500",
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    paddingBottom: 0,
  },
  dataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardContainer: {
    width: "31%",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    marginBottom: 5,
  },
  cardLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
});

export default WorkDataManagePopup;
