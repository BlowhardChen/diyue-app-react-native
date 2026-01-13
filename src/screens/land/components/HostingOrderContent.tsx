import React from "react";
import {View, Text, Image, ScrollView} from "react-native";
import {LandDetailsPopupStyles} from "./styles/LandDetailsPopup";
import {LandOrderItem} from "@/types/land";

// 订单状态映射
const orderStatusType = ["", "待付款", "待服务", "已完成", "已取消", "已退款"];
const orderStatusStyle = [
  {},
  {color: "#fff", backgroundColor: "#FF3D3B"},
  {color: "#F58700", backgroundColor: "#FFEED8"},
  {color: "#00B42A", backgroundColor: "#D3FCE0"},
  {color: "#666", backgroundColor: "#EBEBEB"},
  {color: "#666", backgroundColor: "#EBEBEB"},
];

interface Props {
  landOrderList?: LandOrderItem[];
  isExpanded: boolean;
}

const HostingOrderContent: React.FC<Props> = ({landOrderList, isExpanded}) => {
  // 有订单列表
  if (landOrderList?.length && isExpanded) {
    return (
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
                    <Text
                      style={{
                        color: orderStatusStyle[Number(item.status)].color,
                        fontSize: 14,
                      }}>
                      {orderStatusType[Number(item.status)]}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  }

  // 无订单列表
  if (isExpanded) {
    return (
      <View style={LandDetailsPopupStyles.contractEmpty}>
        <Image
          source={require("@/assets/images/common/contract-empty.png")}
          style={LandDetailsPopupStyles.emptyImage}
          resizeMode="cover"
        />
        <Text style={LandDetailsPopupStyles.emptyTitle}>暂无托管订单</Text>
      </View>
    );
  }

  return null;
};

export default HostingOrderContent;
