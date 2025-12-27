// 异常记录
import React, {useState, useEffect} from "react";
import {View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {patrolTaskExceptionList} from "@/services/farming";
import CustomStatusBar from "@/components/common/CustomStatusBar";
import {StackNavigationProp} from "@react-navigation/stack";
import {PatrolParamList} from "@/types/navigation";
import {showCustomToast} from "@/components/common/CustomToast";
import {Global} from "@/styles/global";

// 获取屏幕高度
const {height: SCREEN_HEIGHT} = Dimensions.get("window");

const AbnormalRecordScreen = () => {
  const navigation = useNavigation<StackNavigationProp<PatrolParamList>>();
  const [abnormalRecordList, setAbnormalRecordList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 返回
  const backView = () => {
    navigation.goBack();
  };

  // 查看异常记录详情
  const viewAbnormalDetail = (item: any) => {
    navigation.navigate("AbnormalDetail", {id: item.taskLogId});
  };

  // 格式化异常情况
  const formatAbnormal = (abnormals: any[]): string => {
    if (!abnormals || abnormals.length === 0) return "";
    const result = abnormals.map(item => item.dictLabel).join("、");
    return result;
  };

  // 获取异常记录列表
  const getAbnormalRecordList = async () => {
    try {
      setLoading(true);
      const {data} = await patrolTaskExceptionList();
      setAbnormalRecordList(data || []);
    } catch (error) {
      showCustomToast("error", "获取巡田记录失败");
      setAbnormalRecordList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAbnormalRecordList();
  }, []);

  // 渲染内容区域（加载中/有数据/无数据）
  const renderContent = () => {
    // 加载中状态
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Global.colors.primary} />
          <Text style={styles.loadingText}>正在加载异常记录...</Text>
        </View>
      );
    }

    // 有数据状态
    if (abnormalRecordList.length > 0) {
      return (
        <ScrollView style={styles.recordBox} showsVerticalScrollIndicator={false}>
          <View style={styles.recordList}>
            {abnormalRecordList.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recordListItem}
                onPress={() => viewAbnormalDetail(item)}
                activeOpacity={0.9}>
                {/* 左侧图标 */}
                <View style={styles.itemLeft}>
                  <Image
                    source={require("@/assets/images/farming/icon-error.png")}
                    style={styles.errorIcon}
                    resizeMode="contain"
                  />
                </View>

                {/* 中间内容 */}
                <View style={styles.itemRight}>
                  <Text style={styles.title}>{item.taskName ? item.taskName : "主动上报"}</Text>

                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>异常状况：</Text>
                    <Text style={[styles.infoText, styles.abnormalText]} numberOfLines={1}>
                      {formatAbnormal(item.exceptionReportList)}
                    </Text>
                  </View>

                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>上报时间：</Text>
                    <Text style={styles.infoValue}>{item.createTime}</Text>
                  </View>

                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>具体位置：</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {item.location || "暂无"}
                    </Text>
                  </View>
                </View>

                {/* 右侧箭头 */}
                <View style={styles.itemIcon}>
                  <Image
                    source={require("@/assets/images/common/icon-right.png")}
                    style={styles.rightIcon}
                    resizeMode="contain"
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      );
    }

    // 无数据状态（仅当加载完成且数据为空时显示）
    return (
      <View style={styles.noDataContainer}>
        <Image source={require("@/assets/images/common/contract-empty.png")} style={styles.noDataIcon} resizeMode="contain" />
        <Text style={styles.noDataText}>暂无数据</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 导航栏组件 */}
      <CustomStatusBar navTitle="异常记录" onBack={backView} />

      {/* 记录列表容器  */}
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6f8",
    height: SCREEN_HEIGHT,
  },
  recordBox: {
    flex: 1,
    height: SCREEN_HEIGHT * 0.9,
    backgroundColor: "#f5f6f8",
  },
  recordList: {
    marginTop: 8,
    backgroundColor: "#ffffff",
  },
  recordListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 118,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  itemLeft: {
    width: 40,
    height: 40,
  },
  errorIcon: {
    width: 40,
    height: 40,
  },
  itemRight: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000000",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: "rgba(0, 0, 0, 0.65)",
  },
  infoText: {
    maxWidth: 190,
    fontSize: 14,
  },
  abnormalText: {
    color: "#ff4d4f",
  },
  infoValue: {
    fontSize: 14,
    color: "#000000",
    flex: 1,
  },
  itemIcon: {
    width: 26,
    height: 26,
  },
  rightIcon: {
    width: 26,
    height: 26,
  },
  noDataContainer: {
    flex: 1,
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
    color: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
});

export default AbnormalRecordScreen;
