import {FarmDataListItem} from "@/types/mall";
import React, {useState} from "react";
import {View, Text, StyleSheet, TouchableOpacity, Image, Modal, ScrollView, TextInput} from "react-native";

interface ShoppingCarProps {
  farmDataList: FarmDataListItem[];
  onClose: () => void;
}

const ShoppingCar: React.FC<ShoppingCarProps> = ({farmDataList = [], onClose}) => {
  // 维护状态（避免直接修改props）
  const [listData, setListData] = useState<FarmDataListItem[]>(farmDataList);

  // 减少数量
  const reduceTotalNumber = (item: FarmDataListItem) => {
    setListData(listData.map(i => (i.id === item.id ? {...i, num: Math.max(0, i.num - 1)} : i)));
  };

  // 增加数量
  const addTotalNumber = (item: FarmDataListItem) => {
    setListData(listData.map(i => (i.id === item.id ? {...i, num: i.num + 1} : i)));
  };

  // 处理输入框数值变化
  const handleNumChange = (value: string, item: FarmDataListItem) => {
    const num = parseInt(value) || 0;
    setListData(listData.map(i => (i.id === item.id ? {...i, num: num} : i)));
  };
  return (
    <Modal transparent animationType="fade">
      <View style={styles.popupOverlay}>
        <View style={styles.popupContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>购物车</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Image source={require("@/assets/images/home/icon-close.png")} style={styles.closeButtonImage} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* <View style={styles.noDataContainer}>
              <Image source={require("@/assets/images/mall/no-data.png")} style={styles.noDataImage} resizeMode="cover" />
              <Text style={styles.noDataTips}>暂无农资产品，请添加</Text>
            </View> */}
            {listData.map(item => (
              <View key={item.id} style={styles.detailListItem}>
                {/* 商品图片 */}
                <View style={styles.detailListItemImage}>
                  <Image
                    source={{uri: item.images[0]?.url || ""}}
                    style={styles.image}
                    resizeMode="cover" // 对应scaleToFill
                  />
                </View>

                {/* 商品信息 */}
                <View style={styles.detailListItemInfo}>
                  <Text style={styles.waterfallItemTitle}>{item.goodsName}</Text>
                  <Text style={styles.waterfallItemNorms}>规格: {item.spec}</Text>

                  {/* 价格和数量操作区 */}
                  <View style={styles.price}>
                    <Text style={styles.priceText}>
                      ￥ <Text style={styles.priceNum}>{item.price}</Text>
                    </Text>

                    <View style={styles.informationArea}>
                      {/* 减少按钮 */}
                      <TouchableOpacity onPress={() => reduceTotalNumber(item)} style={styles.informationIconWrapper}>
                        <Image source={require("@/assets/images/mall/price-reduce.png")} style={styles.informationIcon} />
                      </TouchableOpacity>

                      {/* 数量输入框 */}
                      <View style={styles.informationUnit}>
                        <TextInput
                          style={styles.numInput}
                          value={item.num.toString()}
                          onChangeText={v => handleNumChange(v, item)}
                          keyboardType="numeric"
                          textAlign="center"
                        />
                      </View>

                      {/* 增加按钮 */}
                      <TouchableOpacity onPress={() => addTotalNumber(item)} style={styles.informationIconWrapper}>
                        <Image source={require("@/assets/images/mall/price-add.png")} style={styles.informationIcon} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  popupOverlay: {
    position: "absolute",
    bottom: 132,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
  },
  popupContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 500,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: "#fff",
  },
  popupContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  header: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "500",
  },
  closeButton: {
    position: "absolute",
    right: 12,
    top: 11,
  },
  closeButtonImage: {
    width: 26,
    height: 26,
  },
  scrollView: {
    height: "68%", // 对应 68vh
    paddingHorizontal: 16, // 32rpx / 2
  },
  noDataContainer: {
    marginTop: "40%",
    justifyContent: "center",
    alignItems: "center",
  },
  noDataImage: {
    width: 86,
    height: 84,
  },
  noDataTips: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "400",
    color: "#000",
  },
  detailListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  detailListItemImage: {
    width: 78,
    height: 78,
    marginRight: 12,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  detailListItemInfo: {
    flex: 1,
  },
  waterfallItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  waterfallItemNorms: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "400",
    color: "rgba(0, 0, 0, 0.65)",
  },
  price: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  priceText: {
    fontSize: 15,
    color: "#ff3d3b",
  },
  priceNum: {
    fontSize: 20,
  },
  informationArea: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 106,
    height: 32,
  },
  informationIconWrapper: {
    width: 32,
    height: 32,
  },
  informationIcon: {
    width: "100%",
    height: "100%",
  },
  informationUnit: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 32,
    paddingHorizontal: 7.5,
    backgroundColor: "#eff2f3",
    borderWidth: 1,
    borderColor: "#e4e4e4",
  },
  numInput: {
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 38,
    color: "#000",
    flex: 1,
  },
});

export default ShoppingCar;
