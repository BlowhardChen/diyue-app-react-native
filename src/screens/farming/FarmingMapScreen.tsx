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

// 模拟农事数据（匹配设计图）
const MOCK_FARMING_DATA = [
  {
    id: "1",
    cropName: "2025小麦种植",
    icon: require("@/assets/images/farming/icon-wheat.png"), // 需替换为实际小麦图标路径
    farmingTypes: [
      {id: "1-1", name: "犁地", area: "20.2亩"},
      {id: "1-2", name: "旋耕", area: "20.2亩"},
      {id: "1-3", name: "深耕", area: "20.2亩"},
      {id: "1-4", name: "播种", area: "20.2亩"},
    ],
  },
  {
    id: "2",
    cropName: "2025玉米收获",
    icon: require("@/assets/images/farming/icon-corn.png"), // 需替换为实际玉米图标路径
    farmingTypes: [{id: "2-1", name: "收割", area: "20.2亩"}],
  },
];

// 定义筛选选项类型
type CropType = "小麦" | "玉米" | "大豆" | "水稻";
type FarmingType = "犁地" | "旋耕" | "深耕" | "播种";

const FarmingMapScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<FarmStackParamList>>();
  const [activeTab, setActiveTab] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(false);
  const [tabDataCache, setTabDataCache] = useState<Record<string, any[]>>({
    "0": [],
    "1": [],
  });
  const [farmingList, setFarmingList] = useState<any[]>([]);
  const tabs = [
    {title: "作业中", type: "0"},
    {title: "已完成", type: "1"},
  ];
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  // 新增状态：保存选中的筛选条件
  const [selectedFilters, setSelectedFilters] = useState({
    cropTypes: [] as CropType[],
    farmingTypes: [] as FarmingType[],
  });

  // 模拟加载数据
  useEffect(() => {
    setLoading(true);
    // 模拟接口请求
    setTimeout(() => {
      setFarmingList(MOCK_FARMING_DATA);
      tabDataCache[activeTab] = MOCK_FARMING_DATA;
      setTabDataCache({...tabDataCache});
      setLoading(false);
    }, 800);
  }, [activeTab]);

  // 切换标签
  const changeTab = async (tab: {title: string; type: string}) => {
    setActiveTab(tab.type);
    // 如果有缓存数据，先显示缓存
    if (tabDataCache[tab.type]?.length) {
      setFarmingList(tabDataCache[tab.type]);
    } else {
      // 无缓存时加载数据（这里模拟加载）
      setLoading(true);
      setTimeout(() => {
        setFarmingList(MOCK_FARMING_DATA);
        tabDataCache[tab.type] = MOCK_FARMING_DATA;
        setTabDataCache({...tabDataCache});
        setLoading(false);
      }, 800);
    }
  };

  // 筛选按钮点击事件
  const handleFilterPress = () => {
    setFilterModalVisible(!filterModalVisible);
  };

  // 筛选确认回调
  const handleFilterConfirm = (filters: {cropTypes: CropType[]; farmingTypes: FarmingType[]}) => {
    setSelectedFilters(filters);
    // 这里可以根据筛选条件重新请求数据
    console.log("筛选条件：", filters);
    // 示例：重新加载列表数据
    // loadFarmingData(filters);
    setFilterModalVisible(false);
  };

  // 查看农事详情
  const viewFarmingDetail = (item: any) => {
    navigation.navigate("FarmingDetail", {id: item.id, navTitle: "农事详情"});
  };

  // 渲染农事类型子项（犁地/旋耕等）
  const renderFarmingTypeItem = (item: any) => {
    return (
      <TouchableOpacity style={FarmingMapScreenStyles.farmingTypeItem} activeOpacity={1} onPress={() => viewFarmingDetail(item)}>
        <Text style={FarmingMapScreenStyles.farmingTypeName}>{item.name}</Text>
        <View style={FarmingMapScreenStyles.farmingTypeRight}>
          <Text style={activeTab === "0" ? FarmingMapScreenStyles.farmingAreaText : FarmingMapScreenStyles.farmingAreaTextActive}>
            {item.area}
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
      <View style={FarmingMapScreenStyles.farmingCard} key={item.id}>
        {/* 作物标题栏 */}
        <View style={FarmingMapScreenStyles.cropHeader}>
          <Image source={item.icon} style={FarmingMapScreenStyles.cropIcon} resizeMode="contain" />
          <Text style={FarmingMapScreenStyles.cropNameText}>{item.cropName}</Text>
        </View>
        {/* 农事类型列表 */}
        <View style={FarmingMapScreenStyles.farmingTypesContainer}>
          {item.farmingTypes.map((typeItem: any) => (
            <React.Fragment key={typeItem.id}>
              {renderFarmingTypeItem(typeItem)}
              {/* 最后一项不加分割线 */}
              {typeItem.id !== item.farmingTypes[item.farmingTypes.length - 1].id && (
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
        initialFilters={selectedFilters} // 回显已选中的条件
      />
    </View>
  );
};

export default FarmingMapScreen;
