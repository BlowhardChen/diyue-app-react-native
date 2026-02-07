import React, {useEffect, useState} from "react";
import {View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ImageSourcePropType, ScrollView} from "react-native";
import {Global} from "@/styles/global";

const {width: screenWidth} = Dimensions.get("window");

interface LandManageProps {
  farmingInfo: {farmingId: string; workUsers: {userName: string; userId: string}[]};
  onSelectWorker: (item: {userName: string; userId: string}) => void;
  onClosePopup: () => void;
}

const FarmingManagePopup: React.FC<LandManageProps> = ({farmingInfo, onClosePopup, onSelectWorker}) => {
  const {farmingId, workUsers} = farmingInfo;
  const [selectedWorker, setSelectedWorker] = useState<string>("");

  useEffect(() => {
    setSelectedWorker(workUsers[0]?.userId);
  }, [workUsers]);

  // 处理选择作业人
  const handleSelectWorker = (item: {userName: string; userId: string}) => {
    setSelectedWorker(item.userId);
    onSelectWorker(item);
  };

  // 关闭弹窗
  const closePopup = () => {
    onClosePopup();
    setSelectedWorker("");
  };

  return (
    <>
      <TouchableOpacity style={styles.mask} onPress={closePopup} activeOpacity={1} />

      {/* 主弹窗 */}
      <View style={styles.farmingManagePopup}>
        {/* 顶部 */}
        <View style={styles.popupHeader}>
          <View style={styles.headerBack} />
          <Text style={styles.headerTitle}>选择作业人</Text>
          <TouchableOpacity style={styles.headerClose} onPress={closePopup}>
            <Image source={require("@/assets/images/home/icon-close.png")} style={styles.closeIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* 内容区 */}
        <ScrollView style={styles.manageBox}>
          {workUsers &&
            workUsers?.map((item, index) => {
              const isSelected = selectedWorker === item.userId;
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.manageItem}
                  onPress={() => handleSelectWorker(item)}
                  activeOpacity={0.8}>
                  <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>{item.userName}</Text>
                  {isSelected && (
                    <Image
                      source={require("@/assets/images/home/icon-select.png")}
                      style={styles.itemIcon}
                      resizeMode="contain"
                    />
                  )}
                </TouchableOpacity>
              );
            })}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  mask: {
    position: "absolute",
    top: 0,
    left: 0,
    width: screenWidth,
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 2000,
  },
  farmingManagePopup: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: screenWidth,
    padding: 16,
    paddingTop: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 2001,
  },
  popupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 26,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
  },
  headerBack: {
    width: 26,
    height: 26,
  },
  headerClose: {
    width: 26,
    height: 26,
  },
  closeIcon: {
    width: "100%",
    height: "100%",
  },
  manageBox: {
    marginTop: 8,
  },
  manageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    paddingLeft: 16,
    borderRadius: 4,
  },
  itemIcon: {
    width: 26,
    height: 26,
  },
  itemText: {
    fontSize: 18,
    color: "#000",
    fontWeight: "500",
  },
  itemTextSelected: {
    fontSize: 18,
    color: Global.colors.primary,
    fontWeight: "500",
  },
});

export default FarmingManagePopup;
