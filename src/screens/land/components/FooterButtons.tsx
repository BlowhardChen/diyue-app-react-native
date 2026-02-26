import React from "react";
import {View, TouchableOpacity, Text} from "react-native";
import {LandDetailsPopupStyles} from "./styles/LandDetailsPopup";

interface Props {
  activeTab: string;
  type?: string;
  landType?: string;
  contractNo?: string;
  onLandManage: () => void;
  onLandInfoEdit: () => void;
  onFindPoint: () => void;
  onHandleCreateOrder: () => void;
}

const FooterButtons: React.FC<Props> = ({
  activeTab,
  type,
  landType,
  contractNo,
  onLandManage,
  onLandInfoEdit,
  onFindPoint,
  onHandleCreateOrder,
}) => {
  return (
    <View style={LandDetailsPopupStyles.footButton}>
      {/* 地块管理按钮 */}
      {activeTab !== "托管订单" && (
        <TouchableOpacity style={[LandDetailsPopupStyles.footButtonItem, LandDetailsPopupStyles.yellow]} onPress={onLandManage}>
          <Text style={LandDetailsPopupStyles.buttonText}>地块管理</Text>
        </TouchableOpacity>
      )}

      {/* 信息/合同编辑按钮（仅流转中地块） */}
      {((activeTab === "基础信息" && type !== "1") || contractNo) && (
        <TouchableOpacity
          style={[LandDetailsPopupStyles.footButtonItem, LandDetailsPopupStyles.blue, {marginLeft: 8}]}
          onPress={onLandInfoEdit}>
          <Text style={LandDetailsPopupStyles.buttonText}>{activeTab === "基础信息" ? "信息编辑" : "合同编辑"}</Text>
        </TouchableOpacity>
      )}

      {/* 点回找按钮 */}
      {activeTab !== "托管订单" && (
        <TouchableOpacity
          style={[LandDetailsPopupStyles.footButtonItem, LandDetailsPopupStyles.green, {marginLeft: 8}]}
          onPress={onFindPoint}>
          <Text style={LandDetailsPopupStyles.buttonText}>点回找</Text>
        </TouchableOpacity>
      )}

      {/* 创建订单按钮（仅托管中地块的托管订单Tab） */}
      {landType === "2" && activeTab === "托管订单" && (
        <TouchableOpacity
          style={[LandDetailsPopupStyles.footButtonItem, LandDetailsPopupStyles.blue]}
          onPress={onHandleCreateOrder}>
          <Text style={LandDetailsPopupStyles.buttonText}>创建订单</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default FooterButtons;
