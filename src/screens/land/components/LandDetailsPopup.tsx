import React, {useState, useEffect} from "react";
import {View, Linking} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import {LandDetailsPopupStyles} from "./styles/LandDetailsPopup";
import {LandDetailInfo, LandOrderItem} from "@/types/land";
import {ContractDetail} from "@/types/contract";
import ExpandButton from "./ExpandButton";
import Header from "./Header";
import TabContainer from "./TabContainer";
import BasicInfoContent from "./BasicInfoContent";
import ContractInfoContent from "./ContractInfoContent";
import HostingOrderContent from "./HostingOrderContent";
import FooterButtons from "./FooterButtons";

interface Props {
  landInfo: LandDetailInfo;
  contractDetail?: ContractDetail | null;
  landOrderList?: LandOrderItem[];
  onClose: () => void;
  onBack: () => void;
  onLandManage: (info: LandDetailInfo) => void;
}

type LandStackParamList = {
  LandInfoEdit: {queryInfo: LandDetailInfo};
  AddDevice: undefined;
  FindLandDetail: {landId: string};
  AddContract: {contractType: string; landInfo: LandDetailInfo; landId?: string; landCoordinates?: {lat: number; lng: number}[]};
};

const LandDetailsPopup: React.FC<Props> = ({landInfo, contractDetail, landOrderList, onClose, onBack, onLandManage}) => {
  const navigation = useNavigation<StackNavigationProp<LandStackParamList>>();
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState("基础信息");
  console.log("地块详情", landInfo);
  // 当地块信息变化时重置状态
  useEffect(() => {
    setActiveTab("基础信息");
    setIsExpanded(true);
  }, [landInfo]);

  // 切换Tab
  const handleTabChange = (tabIndex: string) => {
    setActiveTab(tabIndex);
  };

  // 地块信息编辑
  const handleLandInfoEdit = () => {
    if (activeTab === "基础信息") {
      navigation.navigate("LandInfoEdit", {queryInfo: landInfo});
    } else if (activeTab === "合同信息") {
      navigation.navigate("AddContract", {
        contractType: "编辑",
        landInfo,
        landId: landInfo?.id,
        landCoordinates: landInfo?.list as {lat: number; lng: number}[],
      });
    }
  };

  // 地块管理弹窗
  const openLandManagePopup = (landInfo: LandDetailInfo) => {
    setIsExpanded(false);
    onLandManage(landInfo);
  };

  // 创建订单
  const handleCreateOrder = () => {};

  // 新建合同
  const addContract = () => {
    navigation.navigate("AddContract", {
      contractType: "新建",
      landInfo,
      landCoordinates: landInfo?.list as {lat: number; lng: number}[],
    });
  };

  // 拨打电话
  const callPhone = (tel?: string) => {
    if (!tel) return;
    Linking.openURL(`tel:${tel}`);
  };

  // 点回找
  const onFindPoint = (landId: string) => {
    navigation.navigate("FindLandDetail", {landId});
  };

  // 替换敏感信息中间字符为*
  const replaceKeywords = (param?: string) => {
    if (!param) return "未知";
    return param.replace(/^(.{6})(?:\d+)(.{4})$/, "$1******$2");
  };

  return (
    <View style={LandDetailsPopupStyles.container}>
      {/* 展开/收起按钮 */}
      <ExpandButton isExpanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)} />

      {/* 头部导航 */}
      <Header title="地块详情" onBack={onBack} onClose={onClose} />

      {/* Tab切换容器 */}
      {landInfo?.type !== "1" && (
        <TabContainer activeTab={activeTab} landType={landInfo?.landType} onTabChange={handleTabChange} />
      )}

      {/* 内容区域 - 根据当前Tab显示对应内容 */}
      {activeTab === "基础信息" && (
        <BasicInfoContent landInfo={landInfo} isExpanded={isExpanded} callPhone={callPhone} replaceKeywords={replaceKeywords} />
      )}

      {activeTab === "合同信息" && landInfo?.type !== "1" && (
        <ContractInfoContent
          landInfo={landInfo}
          contractDetail={contractDetail}
          isExpanded={isExpanded}
          addContract={addContract}
        />
      )}

      {activeTab === "托管订单" && <HostingOrderContent landOrderList={landOrderList} isExpanded={isExpanded} />}

      {/* 底部操作按钮 */}
      <FooterButtons
        activeTab={activeTab}
        landType={landInfo?.landType}
        contractNo={contractDetail?.contractNo}
        onLandManage={() => openLandManagePopup(landInfo)}
        onLandInfoEdit={handleLandInfoEdit}
        onFindPoint={() => onFindPoint(landInfo.id)}
        onHandleCreateOrder={handleCreateOrder}
      />
    </View>
  );
};

export default LandDetailsPopup;
