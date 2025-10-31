import React from "react";
import {View, Text, TouchableOpacity, Image} from "react-native";
import {LandDetailsPopupStyles} from "./styles/LandDetailsPopup";
import {Global} from "@/styles/global";
import {LandDetailInfo} from "@/types/land";

interface Props {
  landInfo: LandDetailInfo;
  isExpanded: boolean;
  callPhone: (tel?: string) => void;
  replaceKeywords: (param?: string) => string;
}

const BasicInfoContent: React.FC<Props> = ({landInfo, isExpanded, callPhone, replaceKeywords}) => {
  return (
    <View>
      {/* 地块基本信息头部 */}
      <View
        style={[
          LandDetailsPopupStyles.infoLand,
          {
            backgroundColor: landInfo?.landType === "1" ? "#ebffe4" : "#E7FDFF",
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
                backgroundColor: landInfo?.landType === "1" ? Global.colors.primary : "#0099E4",
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
                color: landInfo?.landType === "1" ? Global.colors.primary : "#0099E4",
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
          {landInfo?.type !== "1" && (
            <View style={LandDetailsPopupStyles.infoContentItem}>
              <Text style={LandDetailsPopupStyles.infoContentItemTitle}>电话：</Text>
              <Text style={LandDetailsPopupStyles.infoContentItemText}>{landInfo?.mobile ?? "未知"}</Text>
              {landInfo?.mobile && (
                <TouchableOpacity onPress={() => callPhone(landInfo.mobile)}>
                  <Image source={require("@/assets/images/common/icon-phone.png")} style={LandDetailsPopupStyles.phoneImage} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {landInfo?.type !== "1" && (
            <View style={LandDetailsPopupStyles.infoContentItem}>
              <Text style={LandDetailsPopupStyles.infoContentItemTitle}>身份证号：</Text>
              <Text style={LandDetailsPopupStyles.infoContentItemText}>
                {landInfo?.cardid ? replaceKeywords(landInfo.cardid) : "未知"}
              </Text>
            </View>
          )}

          {landInfo?.type !== "1" && (
            <View style={LandDetailsPopupStyles.infoContentItem}>
              <Text style={LandDetailsPopupStyles.infoContentItemTitle}>银行卡号：</Text>
              <Text style={LandDetailsPopupStyles.infoContentItemText}>
                {landInfo?.bankAccount ? replaceKeywords(landInfo.bankAccount) : "未知"}
              </Text>
            </View>
          )}

          {landInfo?.type !== "1" && (
            <View style={LandDetailsPopupStyles.infoContentItem}>
              <Text style={LandDetailsPopupStyles.infoContentItemTitle}>创建人：</Text>
              <Text style={LandDetailsPopupStyles.infoContentItemText}>{landInfo?.createName ?? "未知"}</Text>
            </View>
          )}

          <View style={LandDetailsPopupStyles.infoContentItem}>
            <Text style={LandDetailsPopupStyles.infoContentItemTitle}>创建时间：</Text>
            <Text style={LandDetailsPopupStyles.infoContentItemText}>{landInfo?.createTime ?? "未知"}</Text>
          </View>

          <View style={[LandDetailsPopupStyles.infoContentItem, LandDetailsPopupStyles.infoLocation]}>
            <Text style={LandDetailsPopupStyles.infoContentItemTitle}>位置：</Text>
            <Text style={LandDetailsPopupStyles.infoContentItemText}>{landInfo?.detailaddress ?? "未知"}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default BasicInfoContent;
