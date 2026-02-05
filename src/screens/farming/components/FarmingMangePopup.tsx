import React, {useEffect, useState} from "react";
import {View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ImageSourcePropType} from "react-native";
import {NavigationProp, useNavigation} from "@react-navigation/native";
import Popup from "@/components/common/Popup";
import {updateStore} from "@/stores/updateStore";
import {RootStackParamList} from "@/types/navigation";
import {completeFarming} from "@/services/farming";
import {showCustomToast} from "@/components/common/CustomToast";

const {width: screenWidth} = Dimensions.get("window");

interface ManageListType {
  name: string;
  type: string;
  icon: ImageSourcePropType;
}

interface LandManageProps {
  farmingInfo: any;
  onClosePopup: (action?: string) => void;
}

const FarmingManagePopup: React.FC<LandManageProps> = ({farmingInfo, onClosePopup}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isShowPopup, setIsShowPopup] = useState(false);
  const [msgText, setMsgText] = useState("");
  const [rightBtnText, setRightBtnText] = useState("");

  useEffect(() => {
    updateStore.setIsUpdateLand(false);
  }, []);

  const FarmingManageList: ManageListType[] = [
    {
      name: "编辑农事",
      type: "editFarming",
      icon: require("@/assets/images/home/icon-edit.png"),
    },
    {
      name: "分配农事",
      type: "allocateFarming",
      icon: require("@/assets/images/home/icon-share.png"),
    },
    {
      name: "转移农事",
      type: "transferFarming",
      icon: require("@/assets/images/home/icon-transfer.png"),
    },
    {
      name: "完成农事",
      type: "completeFarming",
      icon: require("@/assets/images/home/icon-complete.png"),
    },
  ];

  // 处理管理操作
  const handleManage = (item: ManageListType) => {
    switch (item.type) {
      case "editFarming":
        navigation.navigate("AddFarming", {id: farmingInfo.farmingJoinTypeId, farmingId: farmingInfo.farmingId});
        break;
      case "allocateFarming":
        navigation.navigate("AllocateFarming", {farmingId: farmingInfo.farmingJoinTypeId});
        break;
      case "transferFarming":
        navigation.navigate("TransferFarming", {farmingId: farmingInfo.farmingJoinTypeId});
        break;
      case "completeFarming":
        setIsShowPopup(true);
        setMsgText("确认完成农事吗？");
        setRightBtnText("完成");
        break;
      default:
        break;
    }
  };

  // 关闭弹窗
  const closePopup = () => {
    onClosePopup();
  };

  // 取消操作
  const popupCancel = () => {
    setIsShowPopup(false);
  };

  // 确认操作
  const popupConfirm = async () => {
    try {
      await completeFarming({id: farmingInfo.farmingJoinTypeId});
      setIsShowPopup(false);
      updateStore.triggerFarmingRefresh();
      onClosePopup("completeFarming");
    } catch (error: any) {
      showCustomToast("error", error.data.message ?? "操作失败，请重试");
    } finally {
      setIsShowPopup(false);
    }
  };

  return (
    <>
      {/* 背景遮罩 */}
      <TouchableOpacity style={styles.mask} />

      {/* 主弹窗 */}
      <View style={styles.farmingManagePopup}>
        {/* 顶部 */}
        <View style={styles.popupHeader}>
          <View style={styles.headerBack} />
          <Text style={styles.headerTitle}>农事管理</Text>
          <TouchableOpacity style={styles.headerClose} onPress={closePopup}>
            <Image source={require("@/assets/images/home/icon-close.png")} style={styles.closeIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* 内容区 */}
        <View style={styles.manageBox}>
          {FarmingManageList.map((item, index) => (
            <TouchableOpacity key={index} style={styles.manageItem} onPress={() => handleManage(item)}>
              <Image source={item.icon} style={styles.itemIcon} resizeMode="contain" />
              <Text style={styles.itemText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <Popup
        visible={isShowPopup}
        title="提示"
        msgText={msgText}
        leftBtnText="取消"
        rightBtnStyle={{color: "#ff563a"}}
        rightBtnText={rightBtnText}
        onLeftBtn={popupCancel}
        onRightBtn={popupConfirm}
      />
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
    padding: 20,
    paddingTop: 20,
    backgroundColor: "#f5f6f8",
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
    alignItems: "center",
    padding: 12,
    paddingLeft: 16,
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  itemIcon: {
    width: 40,
    height: 40,
    marginRight: 16,
  },
  itemText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
});

export default FarmingManagePopup;
