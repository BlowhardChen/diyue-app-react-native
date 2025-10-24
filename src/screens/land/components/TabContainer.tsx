import React from "react";
import {View, TouchableOpacity, Text} from "react-native";
import {LandDetailsPopupStyles} from "./styles/LandDetailsPopup";

interface Props {
  activeTab: string;
  landType?: string;
  onTabChange: (tab: string) => void;
}

const TabContainer: React.FC<Props> = ({activeTab, landType, onTabChange}) => {
  return (
    <View style={LandDetailsPopupStyles.tabContainer}>
      {/* 基础信息Tab */}
      <TouchableOpacity style={LandDetailsPopupStyles.tabButton} onPress={() => onTabChange("基础信息")}>
        <View style={LandDetailsPopupStyles.tabItem}>
          <Text
            style={[
              LandDetailsPopupStyles.tabText,
              activeTab === "基础信息" ? LandDetailsPopupStyles.activeTabText : LandDetailsPopupStyles.inactiveTabText,
            ]}>
            基础信息
          </Text>
          {activeTab === "基础信息" && <View style={LandDetailsPopupStyles.inactiveTabLine} />}
        </View>
      </TouchableOpacity>

      {/* 合同信息Tab（仅流转中地块显示） */}
      {landType === "1" && (
        <TouchableOpacity style={LandDetailsPopupStyles.tabButton} onPress={() => onTabChange("合同信息")}>
          <View style={LandDetailsPopupStyles.tabItem}>
            <Text
              style={[
                LandDetailsPopupStyles.tabText,
                activeTab === "合同信息" ? LandDetailsPopupStyles.activeTabText : LandDetailsPopupStyles.inactiveTabText,
              ]}>
              合同信息
            </Text>
            {activeTab === "合同信息" && <View style={LandDetailsPopupStyles.inactiveTabLine} />}
          </View>
        </TouchableOpacity>
      )}

      {/* 托管订单Tab（非流转中地块显示） */}
      {landType !== "1" && (
        <TouchableOpacity style={LandDetailsPopupStyles.tabButton} onPress={() => onTabChange("托管订单")}>
          <View style={LandDetailsPopupStyles.tabItem}>
            <Text
              style={[
                LandDetailsPopupStyles.tabText,
                activeTab === "托管订单" ? LandDetailsPopupStyles.activeTabText : LandDetailsPopupStyles.inactiveTabText,
              ]}>
              托管订单
            </Text>
            {activeTab === "托管订单" && <View style={LandDetailsPopupStyles.inactiveTabLine} />}
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default TabContainer;
