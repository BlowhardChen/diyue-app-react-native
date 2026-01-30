import {Global} from "@/styles/global";
import {View, Text, StyleSheet, Image} from "react-native";

const OperationStatusCards = () => {
  const workIcon = require("@/assets/images/farming/icon-complete.png");
  const waitIcon = require("@/assets/images/farming/icon-wait.png");
  const statusData = [
    {
      id: 1,
      status: "已作业",
      statusColor: Global.colors.primary,
      bgColor: "#E9FCEF",
      icon: workIcon,
      plots: "16",
      acreage: "2000",
    },
    {
      id: 2,
      status: "未作业",
      statusColor: "#FF4E4C",
      bgColor: "#FFF2F2",
      icon: waitIcon,
      plots: "16",
      acreage: "2000",
    },
  ];
  return (
    <View style={styles.popupContainer}>
      <View style={styles.container}>
        {statusData.map(item => (
          <View key={item.id} style={[styles.statusCard, {backgroundColor: item.bgColor}]}>
            {/* 状态标签 */}
            <View style={[styles.statusBadge, {backgroundColor: item.statusColor}]}>
              <View style={styles.iconContainer}>
                <Image source={item.icon} style={styles.icon} />
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            {/* 统计信息 */}
            <Text style={styles.statText}>
              <Text style={{color: item.statusColor, fontWeight: "500"}}>{item.plots}</Text> 个地块，共{" "}
              <Text style={[styles.acreageText, {color: item.statusColor}]}>{item.acreage} 亩</Text>
            </Text>
          </View>
        ))}
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
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    elevation: 1,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 24,
    marginRight: 12,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 18,
    height: 18,
    marginRight: 4,
  },
  iconText: {
    color: "#fff",
    fontSize: 14,
    marginRight: 4,
  },
  statusText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  statText: {
    fontSize: 16,
    color: "#666",
  },
  acreageText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default OperationStatusCards;
