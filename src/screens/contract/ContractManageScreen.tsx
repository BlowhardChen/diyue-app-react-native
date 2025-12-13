import React, {useState, useEffect, useRef} from "react";
import {View, Text, Image, ScrollView, TouchableOpacity, RefreshControl, Alert, Dimensions, StyleSheet} from "react-native";
import {NavigationProp, useNavigation} from "@react-navigation/native";
import CustomStatusBar from "@/components/common/CustomStatusBar";
import Popup from "@/components/common/Popup";
import FilterPopup from "@/components/land/FilterPopup";

// 类型定义
type ContractListItemType = {
  id: string;
  contractNo: string;
  relename: string;
  mobile?: string;
  cancellationTime?: string;
  createTime: string;
  landGps?: string;
};

type PopupSearchQueryType = {
  [key: string]: any;
};

type ContractTypeTab = {
  title: string;
  value: string;
};

// 模拟接口服务
const contractService = {
  getContractMessageList: async (params: {contracStatus: string; pageNum: number; pageSize: number; [key: string]: any}) => {
    // 实际项目替换为真实接口请求
    return {
      data: {
        list: [] as ContractListItemType[],
        total: 0,
      },
    };
  },
  cancelContractMessage: async (params: {id: string}) => {
    // 实际项目替换为真实接口请求
    return {success: true};
  },
};

// 屏幕尺寸
const {width, height} = Dimensions.get("window");
const px2dp = (px: number) => (width / 750) * px;

const ContractManageScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  // 状态管理
  const [showQueryPopup, setShowQueryPopup] = useState(false);
  const [contractTypeTabs] = useState<ContractTypeTab[]>([
    {title: "未生效", value: "1"},
    {title: "生效中", value: "2"},
    {title: "已到期", value: "3"},
    {title: "已作废", value: "4"},
  ]);
  const [activeType, setActiveType] = useState<ContractTypeTab>({
    title: "生效中",
    value: "2",
  });
  const [contractDataList, setContractDataList] = useState<ContractListItemType[]>([]);
  const [contractTotal, setContractTotal] = useState(0);
  const [pageNum, setPageNum] = useState(0);
  const [pageSize] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [contractId, setContractId] = useState("");

  // 返回上一页
  const backView = () => {
    navigation.goBack();
  };

  // 打开/关闭筛选弹窗
  const openQueryPopup = () => setShowQueryPopup(true);
  const closeQueryPopup = () => setShowQueryPopup(false);

  // 搜索合同
  const searchContract = (query: PopupSearchQueryType) => {
    setShowQueryPopup(false);
    getContractDataList(query);
  };

  // 切换合同状态
  const changeContractType = (item: ContractTypeTab) => {
    setActiveType(item);
    setPageNum(0);
    getContractDataList();
  };

  // 获取合同列表数据
  const getContractDataList = async (params: PopupSearchQueryType = {}) => {
    try {
      const {data} = await contractService.getContractMessageList({
        contracStatus: activeType.value,
        pageNum,
        pageSize,
        ...params,
      });

      const newList = pageNum === 0 ? data.list : [...contractDataList, ...data.list];
      setContractDataList(newList);
      setContractTotal(newList.length);
    } catch (error: any) {
      Alert.alert("提示", error?.data?.msg || "请求失败");
      throw error;
    }
  };

  // 查看合同详情
  const viewContractDetail = (item: ContractListItemType) => {
    navigation.navigate("/pages/contract/contract-detail", {
      contractType: activeType.title,
      contractInfo: JSON.stringify(item),
    });
  };

  // 作废合同（打开确认弹窗）
  const cancelContract = (item: ContractListItemType) => {
    setContractId(item.id);
    setShowSavePopup(true);
  };

  // 续约合同（待实现）
  const renewContract = (item: ContractListItemType) => {};

  // 编辑合同
  const editContract = (item: ContractListItemType) => {
    navigation.navigate("/pages/contract/new-contract", {
      contractType: "编辑",
      landInfo: JSON.stringify(item),
      landCoordinates: item.landGps,
    });
  };

  // 查看合同
  const viewContract = (item: ContractListItemType) => {
    navigation.navigate("/pages/contract/electronic-contract-details", {
      contractInfo: JSON.stringify(item),
      page: "列表",
    });
  };

  // 作废弹窗取消
  const handleCancel = () => setShowSavePopup(false);

  // 作废弹窗确认
  const handleConfirm = async () => {
    try {
      await contractService.cancelContractMessage({id: contractId});
      Alert.alert("提示", "操作成功");
      getContractDataList();
    } catch (error: any) {
      Alert.alert("提示", error?.data?.msg || "操作失败");
      throw error;
    }
    setShowSavePopup(false);
  };

  // 下拉刷新
  const onRefresh = async () => {
    setRefreshing(true);
    setContractDataList([]);
    setPageNum(0);
    await getContractDataList();
    setRefreshing(false);
  };

  // 上拉加载
  const onEndReached = () => {
    setPageNum(prev => prev + 1);
    getContractDataList();
  };

  // 页面显示时加载数据
  useEffect(() => {
    getContractDataList();
  }, [activeType]);

  return (
    <View style={styles.contractList}>
      {/* 导航栏 */}
      <CustomStatusBar
        navTitle="合同列表"
        rightIcon={require("@/assets/images/common/icon-search-black.png")}
        onBack={backView}
      />

      {/* 合同状态Tabs */}
      <View style={styles.contractType}>
        {contractTypeTabs.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.contractTypeItem, activeType.title === item.title && styles.active]}
            onPress={() => changeContractType(item)}>
            <Text style={[styles.contractTypeText, activeType.title === item.title && styles.activeText]}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 合同总数 */}
      <View style={styles.contractTotal}>
        <Text style={styles.contractTotalText}>
          共计<Text style={styles.contractTotalNum}>{contractTotal} </Text>个合同
        </Text>
      </View>

      {/* 列表数据 */}
      <ScrollView
        style={styles.contractContent}
        scrollEnabled
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}>
        {contractDataList.length ? (
          contractDataList.map((item, index) => (
            <View key={index} style={styles.contractContentItem}>
              {/* 合同编号 */}
              <TouchableOpacity style={styles.itemTitle} onPress={() => viewContractDetail(item)}>
                <Text style={styles.itemTitleText} numberOfLines={1}>
                  {item.contractNo}
                </Text>
                <View style={styles.itemTitleIcon}>
                  <Image source={require("@/assets/images/common/icon-right.png")} style={styles.itemTitleIconImg} />
                </View>
              </TouchableOpacity>

              {/* 合同信息 */}
              <View style={styles.itemMsg}>
                <View style={styles.itemMsgText}>
                  <Text style={styles.itemMsgLabel}>农户姓名：</Text>
                  <Text style={styles.itemMsgValue}>
                    {item.relename}
                    {item.mobile ? `（${item.mobile}）` : ""}
                  </Text>
                </View>
                <View style={styles.itemMsgText}>
                  <Text style={styles.itemMsgLabel}>{activeType.title === "已作废" ? "作废时间" : "创建时间"}：</Text>
                  <Text style={styles.itemMsgValue}>
                    {activeType.title === "已作废" ? item.cancellationTime : item.createTime}
                  </Text>
                </View>
              </View>

              {/* 操作按钮 */}
              <View style={styles.itemOperate}>
                {/* 作废按钮 */}
                {(activeType.title === "未生效" || activeType.title === "生效中") && (
                  <TouchableOpacity style={styles.itemOperateBtn} onPress={() => cancelContract(item)}>
                    <Image source={require("@/assets/images/common/icon-cancel.png")} style={styles.operateBtnImg} />
                    <Text style={styles.operateBtnText}>作废</Text>
                  </TouchableOpacity>
                )}

                {/* 续约按钮 */}
                {(activeType.title === "已到期" || activeType.title === "已作废") && (
                  <TouchableOpacity style={styles.itemOperateBtn} onPress={() => renewContract(item)}>
                    <Image source={require("@/assets/images/common/icon-renew.png")} style={styles.operateBtnImg} />
                    <Text style={styles.operateBtnText}>续约</Text>
                  </TouchableOpacity>
                )}

                {/* 编辑按钮 */}
                {(activeType.title === "未生效" || activeType.title === "生效中") && (
                  <TouchableOpacity style={styles.itemOperateBtn} onPress={() => editContract(item)}>
                    <Image source={require("@/assets/images/common/icon-edit-blue.png")} style={styles.operateBtnImg} />
                    <Text style={styles.operateBtnText}>编辑</Text>
                  </TouchableOpacity>
                )}

                {/* 查看合同按钮 */}
                <TouchableOpacity style={styles.itemOperateBtn} onPress={() => viewContract(item)}>
                  <Image source={require("@/assets/images/common/icon-view.png")} style={styles.operateBtnImg} />
                  <Text style={styles.operateBtnText}>查看合同</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.empty}>
            <Image source={require("@/assets/images/common/contract-empty.png")} style={styles.emptyImg} resizeMode="contain" />
            <Text style={styles.emptyTitle}>暂无数据</Text>
          </View>
        )}
      </ScrollView>

      {/* 筛选条件弹窗 */}
      {showQueryPopup && <FilterPopup onClose={closeQueryPopup} onQuery={searchContract} />}

      {/* 操作提示弹窗 */}
      <Popup
        visible={showSavePopup}
        title="提示"
        msgText="请确认是否作废该合同？"
        leftBtnText="取消"
        rightBtnText="作废"
        rightBtnStyle={{color: "#FF3D3B"}}
        onLeftBtn={handleCancel}
        onRightBtn={handleConfirm}
      />
    </View>
  );
};

