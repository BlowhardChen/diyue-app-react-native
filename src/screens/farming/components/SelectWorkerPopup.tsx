import React, {useEffect, useState} from "react";
import {View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ImageSourcePropType, ScrollView} from "react-native";
import {NavigationProp, useNavigation} from "@react-navigation/native";
import {updateStore} from "@/stores/updateStore";
import {RootStackParamList} from "@/types/navigation";
import {Global} from "@/styles/global";

const {width: screenWidth} = Dimensions.get("window");

interface ManageListType {
  name: string;
  type: string;
  icon: ImageSourcePropType;
}

interface LandManageProps {
  farmingInfo?: any;
  onClosePopup: (action?: string) => void;
}

const FarmingManagePopup: React.FC<LandManageProps> = ({farmingInfo, onClosePopup}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isShowPopup, setIsShowPopup] = useState(false);
  const [msgText, setMsgText] = useState("");
  const [rightBtnText, setRightBtnText] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");

  useEffect(() => {
    updateStore.setIsUpdateLand(false);
  }, []);

  const FarmingManageList: ManageListType[] = [
    {
      name: "李四",
      type: "editFarming",
      icon: require("@/assets/images/home/icon-edit.png"),
    },
    {
      name: "张三",
      type: "allocateFarming",
      icon: require("@/assets/images/home/icon-share.png"),
    },
    {
      name: "王五",
      type: "transferFarming",
      icon: require("@/assets/images/home/icon-transfer.png"),
    },
  ];

  const handleManage = (item: ManageListType) => {
    setSelectedType(item.type);
  };

  // 关闭弹窗
  const closePopup = () => {
    onClosePopup();
    setSelectedType("");
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
          {FarmingManageList.map((item, index) => {
            const isSelected = selectedType === item.type;
            return (
              <TouchableOpacity key={index} style={styles.manageItem} onPress={() => handleManage(item)} activeOpacity={0.8}>
                <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>{item.name}</Text>
                {isSelected && (
                  <Image source={require("@/assets/images/home/icon-select.png")} style={styles.itemIcon} resizeMode="contain" />
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
