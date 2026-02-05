import {Global} from "@/styles/global";
import {FarmingLandListItem} from "@/types/farming";
import {useEffect, useState} from "react";
import {View, Text, StyleSheet, Image} from "react-native";

export type LandMarkProps = {
  farmingData: FarmingLandListItem[];
};
const LandMarkScreenPopup: React.FC<LandMarkProps> = ({farmingData}) => {
  const workIcon = require("@/assets/images/farming/icon-complete.png");
  const waitIcon = require("@/assets/images/farming/icon-wait.png");
  const [completedFarmingLands, setCompletedFarmingLands] = useState<FarmingLandListItem[]>([]);
  const [waitingFarmingLands, setWaitingFarmingLands] = useState<FarmingLandListItem[]>([]);

  useEffect(() => {
    console.log("LandMarkScreenPopup:farmingData", farmingData);
    const completed = farmingData.filter(item => item.landStatus === "1");
    const waiting = farmingData.filter(item => item.landStatus !== "1");
    setCompletedFarmingLands(completed);
    setWaitingFarmingLands(waiting);
  }, [farmingData]);

  // 计算地块亩数之和
  const calculateTotalArea = (land: FarmingLandListItem[]) => {
    return Number(land.reduce((total, item) => total + Number(item.actualAcreNum || 0), 0).toFixed(2));
  };

  return (
    <View style={styles.popupContainer}>
      <View style={styles.container}>
        <View style={[styles.statusCard, {backgroundColor: "#E9FCEF"}]}>
          {/* 状态标签 */}
          <View style={[styles.statusBadge, {backgroundColor: Global.colors.primary}]}>
            <View style={styles.iconContainer}>
              <Image source={workIcon} style={styles.icon} />
              <Text style={styles.statusText}>已作业</Text>
            </View>
          </View>
          {/* 统计信息 */}
          <Text style={styles.statText}>
            <Text style={{color: Global.colors.primary, fontWeight: "500"}}>{completedFarmingLands.length}</Text> 个地块，共{" "}
            <Text style={[styles.acreageText, {color: Global.colors.primary}]}>
              {calculateTotalArea(completedFarmingLands)} 亩
            </Text>
          </Text>
        </View>
        <View style={[styles.statusCard, {backgroundColor: "#FFF2F2"}]}>
          {/* 状态标签 */}
          <View style={[styles.statusBadge, {backgroundColor: "#FF4E4C"}]}>
            <View style={styles.iconContainer}>
              <Image source={waitIcon} style={styles.icon} />
              <Text style={styles.statusText}>未作业</Text>
            </View>
          </View>
          {/* 统计信息 */}
          <Text style={styles.statText}>
            <Text style={{color: "#FF4E4C", fontWeight: "500"}}>{waitingFarmingLands.length}</Text> 个地块，共{" "}
            <Text style={[styles.acreageText, {color: "#FF4E4C"}]}>{calculateTotalArea(waitingFarmingLands)} 亩</Text>
          </Text>
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

export default LandMarkScreenPopup;
