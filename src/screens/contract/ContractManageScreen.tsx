// 合同管理列表
import React, {useState, useEffect, useRef} from "react";
import {View, Text, Image, FlatList, TouchableOpacity, RefreshControl, Alert, Dimensions} from "react-native";
import {NavigationProp, useFocusEffect, useNavigation} from "@react-navigation/native";
import CustomStatusBar from "@/components/common/CustomStatusBar";
import Popup from "@/components/common/Popup";
import {cancelContractInfo, getContractInfoList} from "@/services/contract";
import {ContractManageScreenStyles} from "./styles/ContractManageScreen";
import {ContractListItemType} from "@/types/contract";
import ContractFilterPopup from "./components/ContractFilterPopup";
import {showCustomToast} from "@/components/common/CustomToast";
import {debounce} from "lodash";
import {updateStore} from "@/stores/updateStore";
import {observer} from "mobx-react-lite";

type PopupSearchQueryType = {
  [key: string]: any;
};

type ContractTypeTab = {
  title: string;
  value: string;
};

const SCREEN_HEIGHT = Dimensions.get("window").height;

const ContractManageScreen: React.FC = observer(() => {
  const navigation = useNavigation<NavigationProp<any>>();
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
  const [loading, setLoading] = useState(false);

  // 页面显示时加载数据
  useEffect(() => {
    getContractDataList();
  }, [activeType, updateStore.isUpdateContract]);

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
    console.log("切换合同状态", item);
    setPageNum(0);
  };

  // 获取合同列表数据
  const getContractDataList = async (params: PopupSearchQueryType = {}) => {
    // 防止重复加载
    if (loading) return;
    setLoading(true);

    try {
      const {data} = await getContractInfoList({
        contracStatus: activeType.value,
        pageNum,
        pageSize,
        ...params,
      });
      console.log("获取合同列表数据", data);
      const newList = pageNum === 0 ? data.list : [...contractDataList, ...data.list];
      setContractDataList(newList);
      setContractTotal(newList.length);
    } catch (error: any) {
      Alert.alert("提示", error?.data?.msg || "请求失败");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 查看合同详情
  const viewContractDetail = (item: ContractListItemType) => {
    navigation.navigate("ContractDetail", {
      contractType: activeType.title,
      contractInfo: item,
    });
  };

  // 作废合同（打开确认弹窗）
  const cancelContract = (item: ContractListItemType) => {
    setContractId(item.id);
    setShowSavePopup(true);
  };

  // 续约合同（待实现）
  const renewContract = (item: ContractListItemType) => {
    showCustomToast("info", "续约合同暂不可用");
  };

  // 编辑合同
  const editContract = (item: ContractListItemType) => {
    console.log("编辑合同", item);
    navigation.navigate("AddContract", {
      contractType: "编辑",
      landInfo: item,
      landId: item?.landId,
      landCoordinates: item?.gpsList as {lat: number; lng: number}[],
    });
  };

  // 查看合同
  const viewContract = (item: ContractListItemType) => {
    navigation.navigate("ElectronicContract", {
      contractInfo: item,
      page: "列表",
    });
  };

  // 作废弹窗取消
  const handleCancel = () => setShowSavePopup(false);

  // 作废弹窗确认
  const handleConfirm = debounce(async () => {
    try {
      await cancelContractInfo({id: contractId});
      showCustomToast("success", "操作成功");
      getContractDataList();
    } catch (error: any) {
      showCustomToast("error", error?.data?.msg || "操作失败");
    } finally {
      setShowSavePopup(false);
    }
  }, 500);

  // 下拉刷新
  const onRefresh = async () => {
    setRefreshing(true);
    setPageNum(0);
    await getContractDataList();
    setRefreshing(false);
  };

  // 上拉加载
  const onEndReached = () => {
    // 避免无数据时重复请求
    if (contractDataList.length >= contractTotal) return;
    setPageNum(prev => prev + 1);
    getContractDataList();
  };

  // 渲染列表项
  const renderContractItem = ({item}: {item: ContractListItemType}) => (
    <View style={ContractManageScreenStyles.contractContentItem}>
      {/* 合同编号 */}
      <TouchableOpacity style={ContractManageScreenStyles.itemTitle} onPress={() => viewContractDetail(item)}>
        <Text style={ContractManageScreenStyles.itemTitleText} numberOfLines={1}>
          {item.contractNo}
        </Text>
        <View style={ContractManageScreenStyles.itemTitleIcon}>
          <Image source={require("@/assets/images/common/icon-right.png")} style={ContractManageScreenStyles.itemTitleIconImg} />
        </View>
      </TouchableOpacity>

      {/* 合同信息 */}
      <View>
        <View style={ContractManageScreenStyles.itemMsgText}>
          <Text style={ContractManageScreenStyles.itemMsgLabel}>农户姓名：</Text>
          <Text style={ContractManageScreenStyles.itemMsgValue}>
            {item.relename}
            {item.mobile ? `（${item.mobile}）` : ""}
          </Text>
        </View>
        <View style={ContractManageScreenStyles.itemMsgText}>
          <Text style={ContractManageScreenStyles.itemMsgLabel}>{activeType.title === "已作废" ? "作废时间" : "创建时间"}：</Text>
          <Text style={ContractManageScreenStyles.itemMsgValue}>
            {activeType.title === "已作废" ? item.cancellationTime : item.createTime}
          </Text>
        </View>
      </View>

      {/* 操作按钮 */}
      <View style={ContractManageScreenStyles.itemOperate}>
        {/* 作废按钮 */}
        {(activeType.title === "未生效" || activeType.title === "生效中") && (
          <>
            <TouchableOpacity style={ContractManageScreenStyles.itemOperateBtn} onPress={() => cancelContract(item)}>
              <Image
                source={require("@/assets/images/common/icon-cancel.png")}
                style={ContractManageScreenStyles.operateBtnImg}
              />
              <Text style={ContractManageScreenStyles.operateBtnText}>作废</Text>
            </TouchableOpacity>
            <View style={ContractManageScreenStyles.dividing}></View>
          </>
        )}

        {/* 续约按钮 */}
        {/* {(activeType.title === "已到期" || activeType.title === "已作废") && (
          <>
            <TouchableOpacity style={ContractManageScreenStyles.itemOperateBtn} onPress={() => renewContract(item)}>
              <Image source={require("@/assets/images/common/icon-renew.png")} style={ContractManageScreenStyles.operateBtnImg} />
              <Text style={ContractManageScreenStyles.operateBtnText}>续约</Text>
            </TouchableOpacity>
            <View style={ContractManageScreenStyles.dividing}></View>
          </>
        )} */}

        {/* 编辑按钮 */}
        {(activeType.title === "未生效" || activeType.title === "生效中") && (
          <>
            <TouchableOpacity style={ContractManageScreenStyles.itemOperateBtn} onPress={() => editContract(item)}>
              <Image
                source={require("@/assets/images/common/icon-edit-blue.png")}
                style={ContractManageScreenStyles.operateBtnImg}
              />
              <Text style={ContractManageScreenStyles.operateBtnText}>编辑</Text>
            </TouchableOpacity>
            <View style={ContractManageScreenStyles.dividing}></View>
          </>
        )}

        {/* 查看合同按钮 */}
        <TouchableOpacity style={ContractManageScreenStyles.itemOperateBtn} onPress={() => viewContract(item)}>
          <Image source={require("@/assets/images/common/icon-view.png")} style={ContractManageScreenStyles.operateBtnImg} />
          <Text style={ContractManageScreenStyles.operateBtnText}>查看合同</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // 空数据渲染
  const renderEmptyView = () => (
    <View style={ContractManageScreenStyles.empty}>
      <Image
        source={require("@/assets/images/common/contract-empty.png")}
        style={ContractManageScreenStyles.emptyImg}
        resizeMode="contain"
      />
      <Text style={ContractManageScreenStyles.emptyTitle}>暂无数据</Text>
    </View>
  );

  return (
    <View style={ContractManageScreenStyles.contractList}>
      {/* 导航栏 */}
      <CustomStatusBar
        navTitle="合同列表"
        rightIcon={require("@/assets/images/common/icon-search-black.png")}
        onBack={backView}
        onRightPress={openQueryPopup}
      />

      {/* 合同状态Tabs */}
      <View style={ContractManageScreenStyles.contractType}>
        {contractTypeTabs.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              ContractManageScreenStyles.contractTypeItem,
              activeType.title === item.title && ContractManageScreenStyles.active,
            ]}
            onPress={() => changeContractType(item)}>
            <Text
              style={[
                ContractManageScreenStyles.contractTypeText,
                activeType.title === item.title && ContractManageScreenStyles.activeText,
              ]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 合同总数 */}
      <View style={ContractManageScreenStyles.contractTotal}>
        <Text style={ContractManageScreenStyles.contractTotalText}>
          共计<Text style={ContractManageScreenStyles.contractTotalNum}>{contractTotal} </Text>个合同
        </Text>
      </View>

      {/* 列表数据 - 替换为FlatList */}
      <FlatList
        style={ContractManageScreenStyles.contractContent}
        data={contractDataList}
        renderItem={renderContractItem}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmptyView}
        maxToRenderPerBatch={10}
        windowSize={5}
      />

      {/* 筛选条件弹窗 */}
      {showQueryPopup && (
        <ContractFilterPopup onClose={closeQueryPopup} onQuery={searchContract} height={SCREEN_HEIGHT} marginTop={36.5} />
      )}

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
});

export default ContractManageScreen;