// 样式定义
const styles = StyleSheet.create({
  contractList: {
    width: width,
    height: height,
    flexDirection: "column",
  },
  contractType: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: width,
    height: px2dp(104),
    paddingHorizontal: px2dp(16),
    backgroundColor: "#fff",
  },
  contractTypeItem: {
    width: px2dp(166),
    height: px2dp(64),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: px2dp(8),
    transition: "all 0.3s",
  },
  active: {
    backgroundColor: "#1ab850",
  },
  contractTypeText: {
    fontSize: px2dp(32),
  },
  activeText: {
    fontWeight: "500",
    color: "#fff",
  },
  contractTotal: {
    width: width,
    height: px2dp(76),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ebffe4",
  },
  contractTotalText: {
    fontSize: px2dp(32),
    fontWeight: "400",
    color: "#000",
  },
  contractTotalNum: {
    fontWeight: "500",
    color: "#1ab850",
  },
  contractContent: {
    width: width,
    height: px2dp(1315),
    backgroundColor: "#f5f6f8",
  },
  contractContentItem: {
    width: width,
    height: px2dp(300),
    marginTop: px2dp(16),
    backgroundColor: "#fff",
  },
  itemTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: px2dp(96),
    paddingHorizontal: px2dp(32),
  },
  itemTitleText: {
    width: px2dp(600),
    fontSize: px2dp(40),
    fontWeight: "500",
    color: "#000",
  },
  itemTitleIcon: {
    width: px2dp(52),
    height: px2dp(52),
  },
  itemTitleIconImg: {
    width: px2dp(52),
    height: px2dp(52),
  },
  itemMsg: {
    marginVertical: px2dp(10),
  },
  itemMsgText: {
    flexDirection: "row",
    paddingHorizontal: px2dp(32),
    marginBottom: px2dp(20),
    fontSize: px2dp(32),
    color: "rgba(0,0,0,0.65)",
  },
  itemMsgLabel: {
    color: "rgba(0,0,0,0.65)",
  },
  itemMsgValue: {
    color: "#000",
  },
  itemOperate: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemOperateBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: px2dp(88),
  },
  operateBtnImg: {
    width: px2dp(48),
    height: px2dp(48),
  },
  operateBtnText: {
    marginLeft: px2dp(16),
    fontSize: px2dp(32),
    fontWeight: "400",
    color: "#000",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: "50%",
  },
  emptyImg: {
    width: px2dp(174),
    height: px2dp(158),
  },
  emptyTitle: {
    fontSize: px2dp(36),
    fontWeight: "400",
    color: "#000",
    marginTop: px2dp(20),
  },
});

export default ContractManageScreen;
