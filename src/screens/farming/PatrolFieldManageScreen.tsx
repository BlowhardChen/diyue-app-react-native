// 巡田管理
import React, {useState, useEffect} from "react";
import {View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import {PatrolParamList} from "@/types/navigation";
import CustomStatusBar from "@/components/common/CustomStatusBar";
import {PatrolFieldManageScreenStyles} from "./styles/PatrolFieldManageScreen";
import {patrolTaskList} from "@/services/farming";
import {showCustomToast} from "@/components/common/CustomToast";
import {Global} from "@/styles/global";

// 巡田任务列表项类型
interface PatrolListItemType {
  id: number;
  status: string;
  taskName: string;
  userId: number;
}

// 主组件
const PatrolFieldManageScreen: React.FC = ({}) => {
  const navigation = useNavigation<StackNavigationProp<PatrolParamList>>();
  const [activeTab, setActiveTab] = useState<string>("0");
  const [patrolList, setPatrolList] = useState<PatrolListItemType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [tabDataCache, setTabDataCache] = useState<Record<string, PatrolListItemType[]>>({
    "0": [],
    "1": [],
  });

  // 标签数据
  const tabs = [
    {title: "待完成", type: "0"},
    {title: "已完成", type: "1"},
  ];

  // 返回
  const backView = () => {
    navigation.goBack();
  };

  // 查看异常记录
  const viewAbnormalRecord = () => {
    navigation.navigate("AbnormalRecord");
  };

  // 切换标签
  const changeTab = async (tab: {title: string; type: string}) => {
    setActiveTab(tab.type);
    // 如果有缓存数据，先显示缓存，再请求最新数据
    if (tabDataCache[tab.type]?.length) {
      setPatrolList(tabDataCache[tab.type]);
    }
  };

  // 去巡田
  const goPatrolField = (item: PatrolListItemType) => {
    navigation.navigate("PatrolManage", {id: item.id});
  };

  // 查看巡田详情
  const viewPatrolFieldDetail = (item: PatrolListItemType) => {
    navigation.navigate("PatrolDetail", {id: item.id});
  };

  // 异常上报
  const reportAbnormal = () => {
    navigation.navigate("AbnormalUpload");
  };

  // 获取巡田记录列表
  const getPatrolRecordList = async () => {
    // 如果是首次加载且无缓存，才显示加载中
    const hasCache = tabDataCache[activeTab]?.length > 0;
    if (!hasCache) {
      setLoading(true);
    }

    try {
      const {data} = await patrolTaskList({status: activeTab});
      setPatrolList(data);
      // 更新缓存
      setTabDataCache(prev => ({
        ...prev,
        [activeTab]: data,
      }));
    } catch (error) {
      showCustomToast("error", "获取巡田记录失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPatrolRecordList();
  }, [activeTab]);

  // 渲染列表项
  const renderListItem = (item: PatrolListItemType) => {
    if (activeTab === "0") {
      // 待完成项
      return (
        <View style={PatrolFieldManageScreenStyles.listItemContainer}>
          <View style={PatrolFieldManageScreenStyles.itemLeft}>
            <Image
              source={require("@/assets/images/farming/icon-wait-orgin.png")}
              style={PatrolFieldManageScreenStyles.itemIcon}
              resizeMode="contain"
            />
            <Text style={PatrolFieldManageScreenStyles.itemText}>{item.taskName}</Text>
          </View>
          <TouchableOpacity style={PatrolFieldManageScreenStyles.goPatrolButton} onPress={() => goPatrolField(item)}>
            <Text style={PatrolFieldManageScreenStyles.goPatrolText}>去巡田</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      // 已完成项
      return (
        <View style={PatrolFieldManageScreenStyles.listItemContainer}>
          <View style={PatrolFieldManageScreenStyles.itemLeft}>
            <Image
              source={require("@/assets/images/farming/icon-wait-blue.png")}
              style={PatrolFieldManageScreenStyles.itemIcon}
              resizeMode="contain"
            />
            <Text style={PatrolFieldManageScreenStyles.itemText}>{item.taskName}</Text>
          </View>
          <TouchableOpacity style={PatrolFieldManageScreenStyles.detailButton} onPress={() => viewPatrolFieldDetail(item)}>
            <Image
              source={require("@/assets/images/common/icon-right.png")}
              style={PatrolFieldManageScreenStyles.rightIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      );
    }
  };

  // 渲染加载中/空数据/列表内容
  const renderContent = () => {
    if (loading) {
      // 加载中状态
      return (
        <View style={PatrolFieldManageScreenStyles.loadingContainer}>
          <ActivityIndicator size="large" color={Global.colors.primary} />
          <Text style={PatrolFieldManageScreenStyles.loadingText}>加载中...</Text>
        </View>
      );
    }

    if (patrolList.length > 0) {
      // 有数据
      return (
        <ScrollView style={PatrolFieldManageScreenStyles.listContainer} showsVerticalScrollIndicator={false}>
          <View style={PatrolFieldManageScreenStyles.listContent}>
            {patrolList.map(item => (
              <React.Fragment key={item.id}>{renderListItem(item)}</React.Fragment>
            ))}
          </View>
        </ScrollView>
      );
    } else {
      // 无数据
      return (
        <View style={PatrolFieldManageScreenStyles.noDataContainer}>
          <Image
            source={require("@/assets/images/common/contract-empty.png")}
            style={PatrolFieldManageScreenStyles.noDataIcon}
            resizeMode="contain"
          />
          <Text style={PatrolFieldManageScreenStyles.noDataText}>暂无数据</Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={PatrolFieldManageScreenStyles.container}>
      {/* 导航栏 */}
      <CustomStatusBar
        navTitle="巡田管理"
        rightTitle="异常记录"
        rightBtnColor={{color: "#555", fontSize: 15, fontWeight: "500"}}
        onBack={backView}
        onRightPress={viewAbnormalRecord}
      />

      {/* 标签导航 */}
      <View style={PatrolFieldManageScreenStyles.navbar}>
        <View style={PatrolFieldManageScreenStyles.tabsContainer}>
          {tabs.map((tab, index) => (
            <TouchableOpacity key={index} style={PatrolFieldManageScreenStyles.tabItem} onPress={() => changeTab(tab)}>
              <Text
                style={[
                  PatrolFieldManageScreenStyles.tabText,
                  activeTab === tab.type && PatrolFieldManageScreenStyles.activeTabText,
                ]}>
                {tab.title}
              </Text>
              {activeTab === tab.type && <View style={PatrolFieldManageScreenStyles.underline} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 列表区域 */}
      {renderContent()}

      {/* 底部按钮 */}
      <View style={PatrolFieldManageScreenStyles.bottomButtonContainer}>
        <TouchableOpacity style={PatrolFieldManageScreenStyles.reportButton} onPress={reportAbnormal}>
          <Text style={PatrolFieldManageScreenStyles.reportButtonText}>异常上报</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PatrolFieldManageScreen;
