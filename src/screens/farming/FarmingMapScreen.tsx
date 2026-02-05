// 农事地图
import {View, Text, Image, TouchableOpacity, ActivityIndicator, ScrollView} from "react-native";
import {FarmStackParamList} from "@/types/navigation";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import CustomStatusBar from "@/components/common/CustomStatusBar";
import {FarmingMapScreenStyles} from "./styles/FarmingMapScreen";
import {useState, useEffect} from "react";
import React from "react";
import {Global} from "@/styles/global";
import FarmFilterModal from "./components/FarmFilterModal";
import {getFarmingList} from "@/services/farming";
import {showCustomToast} from "@/components/common/CustomToast";
import {FarmingTypeListItem, FarmTypeListItem} from "@/types/farming";
import {updateStore} from "@/stores/updateStore";

// 字典数据类型定义
interface DictData {
  dictLabel: string;
  dictValue: string;
  icon?: string;
}

const FarmingMapScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<FarmStackParamList>>();
  const [activeTab, setActiveTab] = useState<string>("1");
  const [loading, setLoading] = useState<boolean>(false);
  const [tabDataCache, setTabDataCache] = useState<Record<string, any[]>>({
    "1": [],
    "2": [],
  });
  const [farmingList, setFarmingList] = useState<any[]>([]);
  const tabs = [
    {title: "作业中", type: "1"},
    {title: "已完成", type: "2"},
  ];
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  useEffect(() => {
    setLoading(true);
    getFarmingListData();
  }, [activeTab, updateStore.farmingRefreshId]);

  // 切换标签
  const changeTab = async (tab: {title: string; type: string}) => {
    setActiveTab(tab.type);
    setFilterModalVisible(false);
    // 如果有缓存数据，先显示缓存
    if (tabDataCache[tab.type]?.length) {
      setFarmingList(tabDataCache[tab.type]);
    }
  };

  // 筛选按钮点击事件
  const handleFilterPress = () => {
    setFilterModalVisible(!filterModalVisible);
  };

  // 筛选确认回调
  const handleFilterConfirm = (filters: {cropType: DictData; farmingTypes: FarmingTypeListItem[]}) => {
    console.log("选中的筛选条件：", filters);
    setFilterModalVisible(false);
    if (!filters.cropType && filters.farmingTypes.length === 0) {
      getFarmingListData();
    } else {
      getFarmingListData({
        dictValue: filters.cropType.dictValue,
        farmingScienceTypelds: filters.farmingTypes.map(type => type.farmingTypeId),
      });
    }
  };

  // 查看农事详情
  const viewFarmingDetail = (item: any) => {
    console.log("查看农事详情：", item);
    navigation.navigate("FarmingDetail", {
      farmingId: item.farmingId,
      id: item.farmingJoinTypeId,
      workStatus: activeTab,
      navTitle: item.farmingTypeName,
    });
  };

  // 获取农事列表数据
  const getFarmingListData = async (filters?: any) => {
    try {
      const {data} = await getFarmingList({type: "1", workStatus: activeTab, ...filters});
      console.log("农事列表数据：", data);
      setLoading(false);
      setFarmingList(data);
      // 更新缓存
      setTabDataCache(prev => ({
        ...prev,
        [activeTab]: data,
      }));
      updateStore.triggerFarmingRefresh();
    } catch (error) {
      showCustomToast("error", "获取农事列表失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 渲染农事类型子项
  const renderFarmingTypeItem = (item: any, farmingId: string) => {
    return (
      <TouchableOpacity
        style={FarmingMapScreenStyles.farmingTypeItem}
        activeOpacity={0.8}
        onPress={() => viewFarmingDetail({...item, farmingId})}
        key={item.farmingJoinTypeId}>
        <Text style={FarmingMapScreenStyles.farmingTypeName}>{item.farmingTypeName}</Text>
        <View style={FarmingMapScreenStyles.farmingTypeRight}>
          <Text style={activeTab === "1" ? FarmingMapScreenStyles.farmingAreaText : FarmingMapScreenStyles.farmingAreaTextActive}>
            {item.totalArea.toFixed(2)}亩
          </Text>
          <Image
            source={require("@/assets/images/common/icon-right.png")}
            style={FarmingMapScreenStyles.arrowIcon}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
    );
  };

  // 渲染农事列表项（作物分类卡片）
  const renderListItem = (item: any) => {
    return (
      <View style={FarmingMapScreenStyles.farmingCard} key={item.farmingId}>
        {/* 作物标题栏 */}
        <View style={FarmingMapScreenStyles.cropHeader}>
          <Image source={{uri: item.imgUrl}} style={FarmingMapScreenStyles.cropIcon} resizeMode="contain" />
          <Text style={FarmingMapScreenStyles.cropNameText}>{item.farmingName}</Text>
        </View>
        {/* 农事类型列表 */}
        <View style={FarmingMapScreenStyles.farmingTypesContainer}>
          {item.farmingJoinTypeVoList.map((typeItem: any) => (
            <React.Fragment key={typeItem.farmingJoinTypeId}>
              {renderFarmingTypeItem(typeItem, item.farmingId)}
              {/* 最后一项不加分割线 */}
              {typeItem.farmingJoinTypeId !==
                item.farmingJoinTypeVoList[item.farmingJoinTypeVoList.length - 1].farmingJoinTypeId && (
                <View style={FarmingMapScreenStyles.typeItemDivider} />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>
    );
  };

  // 渲染加载中/空数据/列表内容
  const renderContent = () => {
    if (loading) {
      // 加载中状态
      return (
        <View style={FarmingMapScreenStyles.loadingContainer}>
          <ActivityIndicator size="large" color={Global.colors.primary} />
          <Text style={FarmingMapScreenStyles.loadingText}>加载中...</Text>
        </View>
      );
    }

    if (farmingList.length > 0) {
      // 有数据
      return (
        <ScrollView style={FarmingMapScreenStyles.listContainer} showsVerticalScrollIndicator={false}>
          <View style={FarmingMapScreenStyles.listContent}>{farmingList.map(item => renderListItem(item))}</View>
        </ScrollView>
      );
    } else {
      // 无数据
      return (
        <View style={FarmingMapScreenStyles.noDataContainer}>
          <Image
            source={require("@/assets/images/common/contract-empty.png")}
            style={FarmingMapScreenStyles.noDataIcon}
            resizeMode="contain"
          />
          <Text style={FarmingMapScreenStyles.noDataText}>暂无数据</Text>
        </View>
      );
    }
  };

  return (
    <View style={FarmingMapScreenStyles.container}>
      {/* 自定义状态栏 */}
      <CustomStatusBar navTitle={"农事地图"} onBack={() => navigation.goBack()} />

      {/* 标签导航 */}
      <View style={FarmingMapScreenStyles.navbar}>
        <View style={FarmingMapScreenStyles.tabsContainer}>
          {tabs.map((tab, index) => (
            <TouchableOpacity key={index} style={FarmingMapScreenStyles.tabItem} activeOpacity={1} onPress={() => changeTab(tab)}>
              <Text style={[FarmingMapScreenStyles.tabText, activeTab === tab.type && FarmingMapScreenStyles.activeTabText]}>
                {tab.title}
              </Text>
              {activeTab === tab.type && <View style={FarmingMapScreenStyles.underline} />}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={FarmingMapScreenStyles.filterBtn} activeOpacity={1} onPress={handleFilterPress}>
          <Text style={[FarmingMapScreenStyles.filterBtnText, filterModalVisible && FarmingMapScreenStyles.filterBtnTextActive]}>
            筛选
          </Text>
          <Image
            source={
              filterModalVisible
                ? require("@/assets/images/common/icon-filter-active.png")
                : require("@/assets/images/common/icon-filter.png")
            }
            style={FarmingMapScreenStyles.filterBtnImg}
          />
        </TouchableOpacity>
      </View>

      {/* 农事列表 */}
      {renderContent()}

      {/* 筛选器弹窗 */}
      <FarmFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onConfirm={handleFilterConfirm}
      />
    </View>
  );
};

export default FarmingMapScreen;
