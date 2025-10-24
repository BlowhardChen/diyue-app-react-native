import React, {useState, useEffect, useRef} from "react";
import {View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Linking, Animated} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {useNavigation} from "@react-navigation/native";
import {LandDetailsPopupStyles} from "./styles/LandDetailsPopup";
import {StackNavigationProp} from "@react-navigation/stack";
import {Global} from "@/styles/global";
import {LandDetailInfo, LandOrderItem} from "@/types/land";
import {ContractDetail} from "@/types/contract";

interface Props {
  landInfo: LandDetailInfo;
  contractDetail?: ContractDetail | null;
  landOrderList?: LandOrderItem[];
  onClose: () => void;
  onBack: () => void;
  onFindPoint: (id: string) => void;
  onLandManage: (info: LandDetailInfo) => void;
}

type LandStackParamList = {
  LandInfoEdit: {landInfo: LandDetailInfo};
  AddDevice: undefined;
};

const LandDetailsPopup: React.FC<Props> = ({
  landInfo,
  contractDetail,
  landOrderList,
  onClose,
  onBack,
  onFindPoint,
  onLandManage,
}) => {
  const navigation = useNavigation<StackNavigationProp<LandStackParamList>>();
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState("基础信息");
  const orderStatusType = ["", "待付款", "待服务", "已完成", "已取消", "已退款"];
  const orderStatusStyle = [
    {},
    {color: "#fff", backgroundColor: "#FF3D3B"},
    {color: "#F58700", backgroundColor: "#FFEED8"},
    {color: Global.colors.primary, backgroundColor: "#D3FCE0"},
    {color: "#666", backgroundColor: "#EBEBEB"},
    {color: "#666", backgroundColor: "#EBEBEB"},
  ];

  // 切换Tab
  const handleTabChange = (tabIndex: string) => {
    setActiveTab(tabIndex);
  };

  // 拨打电话
  const callPhone = (tel?: string) => {
    if (!tel) return;
    Linking.openURL(`tel:${tel}`);
  };

  // 替换手机号中间4位为*
  const replaceKeywords = (param?: string) => {
    if (!param) return "未知";
    return param.replace(/^(.{6})(?:\d+)(.{4})$/, "$1******$2");
  };

  // 地块管理
  const handleLandManage = () => {
    onLandManage(landInfo);
  };

  // 地块信息编辑
  const handleLandInfoEdit = () => {
    navigation.navigate("LandInfoEdit", {landInfo});
  };

  // 点回找
  const handleFindPoint = () => {
    onFindPoint(landInfo.id);
  };

  // 创建订单
  const handleCreateOrder = () => {};

  // 新建合同
  const addContract = () => {};

  return (
    <View style={LandDetailsPopupStyles.container}>
      {/* 展开收齐按钮 */}
      <TouchableOpacity style={LandDetailsPopupStyles.expand} onPress={() => setIsExpanded(!isExpanded)}>
        <Image
          source={isExpanded ? require("@/assets/images/common/icon-down.png") : require("@/assets/images/common/icon-up.png")}
          style={LandDetailsPopupStyles.iconImg}
        />
      </TouchableOpacity>
      {/* 顶部 */}
      <View style={LandDetailsPopupStyles.header}>
        <TouchableOpacity onPress={onBack}>
          <Image source={require("@/assets/images/common/icon-back.png")} style={LandDetailsPopupStyles.iconBtn} />
        </TouchableOpacity>
        <Text style={LandDetailsPopupStyles.headerTitle}>地块详情</Text>
        <TouchableOpacity onPress={onClose}>
          <Image source={require("@/assets/images/common/icon-close.png")} style={LandDetailsPopupStyles.iconBtn} />
        </TouchableOpacity>
      </View>
      <View style={LandDetailsPopupStyles.tabContainer}>
        {/* 基础信息Tab */}
        <TouchableOpacity style={LandDetailsPopupStyles.tabButton} onPress={() => handleTabChange("基础信息")}>
          <View style={LandDetailsPopupStyles.tabItem}>
            <Text
              style={[
                LandDetailsPopupStyles.tabText,
                activeTab === "基础信息" ? LandDetailsPopupStyles.activeTabText : LandDetailsPopupStyles.inactiveTabText,
              ]}>
              基础信息
            </Text>
            {activeTab === "基础信息" && <View style={LandDetailsPopupStyles.inactiveTabLine}></View>}
          </View>
        </TouchableOpacity>
        {/* 合同信息Tab */}
        {landInfo?.landType === "1" && (
          <TouchableOpacity style={LandDetailsPopupStyles.tabButton} onPress={() => handleTabChange("合同信息")}>
            <View style={LandDetailsPopupStyles.tabItem}>
              <Text
                style={[
                  LandDetailsPopupStyles.tabText,
                  activeTab === "合同信息" ? LandDetailsPopupStyles.activeTabText : LandDetailsPopupStyles.inactiveTabText,
                ]}>
                合同信息
              </Text>
              {activeTab === "合同信息" && <View style={LandDetailsPopupStyles.inactiveTabLine}></View>}
            </View>
          </TouchableOpacity>
        )}
        {/* 托管订单 */}
        {landInfo?.landType !== "1" && (
          <TouchableOpacity style={LandDetailsPopupStyles.tabButton} onPress={() => handleTabChange("托管订单")}>
            <View style={LandDetailsPopupStyles.tabItem}>
              <Text
                style={[
                  LandDetailsPopupStyles.tabText,
                  activeTab === "托管订单" ? LandDetailsPopupStyles.activeTabText : LandDetailsPopupStyles.inactiveTabText,
                ]}>
                托管订单
              </Text>
              {activeTab === "托管订单" && <View style={LandDetailsPopupStyles.inactiveTabLine}></View>}
            </View>
          </TouchableOpacity>
        )}
      </View>
      {/* 基础信息 */}
      {activeTab === "基础信息" && (
        <View>
          <View style={[LandDetailsPopupStyles.infoLand, {backgroundColor: landInfo?.landType === "1" ? "#ebffe4" : "#E7FDFF"}]}>
            <View style={LandDetailsPopupStyles.landInfo}>
              <Text style={LandDetailsPopupStyles.landInfoName} numberOfLines={1} ellipsizeMode="tail">
                {landInfo?.landName}
              </Text>
              <View
                style={[
                  LandDetailsPopupStyles.landInfoType,
                  {backgroundColor: landInfo?.landType === "1" ? Global.colors.primary : "#0099E4"},
                ]}>
                <Text style={LandDetailsPopupStyles.landInfoTypeText}>{landInfo?.landType === "1" ? "流转中" : "托管中"}</Text>
              </View>
            </View>
            <View>
              <Text
                style={[
                  LandDetailsPopupStyles.landNumber,
                  {color: landInfo?.landType === "1" ? Global.colors.primary : "#0099E4"},
                ]}>
                {landInfo?.actualAcreNum ?? "未知"}
                <Text style={LandDetailsPopupStyles.landNumberUnit}>亩</Text>
              </Text>
            </View>
          </View>
          {isExpanded && (
            <View style={LandDetailsPopupStyles.infoContent}>
              {landInfo?.type !== "1" && (
                <View style={LandDetailsPopupStyles.infoContentItem}>
                  <Text style={LandDetailsPopupStyles.infoContentItemTitle}>电话：</Text>
                  <Text style={[LandDetailsPopupStyles.infoContentItemText]}>{landInfo?.mobile ?? "未知"}</Text>
                  {landInfo?.mobile && (
                    <TouchableOpacity onPress={() => callPhone(landInfo.mobile)}>
                      <Image
                        source={require("@/assets/images/common/icon-phone.png")}
                        style={LandDetailsPopupStyles.phoneImage}
                      />
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
      )}
      {/* 合同信息 */}
      {activeTab === "合同信息" && (
        <View>
          {/* 有合同信息的情况 */}
          {contractDetail?.contractNo ? (
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
                    {backgroundColor: landInfo?.landType === "1" ? Global.colors.primary : "#0099E4"},
                  ]}>
                  <Text style={LandDetailsPopupStyles.landInfoTypeText}>{landInfo?.landType === "1" ? "流转中" : "托管中"}</Text>
                </View>
              </View>
              {isExpanded && (
                <View style={LandDetailsPopupStyles.infoContent}>
                  <View style={LandDetailsPopupStyles.infoContentItemRow}>
                    <View style={[LandDetailsPopupStyles.contractInfoItem]}>
                      <Text style={LandDetailsPopupStyles.infoContentItemTitle}>实际亩数：</Text>
                      <Text style={LandDetailsPopupStyles.infoContentItemText}>
                        {contractDetail?.actualAcreNum ? `${contractDetail.actualAcreNum}亩` : "未知"}
                      </Text>
                    </View>
                    <View style={[LandDetailsPopupStyles.contractInfoItem]}>
                      <Text style={LandDetailsPopupStyles.infoContentItemTitle}>每亩租金：</Text>
                      <Text style={LandDetailsPopupStyles.infoContentItemText}>
                        {contractDetail?.perAcreAmount ? `${contractDetail.perAcreAmount}元` : "未知"}
                      </Text>
                    </View>
                  </View>

                  <View style={LandDetailsPopupStyles.infoContentItemRow}>
                    <View style={[LandDetailsPopupStyles.contractInfoItem]}>
                      <Text style={LandDetailsPopupStyles.infoContentItemTitle}>付款金额：</Text>
                      <Text style={LandDetailsPopupStyles.infoContentItemText}>
                        {contractDetail?.paymentAmount ? `${contractDetail.paymentAmount}元` : "未知"}
                      </Text>
                    </View>
                    <View style={[LandDetailsPopupStyles.contractInfoItem]}>
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
          ) : (
            // 无合同信息的情况
            <View style={LandDetailsPopupStyles.contractEmpty}>
              {isExpanded && (
                <Image
                  source={require("@/assets/images/common/contract-empty.png")}
                  style={LandDetailsPopupStyles.emptyImage}
                  resizeMode="cover"
                />
              )}

              {isExpanded && <Text style={LandDetailsPopupStyles.emptyTitle}>暂无合同信息</Text>}

              <TouchableOpacity style={LandDetailsPopupStyles.addContract} onPress={() => addContract()}>
                <Text style={LandDetailsPopupStyles.addContractText}>新建合同</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      {/* 托管订单 */}
      {activeTab === "托管订单" && (
        <View>
          {landOrderList?.length && isExpanded && (
            <ScrollView style={LandDetailsPopupStyles.msgOrder}>
              {landOrderList.map((item, index) => (
                <View key={item.id} style={LandDetailsPopupStyles.msgOrdeItem}>
                  <View style={LandDetailsPopupStyles.msgOrdeItemContent}>
                    {/* 时间线竖线 */}
                    <View
                      style={[
                        LandDetailsPopupStyles.timelineLine,
                        index === landOrderList.length - 1 ? LandDetailsPopupStyles.lastTimelineLine : {},
                      ]}
                    />
                    {/* 时间线圆点 */}
                    <View style={LandDetailsPopupStyles.timelineDot} />

                    <View style={LandDetailsPopupStyles.contentTop}>
                      <Text style={LandDetailsPopupStyles.time}>下单时间：{item.createTime}</Text>
                    </View>

                    <View style={LandDetailsPopupStyles.contentMain}>
                      <View style={LandDetailsPopupStyles.farmingInfo}>
                        <View style={LandDetailsPopupStyles.farmingInfoContent}>
                          <Image style={LandDetailsPopupStyles.msgImage} source={{uri: item.url}} resizeMode="stretch" />
                          <View style={LandDetailsPopupStyles.msgText}>
                            <Text style={LandDetailsPopupStyles.title} numberOfLines={1} ellipsizeMode="tail">
                              {item.name}
                            </Text>

                            <Text style={LandDetailsPopupStyles.price}>
                              <Text style={{fontSize: 24}}>￥</Text>
                              {item.totalPrice}
                            </Text>
                          </View>
                        </View>
                        <View style={[LandDetailsPopupStyles.farmingType, orderStatusStyle[Number(item.status)]]}>
                          <Text style={{color: orderStatusStyle[Number(item.status)].color, fontSize: 14}}>
                            {orderStatusType[Number(item.status)]}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
          {!landOrderList?.length && isExpanded && (
            <View style={LandDetailsPopupStyles.contractEmpty}>
              <Image
                source={require("@/assets/images/common/contract-empty.png")}
                style={LandDetailsPopupStyles.emptyImage}
                resizeMode="cover"
              />
              <Text style={LandDetailsPopupStyles.emptyTitle}>暂无托管订单</Text>
            </View>
          )}
        </View>
      )}
      {/* 底部按钮 */}
      <View style={LandDetailsPopupStyles.footButton}>
        {activeTab !== "托管订单" && (
          <TouchableOpacity
            style={[LandDetailsPopupStyles.footButtonItem, LandDetailsPopupStyles.yellow]}
            onPress={() => handleLandManage()}>
            <Text style={LandDetailsPopupStyles.buttonText}>地块管理</Text>
          </TouchableOpacity>
        )}
        {((landInfo?.type !== "1" && activeTab === "基础信息") || contractDetail?.contractNo) && (
          <TouchableOpacity
            style={[LandDetailsPopupStyles.footButtonItem, LandDetailsPopupStyles.blue, {marginLeft: 8}]}
            onPress={() => handleLandInfoEdit()}>
            <Text style={LandDetailsPopupStyles.buttonText}>{activeTab === "基础信息" ? "信息编辑" : "合同编辑"}</Text>
          </TouchableOpacity>
        )}
        {activeTab !== "托管订单" && (
          <TouchableOpacity
            style={[LandDetailsPopupStyles.footButtonItem, LandDetailsPopupStyles.green, {marginLeft: 8}]}
            onPress={() => handleFindPoint()}>
            <Text style={LandDetailsPopupStyles.buttonText}>点回找</Text>
          </TouchableOpacity>
        )}
        {activeTab === "托管订单" && (
          <TouchableOpacity
            style={[LandDetailsPopupStyles.footButtonItem, LandDetailsPopupStyles.blue]}
            onPress={() => handleCreateOrder()}>
            <Text style={LandDetailsPopupStyles.buttonText}>创建订单</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default LandDetailsPopup;
