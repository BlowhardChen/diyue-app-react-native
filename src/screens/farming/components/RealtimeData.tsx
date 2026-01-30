import {Global} from "@/styles/global";
import {View, Text, StyleSheet} from "react-native";

// 生成实时数据组件
const RealtimeData = () => {
  // 实时数据列表
  const realTimeData = [
    {value: "1.2h", label: "作业时长"},
    {value: "1.2亩", label: "作业亩数"},
    {value: "3.5个", label: "作业地块"},
    {value: "1.2m/s", label: "实时速度"},
    {value: "5km", label: "作业距离"},
    {value: "4m", label: "作业高度"},
  ];

  // 自定义数据卡片组件
  const DataCard = ({value, label}: {value: string; label: string}) => {
    return (
      <View style={styles.cardContainer}>
        <Text style={styles.cardValue}>{value}</Text>
        <Text style={styles.cardLabel}>{label}</Text>
      </View>
    );
  };
  return (
    <View style={styles.contentContainer}>
      <View style={styles.dataGrid}>
        {realTimeData.map((item, index) => (
          <DataCard key={index} value={item.value} label={item.label} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    color: " rgba(102,102,102,0.65)",
    fontWeight: "500",
  },
});

export default RealtimeData;
