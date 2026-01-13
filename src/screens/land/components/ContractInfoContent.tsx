import React from "react";
import {View, Text, Image, TouchableOpacity} from "react-native";
import {LandDetailsPopupStyles} from "./styles/LandDetailsPopup";
import {Global} from "@/styles/global";
import {LandDetailInfo} from "@/types/land";
import {ContractDetail} from "@/types/contract";

interface Props {
  landInfo: LandDetailInfo;
  contractDetail?: ContractDetail | null;
  isExpanded: boolean;
  addContract: () => void;
}

const ContractInfoContent: React.FC<Props> = ({landInfo, contractDetail, isExpanded, addContract}) => {
  // 有合同信息
  if (contractDetail?.contractNo) {
    return (
      <View>
        <View style={LandDetailsPopupStyles.contractInfo}>
          <View style={LandDetailsPopupStyles.contractNoContainer}>
            <Text style={LandDetailsPopupStyles.contractNoText} numberOfLines={1}>
              {contractDetail?.contractNo}
            </Text>
          </View>
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

        {isExpanded && (
          <View style={LandDetailsPopupStyles.infoContent}>
            <View style={LandDetailsPopupStyles.infoContentItemRow}>
              <View style={LandDetailsPopupStyles.contractInfoItem}>
                <Text style={LandDetailsPopupStyles.infoContentItemTitle}>实际亩数：</Text>
                <Text style={LandDetailsPopupStyles.infoContentItemText}>
                  {contractDetail?.actualAcreNum ? `${contractDetail.actualAcreNum}亩` : "未知"}
                </Text>
              </View>
              <View style={LandDetailsPopupStyles.contractInfoItem}>
                <Text style={LandDetailsPopupStyles.infoContentItemTitle}>每亩租金：</Text>
                <Text style={LandDetailsPopupStyles.infoContentItemText}>
                  {contractDetail?.perAcreAmount ? `${contractDetail.perAcreAmount}元` : "未知"}
                </Text>
              </View>
            </View>

            <View style={LandDetailsPopupStyles.infoContentItemRow}>
              <View style={LandDetailsPopupStyles.contractInfoItem}>
                <Text style={LandDetailsPopupStyles.infoContentItemTitle}>付款金额：</Text>
                <Text style={LandDetailsPopupStyles.infoContentItemText}>
                  {contractDetail?.paymentAmount ? `${contractDetail.paymentAmount}元` : "未知"}
                </Text>
              </View>
              <View style={LandDetailsPopupStyles.contractInfoItem}>
                <Text style={LandDetailsPopupStyles.infoContentItemTitle}>付款方式：</Text>
                <Text style={LandDetailsPopupStyles.infoContentItemText}>{contractDetail?.dictLabel ?? "未知"}</Text>
              </View>
            </View>

            <View style={LandDetailsPopupStyles.infoContentItem}>
              <Text style={LandDetailsPopupStyles.infoContentItemTitle}>合同期限：</Text>
              <Text style={LandDetailsPopupStyles.infoContentItemText}>
                {contractDetail?.termOfLease ? `${contractDetail.termOfLease}年` : "未知"}
              </Text>
            </View>

            <View style={LandDetailsPopupStyles.infoContentItem}>
              <Text style={LandDetailsPopupStyles.infoContentItemTitle}>起止时间：</Text>
              <Text style={LandDetailsPopupStyles.infoContentItemText}>
                {contractDetail?.startTime ? `${contractDetail.startTime} 至 ${contractDetail.endTime}` : "未知"}
              </Text>
            </View>

            <View style={LandDetailsPopupStyles.infoContentItem}>
              <Text style={LandDetailsPopupStyles.infoContentItemTitle}>创建人：</Text>
              <Text style={LandDetailsPopupStyles.infoContentItemText}>{contractDetail?.createName ?? "未知"}</Text>
            </View>

            <View style={LandDetailsPopupStyles.infoContentItem}>
              <Text style={LandDetailsPopupStyles.infoContentItemTitle}>创建时间：</Text>
              <Text style={LandDetailsPopupStyles.infoContentItemText}>{landInfo?.createTime ?? "未知"}</Text>
            </View>
          </View>
        )}
      </View>
    );
  }

  // 无合同信息
  return (
    <View style={LandDetailsPopupStyles.contractEmpty}>
      {isExpanded && (
        <>
          <Image
            source={require("@/assets/images/common/contract-empty.png")}
            style={LandDetailsPopupStyles.emptyImage}
            resizeMode="cover"
          />
          <Text style={LandDetailsPopupStyles.emptyTitle}>暂无合同信息</Text>
        </>
      )}

      <TouchableOpacity style={LandDetailsPopupStyles.addContract} onPress={addContract}>
        <Text style={LandDetailsPopupStyles.addContractText}>新建合同</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ContractInfoContent;
