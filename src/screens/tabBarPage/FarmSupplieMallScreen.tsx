import React, {useState, useCallback, useEffect, useRef} from "react";
import {View, Text, Image, TouchableOpacity, ScrollView, RefreshControl, Modal, StatusBar} from "react-native";
import {FlashList} from "@shopify/flash-list";
import {debounce} from "lodash";
import usePhoneCall from "@/hooks/usePhoneCall";
import {FarmDataListItem, FarmServiceListItem} from "@/types/mall";
import {getFarmDataList, getFarmCartList, editFarmCart, getFarmServiceList} from "@/services/mall";
import ShoppingCar from "../mall/components/ShoppingCart";
import PermissionPopup from "@/components/common/PermissionPopup";
import {FarmSupplieMallScreenStyles} from "./styles/FarmSupplieMallScreen";
import LinearGradient from "react-native-linear-gradient";
import {showCustomToast} from "@/components/common/CustomToast";
import CustomerServicePopup from "@/components/common/KfPhoneModal";

const FarmSupplieMallScreen: React.FC = () => {
  const {showKfPopup, isShowPowerPopup, cancelOpenPower, confirmOpenPower, setShowKfPopup} = usePhoneCall();
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [{title: "农服"}, {title: "农资"}];
  const [farmDataList, setFarmDataList] = useState<FarmDataListItem[]>([]);
  const [farmDataList1, setFarmDataList1] = useState<FarmDataListItem[]>([]);
  const [farmDataList2, setFarmDataList2] = useState<FarmDataListItem[]>([]);
  const [farmSeviceList, setFarmSeviceList] = useState<FarmServiceListItem[]>([]);
  const [farmSeviceList1, setFarmSeviceList1] = useState<FarmServiceListItem[]>([]);
  const [farmSeviceList2, setFarmSeviceList2] = useState<FarmServiceListItem[]>([]);
  const [farmSevicePageSize] = useState(10);
  const [farmDataPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectFarmDataList, setSelectFarmDataList] = useState<FarmDataListItem[]>([]);
  const [toPage, setToPage] = useState(0);
  const [triggered, setTriggered] = useState(false);
  const [freshing, setFreshing] = useState(false);
  const [showShoppingCartPopup, setShowShoppingCartPopup] = useState(false);

  useEffect(() => {
    getFarmServiceListData(0);
  }, []);

  // 监听农资数量变化，更新选中列表
  useEffect(() => {
    setSelectFarmDataList(farmDataList.filter(item => item.num > 0));
  }, [farmDataList]);

  // 计算总价
  const priceTotal = React.useMemo(() => {
    let total = 0;
    selectFarmDataList.forEach(item => {
      total += Number(item.price) * item.num;
    });
    return Number(total.toFixed(2));
  }, [selectFarmDataList]);

  // 切换Tab
  const changeTab = (index: number) => {
    setActiveTab(index);
    setToPage(0);
    if (index === 1) {
      getFarmDataListData(0);
    } else {
      getFarmServiceListData(0);
    }
  };

  // 查看农服详情
  const viewFarmServiceDetail = (item: FarmServiceListItem) => {
    console.log("查看农服详情:", item);
    // navigation.navigate('FarmServiceDetail', { farmServiceInfo: item });
  };

  // 农服下单
  const submitFarmSrvice = (item: FarmServiceListItem) => {
    console.log("农服下单:", item);
    // navigation.navigate('FarmServiceOrder', { farmServiceInfo: item });
  };

  // 瀑布流拆分双列数据
  const splitIntoTwoColumns = (list: any[]) => {
    const half = Math.ceil(list.length / 2);
    const list1 = list.slice(0, half);
    const list2 = list.slice(half);
    return {list1, list2};
  };

  // 获取农服列表
  const getFarmServiceListData = async (num: number) => {
    if (loading) return;
    setLoading(true);
    try {
      const {data} = await getFarmServiceList({
        pageSize: farmSevicePageSize,
        pageNum: num,
      });
      console.log("农服列表数据:", data);
      if (!data.list.length) {
        if (num > 0) {
          showCustomToast("error", "暂无更多农服数据");
        }
        return;
      }
      console.log("农服列表数据:", data.list);
      const newList = num === 0 ? data.list : [...farmSeviceList, ...data.list];
      setFarmSeviceList(newList);
      const {list1: l1, list2: l2} = splitIntoTwoColumns(newList);
      setFarmSeviceList1(l1);
      setFarmSeviceList2(l2);
    } catch (error) {
      console.error("获取农服列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 获取农资列表
  const getFarmDataListData = useCallback(
    async (num: number) => {
      try {
        const {data} = await getFarmDataList({
          pageSize: farmDataPageSize,
          pageNum: num,
        });

        if (!data.list.length) {
          if (num > 0) return;
          return;
        }

        // 初始化数量为0
        const newList = data.list.map((item: any) => ({...item, num: 0}));
        const finalList = num === 0 ? newList : [...farmDataList, ...newList];

        // 合并购物车数据
        const cartList = await getCartList();
        const mergedList = finalList.map((item: {id: any}) => {
          const cartItem = cartList.find((c: {id: any}) => c.id === item.id);
          return cartItem ? {...item, num: cartItem.num} : item;
        });

        setFarmDataList(mergedList);
        const {list1: l1, list2: l2} = splitIntoTwoColumns(mergedList);
        setFarmDataList1(l1);
        setFarmDataList2(l2);
      } catch (error) {
        console.error("获取农资列表失败:", error);
      }
    },
    [farmDataList, loading, farmDataPageSize],
  );

  // 获取购物车列表
  const getCartList = useCallback(async () => {
    try {
      const {data} = await getFarmCartList();
      return data || [];
    } catch (error) {
      console.error("获取购物车失败:", error);
      return [];
    }
  }, []);

  // 增加农资数量
  const addTotalNumber = useCallback(
    debounce(async (data: FarmDataListItem) => {
      const newList = farmDataList.map(item => {
        if (item.id === data.id) {
          const newNum = item.num + 1;
          // 更新购物车
          editFarmCart({goodsId: item.id, num: newNum});
          return {...item, num: newNum};
        }
        return item;
      });
      setFarmDataList(newList);
    }, 100),
    [farmDataList],
  );

  // 减少农资数量
  const reduceTotalNumber = useCallback(
    debounce(async (data: FarmDataListItem) => {
      const newList = farmDataList.map(item => {
        if (item.id === data.id && item.num > 0) {
          const newNum = item.num - 1;
          // 更新购物车
          editFarmCart({goodsId: item.id, num: newNum});
          return {...item, num: newNum};
        }
        return item;
      });
      setFarmDataList(newList);
    }, 100),
    [farmDataList],
  );

  // 查看农资详情
  const viewFarmDataDetail = (item: FarmDataListItem) => {
    console.log("查看农资详情:", item);
    // navigation.navigate('DataDetail', { farmDataInfo: item, selectFarmDataList });
  };

  // 查看购物车
  const viewShoppingCart = () => {
    console.log("查看购物车:");
    setShowShoppingCartPopup(!showShoppingCartPopup);
  };

  // 结算
  const submitTotal = () => {
    if (!priceTotal) return;
    console.log("结算:", selectFarmDataList);
    // navigation.navigate('DataOrder', { farmDataList: selectFarmDataList });
  };

  // 下拉刷新
  const onRefresh = useCallback(() => {
    if (freshing) return;
    setFreshing(true);
    setTriggered(true);

    setTimeout(async () => {
      setTriggered(false);
      setFreshing(false);
      setSelectFarmDataList([]);
      setFarmDataList([]);
      setToPage(0);

      if (activeTab === 0) {
        getFarmServiceListData(0);
      } else {
        await getFarmDataListData(0);
      }
    }, 500);
  }, [activeTab, freshing]);

  // 上拉加载
  const onReachScollBottom = useCallback(() => {
    const nextPage = toPage + 1;
    setToPage(nextPage);

    if (activeTab === 0) {
      getFarmServiceListData(nextPage);
    } else {
      getFarmDataListData(nextPage);
    }
  }, [activeTab, toPage]);

  // 页面显示/隐藏生命周期
  useEffect(() => {
    // 页面显示时获取购物车
    const loadCart = async () => {
      await getCartList();
      if (activeTab === 1) {
        await getFarmDataListData(0);
      } else {
        await getFarmServiceListData(0);
      }
    };
    loadCart();

    // 页面隐藏时清空数据
    return () => {
      setFarmDataList([]);
    };
  }, [activeTab]);

  // 渲染农服瀑布流项
  const renderFarmServiceItem = (item: FarmServiceListItem) => (
    <TouchableOpacity style={FarmSupplieMallScreenStyles.waterfallItem} onPress={() => viewFarmServiceDetail(item)}>
      <Image
        source={{uri: item.images[0]?.url || ""}}
        style={FarmSupplieMallScreenStyles.waterfallItemImage}
        resizeMode="cover"
      />
      <View style={FarmSupplieMallScreenStyles.waterfallItemInfo}>
        <Text style={FarmSupplieMallScreenStyles.waterfallItemTitle}>{item.name}</Text>
        <View style={FarmSupplieMallScreenStyles.priceRow}>
          <Text style={FarmSupplieMallScreenStyles.priceText}>
            ￥<Text style={FarmSupplieMallScreenStyles.priceNum}>{item.price}</Text>
            <Text style={FarmSupplieMallScreenStyles.unitText}>/亩</Text>
          </Text>
          <TouchableOpacity style={FarmSupplieMallScreenStyles.orderBtn} onPress={() => submitFarmSrvice(item)}>
            <Text style={FarmSupplieMallScreenStyles.orderBtnText}>下单</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // 渲染农资瀑布流项
  const renderFarmDataItem = (item: FarmDataListItem) => (
    <TouchableOpacity style={FarmSupplieMallScreenStyles.waterfallItem} onPress={() => viewFarmDataDetail(item)}>
      <Image
        source={{uri: item.images[0]?.url || ""}}
        style={FarmSupplieMallScreenStyles.waterfallItemImage}
        resizeMode="cover"
      />
      <View style={FarmSupplieMallScreenStyles.waterfallItemInfo}>
        <Text style={FarmSupplieMallScreenStyles.waterfallItemTitle} numberOfLines={1}>
          {item.goodsName}
        </Text>
        <Text style={FarmSupplieMallScreenStyles.waterfallItemNorms}>{`规格: ${item.spec}`}</Text>
        <View style={FarmSupplieMallScreenStyles.priceRow}>
          <Text style={FarmSupplieMallScreenStyles.priceText}>
            ￥<Text style={FarmSupplieMallScreenStyles.priceNum}>{item.price}</Text>
          </Text>
          <View style={FarmSupplieMallScreenStyles.operRow}>
            {item.num > 0 && (
              <TouchableOpacity onPress={() => reduceTotalNumber(item)} style={FarmSupplieMallScreenStyles.operBtn}>
                <Image
                  source={require("@/assets/images/mall/icon-reduce.png")}
                  style={FarmSupplieMallScreenStyles.operIcon}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
            {item.num > 0 && <Text style={FarmSupplieMallScreenStyles.quantityText}>{item.num}</Text>}
            <TouchableOpacity onPress={() => addTotalNumber(item)} style={FarmSupplieMallScreenStyles.operBtn}>
              <Image
                source={require("@/assets/images/mall/icon-add.png")}
                style={FarmSupplieMallScreenStyles.operIcon}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={FarmSupplieMallScreenStyles.container}>
      {/* 导航栏 */}
      <LinearGradient colors={["#41C95B", "#1AB850"]} style={FarmSupplieMallScreenStyles.navbar}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={FarmSupplieMallScreenStyles.tabs}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              style={FarmSupplieMallScreenStyles.tabItem}
              activeOpacity={1}
              onPress={() => changeTab(index)}>
              <Text style={[FarmSupplieMallScreenStyles.tabText, activeTab === index && FarmSupplieMallScreenStyles.activeText]}>
                {tab.title}
              </Text>
              {activeTab === index && <View style={FarmSupplieMallScreenStyles.underline} />}
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={FarmSupplieMallScreenStyles.deviceContent}
          onPress={() => setShowKfPopup(true)}
          activeOpacity={1}>
          <Image source={require("@/assets/images/mall/icon-kf.png")} style={FarmSupplieMallScreenStyles.deviceIcon} />
        </TouchableOpacity>
      </LinearGradient>
      {/* 农服 Tab */}
      {activeTab === 0 && (
        <ScrollView
          style={FarmSupplieMallScreenStyles.scrollView}
          refreshControl={<RefreshControl refreshing={triggered} onRefresh={onRefresh} progressViewOffset={100} />}
          onEndReached={onReachScollBottom}
          onEndReachedThreshold={0.1}>
          {farmSeviceList.length > 0 ? (
            <View style={FarmSupplieMallScreenStyles.container}>
              <View style={FarmSupplieMallScreenStyles.waterfallContainer}>
                {/* 第一列 */}
                <FlashList
                  data={farmSeviceList1}
                  renderItem={({item}) => renderFarmServiceItem(item)}
                  estimatedItemSize={400}
                  contentContainerStyle={FarmSupplieMallScreenStyles.listColumn}
                  showsVerticalScrollIndicator={false}
                />
                {/* 第二列 */}
                <FlashList
                  data={farmSeviceList2}
                  renderItem={({item}) => renderFarmServiceItem(item)}
                  estimatedItemSize={400}
                  contentContainerStyle={FarmSupplieMallScreenStyles.listColumn}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </View>
          ) : (
            <View style={FarmSupplieMallScreenStyles.noDataContainer}>
              <Image
                source={require("@/assets/images/mall/no-data.png")}
                style={FarmSupplieMallScreenStyles.noDataImage}
                resizeMode="cover"
              />
              <Text style={FarmSupplieMallScreenStyles.noDataTips}>暂无农服，敬请期待 ~</Text>
            </View>
          )}
        </ScrollView>
      )}
      {/* 农资 Tab */}
      {activeTab === 1 && (
        <View style={FarmSupplieMallScreenStyles.farmDataContainer}>
          <ScrollView
            style={FarmSupplieMallScreenStyles.farmDataScroll}
            refreshControl={<RefreshControl refreshing={triggered} onRefresh={onRefresh} progressViewOffset={100} />}
            onEndReached={onReachScollBottom}
            onEndReachedThreshold={0.1}>
            {farmDataList.length > 0 ? (
              <View style={FarmSupplieMallScreenStyles.waterfallContainer}>
                <FlashList
                  data={farmDataList1}
                  renderItem={({item}) => renderFarmDataItem(item)}
                  estimatedItemSize={400}
                  contentContainerStyle={FarmSupplieMallScreenStyles.listColumn}
                  showsVerticalScrollIndicator={false}
                />
                <FlashList
                  data={farmDataList2}
                  renderItem={({item}) => renderFarmDataItem(item)}
                  estimatedItemSize={400}
                  contentContainerStyle={FarmSupplieMallScreenStyles.listColumn}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            ) : (
              <View style={FarmSupplieMallScreenStyles.noDataContainer}>
                <Image
                  source={require("@/assets/images/mall/no-data.png")}
                  style={FarmSupplieMallScreenStyles.noDataImage}
                  resizeMode="cover"
                />
                <Text style={FarmSupplieMallScreenStyles.noDataTips}>暂无农资产品，敬请期待 ~</Text>
              </View>
            )}
          </ScrollView>

          {/* 结算栏 */}
          <View style={FarmSupplieMallScreenStyles.totalBar}>
            <View style={FarmSupplieMallScreenStyles.totalInfo}>
              <Text style={FarmSupplieMallScreenStyles.totalText}>
                合计:<Text style={FarmSupplieMallScreenStyles.priceIcontext}>￥</Text>
                <Text style={FarmSupplieMallScreenStyles.totalPrice}>{priceTotal}</Text>
              </Text>
              <TouchableOpacity style={FarmSupplieMallScreenStyles.viewCartBtn} onPress={viewShoppingCart}>
                <Text style={FarmSupplieMallScreenStyles.viewCartText}>查看购物车</Text>
                <Image
                  source={
                    showShoppingCartPopup
                      ? require("@/assets/images/mall/icon-up.png")
                      : require("@/assets/images/mall/icon-down.png")
                  }
                  style={FarmSupplieMallScreenStyles.downIcon}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[FarmSupplieMallScreenStyles.payBtn, !priceTotal && FarmSupplieMallScreenStyles.payBtnDisabled]}
              onPress={submitTotal}
              disabled={!priceTotal}>
              <Text style={FarmSupplieMallScreenStyles.payBtnText}>结算</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 购物车弹窗 */}
      {showShoppingCartPopup && <ShoppingCar dataList={selectFarmDataList} onClose={() => setShowShoppingCartPopup(false)} />}

      {/* 客服电话弹窗 */}
      {showKfPopup && <CustomerServicePopup onClosePopup={() => setShowKfPopup(false)} />}

      {/* 开启电话权限弹窗 */}
      <PermissionPopup
        visible={isShowPowerPopup}
        title="开启电话权限"
        message="开启电话权限将用于获取拨打客服电话"
        onReject={cancelOpenPower}
        onAccept={confirmOpenPower}
      />
    </View>
  );
};

export default FarmSupplieMallScreen;
