import React, {useState} from "react";
import {View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Alert, ImageSourcePropType} from "react-native";
import {NavigationProp, useNavigation} from "@react-navigation/native";
import {deleteLand, quitLand, removeLand} from "@/services/land";
import Popup from "@/components/common/Popup";
import {showCustomToast} from "@/components/common/CustomToast";

const {width: screenWidth} = Dimensions.get("window");

interface ManageListType {
  name: string;
  type: string;
  icon: ImageSourcePropType;
}

interface LandManageProps {
  landInfo: any;
  onClosePopup: (action?: string, id?: string) => void;
  onEditLandName: () => void;
}

type LandStackParamList = {
  QuitLand: undefined;
  MergeLand: {id: string};
  SelectLand: {type: string};
};

const LandManage: React.FC<LandManageProps> = ({landInfo, onClosePopup, onEditLandName}) => {
  const navigation = useNavigation<NavigationProp<LandStackParamList>>();
  const [isShowPopup, setIsShowPopup] = useState(false);
  const [msgText, setMsgText] = useState("");
  const [rightBtnText, setRightBtnText] = useState("");

  // 单个地块
  const singleLandManageList: ManageListType[] = [
    {
      name: "显示退地地块",
      type: "showQuitLand",
      icon: require("@/assets/images/home/icon-view.png"),
    },
    {
      name: "合并地块",
      type: "mergeLand",
      icon: require("@/assets/images/home/icon-merge.png"),
    },
    {
      name: "转移地块",
      type: "transferLand",
      icon: require("@/assets/images/home/icon-transfer.png"),
    },
    {
      name: "退地",
      type: "quitLand",
      icon: require("@/assets/images/home/icon-quit.png"),
    },
    {
      name: "删除",
      type: "deleteLand",
      icon: require("@/assets/images/home/icon-delete.png"),
    },
  ];

  // 合并地块
  const mergeLandManageList: ManageListType[] = [
    {
      name: "显示退地地块",
      type: "showQuitLand",
      icon: require("@/assets/images/home/icon-view.png"),
    },
    {
      name: "查看合并小地块",
      type: "showMergeLand",
      icon: require("@/assets/images/home/icon-view.png"),
    },
    {
      name: "修改地块名称",
      type: "editLandName",
      icon: require("@/assets/images/home/icon-edit.png"),
    },
    {
      name: "合并地块",
      type: "mergeLand",
      icon: require("@/assets/images/home/icon-merge.png"),
    },
    {
      name: "转移地块",
      type: "transferLand",
      icon: require("@/assets/images/home/icon-transfer.png"),
    },
  ];

  // 合并地块下单个地块
  const mergeLandSingleManageList: ManageListType[] = [
    {
      name: "转移地块",
      type: "transferLand",
      icon: require("@/assets/images/home/icon-transfer.png"),
    },
    {
      name: "退地",
      type: "quitLand",
      icon: require("@/assets/images/home/icon-quit.png"),
    },
    {
      name: "移出地块",
      type: "removeLand",
      icon: require("@/assets/images/home/icon-remove.png"),
    },
    {
      name: "删除",
      type: "deleteLand",
      icon: require("@/assets/images/home/icon-delete.png"),
    },
  ];

  const ManageList = [singleLandManageList, mergeLandManageList, singleLandManageList, mergeLandSingleManageList];

  // 处理管理操作
  const handleManage = (item: ManageListType) => {
    console.log("handleManage", item);
    switch (item.type) {
      case "showQuitLand":
        navigation.navigate("QuitLand");
        closePopup();
        break;
      case "showMergeLand":
        closePopup();
        navigation.navigate("MergeLand", {id: landInfo.id});
        break;
      case "editLandName":
        onEditLandName();
        break;
      case "mergeLand":
        closePopup();
        navigation.navigate("SelectLand", {type: "merge"});
        break;
      case "transferLand":
        closePopup();
        navigation.navigate("SelectLand", {type: "transfer"});
        break;
      case "quitLand":
        clickQuitLand();
        break;
      case "removeLand":
        clickRemoveLand();
        break;
      case "deleteLand":
        clickDeleteLand();
        break;
      default:
        break;
    }
  };

  // 关闭弹窗
  const closePopup = () => {
    onClosePopup();
  };

  // 删除地块
  const clickDeleteLand = () => {
    setRightBtnText("删除");
    setMsgText("删除后地块信息以及地块坐标将无法恢复，请确认是否删除？");
    setIsShowPopup(true);
  };

  // 退地
  const clickQuitLand = () => {
    setRightBtnText("退地");
    setMsgText("退地后，地块坐标以及地块信息等将会保留，请确认是否退地？");
    setIsShowPopup(true);
  };

  // 移出地块
  const clickRemoveLand = () => {
    setRightBtnText("移出");
    setMsgText("移出后，地块移出后将从合并地块中移出，请确认是否移出？");
    setIsShowPopup(true);
  };

  // 确认操作
  const popupCancel = () => {
    setIsShowPopup(false);
  };

  // 确认操作
  const popupConfirm = () => {
    switch (rightBtnText) {
      case "删除":
        deleteLandFun();
        break;
      case "退地":
        quitLandFun();
        break;
      case "移出":
        removeLandFun();
        break;
    }
  };

  // 删除地块
  const deleteLandFun = async () => {
    try {
      await deleteLand(landInfo.id);
      setIsShowPopup(false);
      console.log("删除地块成功", landInfo.id);
      onClosePopup("delete", landInfo.id);
    } catch (error: any) {
      showCustomToast("error", error.data?.msg ?? "删除地块失败,请重试");
      setIsShowPopup(false);
    }
  };

  // 退地
  const quitLandFun = async () => {
    try {
      await quitLand({id: landInfo.id, type: landInfo.type});
      setIsShowPopup(false);
      onClosePopup("quit", landInfo.id);
    } catch (error: any) {
      showCustomToast("error", error.data?.msg ?? "退地块失败,请重试");
      setIsShowPopup(false);
    }
  };

  // 移出地块
  const removeLandFun = async () => {
    try {
      await removeLand({landId: landInfo.id, mergeLandId: landInfo.mergeLandId});
      setIsShowPopup(false);
      onClosePopup("remove", landInfo.id);
    } catch (error: any) {
      showCustomToast("error", error.data?.msg ?? "移出地块失败,请重试");
      setIsShowPopup(false);
    }
  };

  return (
    <>
      {/* 背景遮罩 */}
      <TouchableOpacity style={styles.mask} />

      {/* 主弹窗 */}
      <View style={styles.landManagePopup}>
        {/* 顶部 */}
        <View style={styles.popupHeader}>
          <View style={styles.headerBack} />
          <Text style={styles.headerTitle}>地块管理</Text>
          <TouchableOpacity style={styles.headerClose} onPress={closePopup}>
            <Image source={require("@/assets/images/home/icon-close.png")} style={styles.closeIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* 内容区 */}
        <View style={styles.manageBox}>
          {ManageList[landInfo?.type || 0].map((item, index) => (
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
  landManagePopup: {
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
  },
});

export default LandManage;
