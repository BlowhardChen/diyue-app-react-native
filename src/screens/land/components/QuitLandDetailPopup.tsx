import React, {useState} from "react";
import {View, Text, Image, TouchableOpacity, Linking} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {LandDetailInfo} from "@/types/land";
import {showCustomToast} from "@/components/common/CustomToast";
import {LandDetailsPopupStyles} from "./styles/LandDetailsPopup";
import Popup from "@/components/common/Popup";
import {Global} from "@/styles/global";
import {deleteLand, restoreLand} from "@/services/land";

interface Props {
  landInfo: LandDetailInfo;
  onClose: (action?: string, id?: string) => void;
}

const LandDetailsPopup: React.FC<Props> = ({landInfo, onClose}) => {
  const navigation = useNavigation();
  const [isShowPopup, setIsShowPopup] = useState(false);
  const [msgText, setMsgText] = useState("");
  const [rightBtnText, setRightBtnText] = useState("删除");
  const [isExpanded, setIsExpanded] = useState(true);
  const rightBtnStyle = rightBtnText === "删除" ? {color: "#ff563a"} : {color: Global.colors.primary};

  const backView = () => {
    navigation.goBack();
  };

  // 关闭弹窗
  const closePopup = (action: string, id?: string) => {
    onClose(action, id);
  };

  // 切换展开/收起
  const onToggle = () => {
    setIsExpanded(!isExpanded);
  };

  // 关闭弹窗
  const onClosePopup = () => {
    onClose("close");
  };

  // 拨打电话
  const callPhone = (tel?: string) => {
    if (!tel) return;
    Linking.openURL(`tel:${tel}`);
  };

  // 删除地块
  const onDeleteLand = () => {
    setRightBtnText("删除");
    setMsgText("删除后地块信息以及地块坐标将无法恢复，请确认是否删除？");
    setIsShowPopup(true);
  };

  // 恢复地块
  const onRestoreLand = () => {
    setRightBtnText("恢复");
    setMsgText("请确认是否恢复地块？");
    setIsShowPopup(true);
  };

  // 弹窗取消
  const popupCancel = () => {
    setIsShowPopup(false);
  };

  // 弹窗确认
  const popupConfirm = () => {
    if (rightBtnText === "删除") {
      deleteLandFun();
    } else {
      restoreLandFun();
    }
  };

  // 删除地块API调用
  const deleteLandFun = async () => {
    try {
      await deleteLand(landInfo.id);
      setIsShowPopup(false);
      closePopup("delete", landInfo.id);
    } catch (error: any) {
      showCustomToast("error", error.data?.msg || "删除地块失败");
      setIsShowPopup(false);
    }
  };

  // 恢复地块API调用
  const restoreLandFun = async () => {
    try {
      await restoreLand(landInfo.id);
      setIsShowPopup(false);
      closePopup("restore", landInfo.id);
    } catch (error: any) {
      showCustomToast("error", error.data?.msg || "恢复地块失败");
      setIsShowPopup(false);
    }
  };

  // 替换敏感信息中间字符为*
  const replaceKeywords = (param?: string) => {
    if (!param) return "未知";
    return param.replace(/^(.{6})(?:\d+)(.{4})$/, "$1******$2");
  };

  return (
    <View style={LandDetailsPopupStyles.container}>
      {/* 展开/收起按钮 */}
      <TouchableOpacity style={LandDetailsPopupStyles.expand} onPress={onToggle}>
        <Image
          source={isExpanded ? require("@/assets/images/common/icon-down.png") : require("@/assets/images/common/icon-up.png")}
          style={LandDetailsPopupStyles.iconImg}
        />
      </TouchableOpacity>
      {/* 头部导航 */}
      <View style={LandDetailsPopupStyles.header}>
        <TouchableOpacity onPress={onClosePopup}>
          <Image source={require("@/assets/images/common/icon-back.png")} style={LandDetailsPopupStyles.iconBtn} />
        </TouchableOpacity>
        <Text style={LandDetailsPopupStyles.headerTitle}>地块详情</Text>
        <TouchableOpacity onPress={onClosePopup}>
          <Image source={require("@/assets/images/common/icon-close.png")} style={LandDetailsPopupStyles.iconBtn} />
        </TouchableOpacity>
      </View>
      {/* 基础信息 */}
      <View>
        {/* 地块基本信息头部 */}
        <View
          style={[
            LandDetailsPopupStyles.infoLand,
            {
              backgroundColor: "#FFEBEB",
            },
          ]}>
          <View style={LandDetailsPopupStyles.landInfo}>
            <Text style={LandDetailsPopupStyles.landInfoName} numberOfLines={1} ellipsizeMode="tail">
              {landInfo?.landName}
            </Text>
            <View
              style={[
                LandDetailsPopupStyles.landInfoType,
                {
                  backgroundColor: "#FF3D3B",
                },
              ]}>
              <Text style={LandDetailsPopupStyles.landInfoTypeText}>{landInfo?.landType === "1" ? "流转中" : "托管中"}</Text>
            </View>
          </View>
          <View style={LandDetailsPopupStyles.landInfoNumber}>
            <Text
              style={[
                LandDetailsPopupStyles.landNumber,
                {
                  color: "#FF3D3B",
                },
              ]}>
              {landInfo?.actualAcreNum ?? "未知"}
              <Text style={LandDetailsPopupStyles.landNumberUnit}>亩</Text>
            </Text>
          </View>
        </View>

        {/* 展开状态下显示详细信息 */}
        {isExpanded && (
          <View style={LandDetailsPopupStyles.infoContent}>
            <View style={LandDetailsPopupStyles.infoContentItem}>
              <Text style={LandDetailsPopupStyles.infoContentItemTitle}>{`电\u3000话\u3000：`}</Text>
              <Text style={LandDetailsPopupStyles.infoContentItemText}>{landInfo?.mobile ?? "未知"}</Text>
              {landInfo?.mobile && (
                <TouchableOpacity onPress={() => callPhone(landInfo.mobile)}>
                  <Image source={require("@/assets/images/common/icon-phone.png")} style={LandDetailsPopupStyles.phoneImage} />
                </TouchableOpacity>
              )}
            </View>

            <View style={LandDetailsPopupStyles.infoContentItem}>
              <Text style={LandDetailsPopupStyles.infoContentItemTitle}>身份证号：</Text>
              <Text style={LandDetailsPopupStyles.infoContentItemText}>
                {landInfo?.cardid ? replaceKeywords(landInfo.cardid) : "未知"}
              </Text>
            </View>

            <View style={LandDetailsPopupStyles.infoContentItem}>
              <Text style={LandDetailsPopupStyles.infoContentItemTitle}>银行卡号：</Text>
              <Text style={LandDetailsPopupStyles.infoContentItemText}>
                {landInfo?.bankAccount ? replaceKeywords(landInfo.bankAccount) : "未知"}
              </Text>
            </View>

            <View style={LandDetailsPopupStyles.infoContentItem}>
              <Text style={LandDetailsPopupStyles.infoContentItemTitle}>{`创\u0020建\u0020人\u0020：`}</Text>
              <Text style={LandDetailsPopupStyles.infoContentItemText}>{landInfo?.createName ?? "未知"}</Text>
            </View>

            <View style={LandDetailsPopupStyles.infoContentItem}>
              <Text style={LandDetailsPopupStyles.infoContentItemTitle}>创建时间：</Text>
              <Text style={LandDetailsPopupStyles.infoContentItemText}>{landInfo?.createTime ?? "未知"}</Text>
            </View>

            <View style={[LandDetailsPopupStyles.infoContentItem, LandDetailsPopupStyles.infoLocation]}>
              <Text style={LandDetailsPopupStyles.infoContentItemTitle}>{`位\u3000置\u3000：`}</Text>
              <Text style={LandDetailsPopupStyles.infoContentItemText}>{landInfo?.detailaddress ?? "未知"}</Text>
            </View>
          </View>
        )}
      </View>
      {/* 底部按钮 */}
      <View style={LandDetailsPopupStyles.footButton}>
        {/* 地块管理按钮 */}
        <TouchableOpacity style={[LandDetailsPopupStyles.footButtonItem, LandDetailsPopupStyles.yellow]} onPress={onDeleteLand}>
          <Text style={LandDetailsPopupStyles.buttonText}>删除</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[LandDetailsPopupStyles.footButtonItem, LandDetailsPopupStyles.blue, {marginLeft: 8}]}
          onPress={onRestoreLand}>
          <Text style={LandDetailsPopupStyles.buttonText}>恢复</Text>
        </TouchableOpacity>
      </View>
      {/* 退地操作确认弹窗 */}
      <Popup
        visible={isShowPopup}
        title="提示"
        msgText={msgText}
        leftBtnText="取消"
        rightBtnStyle={rightBtnStyle}
        rightBtnText={rightBtnText}
        onLeftBtn={popupCancel}
        onRightBtn={popupConfirm}
      />
    </View>
  );
};

export default LandDetailsPopup;
