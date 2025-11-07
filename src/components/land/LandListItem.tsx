import React, {useState} from "react";
import {View, Text, Image, TouchableOpacity, LayoutAnimation, Platform, UIManager} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {LandListItemStyles} from "@/components/land/styles/LandListItem";

// 安卓启用动画
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface LandListItemProps {
  landMsgItem: any;
}

const LandListItem: React.FC<LandListItemProps> = ({landMsgItem}) => {
  const navigation = useNavigation<any>();
  const [isExpandLand, setIsExpandLand] = useState(false);

  // 展开/收起地块
  const expandLand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpandLand(!isExpandLand);
  };

  // 打开地块详情
  const openLandDetail = (item: any) => {
    navigation.navigate("LandDetail", {landId: item.id});
  };

  // 打开合并地块详情
  const openMergeDetail = (item: any) => {
    navigation.navigate("LandDetail", {landId: item.id});
  };

  return (
    <View style={LandListItemStyles.container}>
      {/* 主项信息 */}
      <TouchableOpacity style={LandListItemStyles.msgBox} activeOpacity={0.8} onPress={() => openLandDetail(landMsgItem)}>
        <View style={LandListItemStyles.msgImg}>
          <Image source={{uri: landMsgItem.url}} style={LandListItemStyles.msgImgImage} resizeMode="cover" />
        </View>

        <View style={LandListItemStyles.msgLand}>
          <View style={LandListItemStyles.msgLandTitle}>
            <Text style={LandListItemStyles.title}>{landMsgItem.landName}</Text>
            <View style={LandListItemStyles.area}>
              <Text style={LandListItemStyles.areaText}>{landMsgItem.actualAcreNum}</Text>
              <Text>亩</Text>
              <Image source={require("@/assets/images/common/icon-right.png")} style={LandListItemStyles.rightIcon} />
            </View>
          </View>

          <View style={LandListItemStyles.msgLandPosition}>
            <Text style={LandListItemStyles.posTitle}>位置：</Text>
            <Text numberOfLines={1} style={LandListItemStyles.posMsg}>
              {landMsgItem.detailaddress}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* 展开按钮 */}
      {landMsgItem?.landList?.length ? (
        <TouchableOpacity style={LandListItemStyles.landBottom} onPress={expandLand} activeOpacity={0.8}>
          <Text>
            共<Text style={LandListItemStyles.highlight}>{landMsgItem.landList.length}</Text>个地块
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
          {landMsgItem.landList.map((item: any, index: number) => (
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
                  <Text style={LandListItemStyles.title}>{item.landName}</Text>
                  <View style={LandListItemStyles.area}>
                    <Text style={LandListItemStyles.areaText}>{item.actualAcreNum}</Text>
                    <Text>亩</Text>
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
