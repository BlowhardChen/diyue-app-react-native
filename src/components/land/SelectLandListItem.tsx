import React, {useState} from "react";
import {View, Text, Image, TouchableOpacity, LayoutAnimation, Platform, UIManager} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {LandListItemStyles} from "@/components/land/styles/LandListItem";
import {LandListData} from "@/types/land";

// 安卓启用动画
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface landListInfo extends LandListData {
  isSelect: boolean;
}

interface LandListItemProps {
  landListInfoItem: landListInfo;
  onSeletLand: (item: landListInfo) => void;
}

const LandListItem: React.FC<LandListItemProps> = ({landListInfoItem, onSeletLand}) => {
  const navigation = useNavigation<any>();
  const [isExpandLand, setIsExpandLand] = useState(false);

  // 展开/收起地块
  const expandLand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpandLand(!isExpandLand);
  };

  // 打开地块详情
  const openLandDetail = (item: LandListData) => {
    navigation.navigate("LandDetail", {landId: item.id});
  };

  // 打开合并地块详情
  const openMergeDetail = (item: LandListData) => {
    navigation.navigate("LandDetail", {landId: item.id});
  };

  return (
    <View style={[LandListItemStyles.container, {marginTop: 0, borderBottomWidth: 1, borderBottomColor: "#e5e5e5"}]}>
      {/* 主项信息 */}
      <View style={LandListItemStyles.msgBox}>
        <TouchableOpacity style={LandListItemStyles.checkIcon} onPress={() => onSeletLand(landListInfoItem)}>
          <Image
            source={
              landListInfoItem.isSelect
                ? require("@/assets/images/home/icon-check-active.png")
                : require("@/assets/images/home/icon-check.png")
            }
            style={LandListItemStyles.checkIcon}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <View style={LandListItemStyles.msgImg}>
          <Image source={{uri: landListInfoItem.url}} style={LandListItemStyles.msgImgImage} resizeMode="cover" />
        </View>
        <TouchableOpacity onPress={() => openLandDetail(landListInfoItem)}>
          <View style={LandListItemStyles.msgLand}>
            <View style={LandListItemStyles.msgLandTitle}>
              <Text style={[LandListItemStyles.title, {width: 145}]} numberOfLines={1}>
                {landListInfoItem.landName}
              </Text>
              <View style={LandListItemStyles.area}>
                <Text style={LandListItemStyles.areaText}>{landListInfoItem.actualAcreNum}</Text>
                <Text style={{fontSize: 18, fontWeight: "normal"}}>亩</Text>
                <Image source={require("@/assets/images/common/icon-right.png")} style={LandListItemStyles.rightIcon} />
              </View>
            </View>

            <View style={LandListItemStyles.msgLandPosition}>
              <Text style={LandListItemStyles.posTitle}>位置：</Text>
              <Text numberOfLines={1} style={LandListItemStyles.posMsg}>
                {landListInfoItem.detailaddress}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* 展开按钮 */}
      {landListInfoItem?.landList?.length ? (
        <TouchableOpacity style={LandListItemStyles.landBottom} onPress={expandLand} activeOpacity={0.8}>
          <Text>
            共<Text style={LandListItemStyles.highlight}>{landListInfoItem.landList.length}</Text>个地块
          </Text>
          <Image
            source={
              isExpandLand ? require("@/assets/images/common/icon-top.png") : require("@/assets/images/common/icon-bottom.png")
            }
            style={LandListItemStyles.expandIcon}
          />
        </TouchableOpacity>
      ) : null}

      {/* 展开更多子地块 */}
      {isExpandLand && (
        <View style={LandListItemStyles.landMore}>
          {landListInfoItem.landList.map((item: any, index: number) => (
            <TouchableOpacity
              key={index}
              style={LandListItemStyles.landMoreItem}
              activeOpacity={0.8}
              onPress={() => openMergeDetail(item)}>
              <View style={LandListItemStyles.msgImg}>
                <Image source={{uri: item.url}} style={LandListItemStyles.msgImgImage} resizeMode="cover" />
              </View>

              <View style={LandListItemStyles.msgLand}>
                <View style={LandListItemStyles.msgLandTitle}>
                  <Text style={LandListItemStyles.title} numberOfLines={1}>
                    {item.landName}
                  </Text>
                  <View style={LandListItemStyles.area}>
                    <Text style={LandListItemStyles.areaText}>{item.actualAcreNum}</Text>
                    <Text style={{fontSize: 18, fontWeight: "normal"}}>亩</Text>
                    <Image source={require("@/assets/images/common/icon-right.png")} style={LandListItemStyles.rightIcon} />
                  </View>
                </View>

                <View style={LandListItemStyles.msgLandPosition}>
                  <Text style={LandListItemStyles.posTitle}>位置：</Text>
                  <Text numberOfLines={1} style={LandListItemStyles.posMsg}>
                    {item.detailaddress}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default LandListItem;
