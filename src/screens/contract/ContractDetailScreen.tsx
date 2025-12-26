import React, {useState, useEffect} from "react";
import {View, Text, ScrollView, TouchableOpacity, Modal, Image, Dimensions} from "react-native";
import {ContractDetailScreenStyles} from "./styles/ContractDetailScreen";
import CustomStatusBar from "@/components/common/CustomStatusBar";

const contractPeriod = [
  {title: "租赁期限", field: "termOfLease"},
  {title: "租赁时间", field: "contractTime"},
];
const paymentInformation = [
  {title: "每亩租金", field: "perAcreAmount"},
  {title: "付款金额", field: "paymentAmount"},
  {title: "合同总金额", field: "totalAmount"},
  {title: "付款方式", field: "paymentMethod"},
];
const landInformation = [
  {title: "实际亩数", field: "actualAcreNum"},
  {title: "地块坐标", field: "gpsList"},
  {title: "地块位置", field: "detailaddress"},
];
const partyAInformation = [
  {title: "姓名/地块名", field: "relename"},
  {title: "身份证号", field: "cardid"},
  {title: "银行卡号", field: "bankAccount"},
  {title: "手机号", field: "mobile"},
];
const createInformation = [
  {title: "创建人", field: "createName"},
  {title: "创建时间", field: "createTime"},
];
const cancelInformation = [
  {title: "作废人", field: "cancellationName"},
  {title: "作废时间", field: "cancellationTime"},
];
const accountInformation = [
  {title: "收款账户名称", field: "accountName"},
  {title: "收款账号", field: "accountNumber"},
  {title: "开户行", field: "bankName"},
  {title: "应付金额", field: "12220元"},
];

const ContractDetailScreen = ({route, navigation}: any) => {
  const [activeType, setActiveType] = useState("基础信息");
  const [totalBillAmount, setTotalBillAmount] = useState(0);
  const [isOpenBillDetail, setIsOpenBillDetail] = useState(false);
  const [isShowAccountPopup, setIsShowAccountPopup] = useState(false);
  const [contractType, setContractType] = useState("");
  const [contractInfo, setContractInfo] = useState<any>({});

  // 返回按钮逻辑
  const backView = () => {
    navigation.goBack();
  };

  // Tab切换逻辑
  const contractTypeTabs = [{title: "基础信息"}, {title: "账单信息"}];
  const changeMessageType = (item: {title: string}) => {
    setActiveType(item.title);
  };

  // 展开/收起账单详情
  const expandBillDetail = () => {
    setIsOpenBillDetail(!isOpenBillDetail);
  };

  // 打开/关闭收款账户弹窗
  const openAccountPopup = () => {
    setIsShowAccountPopup(true);
  };

  // 关闭收款账户弹窗
  const handleCancel = () => {
    setIsShowAccountPopup(false);
  };

  // 处理收款账户确认
  const handlePayment = () => {
    setIsShowAccountPopup(false);
  };

  // 转换地块坐标为json字符串
  const convertCoordinates = (coordinates: {lat: number; lng: number}[]) => {
    if (!coordinates || coordinates.length === 0) return "";
    return coordinates.map(item => `${item.lat},${item.lng}`).join(";");
  };

  useEffect(() => {
    if (route?.params) {
      setContractType(route.params.contractType || "");
      setContractInfo(route.params.contractInfo);
      console.log("contractInfo", contractInfo);
    }
  }, [route?.params]);

  // 渲染基础信息模块
  const renderBasicInfo = () => {
    return (
      <View style={ContractDetailScreenStyles.basicInfoContainer}>
        {/* 合同期限 */}
        <View style={ContractDetailScreenStyles.contentItem}>
          <View style={ContractDetailScreenStyles.titleRow}>
            <View style={ContractDetailScreenStyles.mark} />
            <Text style={ContractDetailScreenStyles.titleText}>合同期限</Text>
          </View>
          <View style={ContractDetailScreenStyles.informationBox}>
            {contractPeriod.map((item, index) => (
              <View key={index} style={ContractDetailScreenStyles.informationBoxItem}>
                <Text style={ContractDetailScreenStyles.informationText}>{item.title}</Text>
                <Text style={ContractDetailScreenStyles.informationInput}>
                  {item.field === "termOfLease"
                    ? `${contractInfo[item.field] || "-"} 年`
                    : `${contractInfo?.startTime || "-"} 至 ${contractInfo?.endTime || "-"}`}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 付款信息 */}
        <View style={ContractDetailScreenStyles.contentItem}>
          <View style={ContractDetailScreenStyles.titleRow}>
            <View style={ContractDetailScreenStyles.mark} />
            <Text style={ContractDetailScreenStyles.titleText}>付款信息</Text>
          </View>
          <View style={ContractDetailScreenStyles.informationBox}>
            {paymentInformation.map((item, index) => (
              <View key={index} style={[ContractDetailScreenStyles.informationBoxItem]}>
                {item.title === "付款金额" ? (
                  <Text style={ContractDetailScreenStyles.informationText}>
                    {contractInfo["paymentMethod"] === "年付" ? `年${item.title}` : `季${item.title}`}
                  </Text>
                ) : (
                  <Text style={ContractDetailScreenStyles.informationText}>{item.title}</Text>
                )}
                <Text style={ContractDetailScreenStyles.informationInput} numberOfLines={1}>
                  {contractInfo[item.field] ?? "-"}
                </Text>
              </View>
            ))}
            {contractInfo.times?.length > 0 &&
              contractInfo.times.map((ite: any, idx: number) => (
                <View key={idx} style={ContractDetailScreenStyles.informationBoxItem}>
                  <Text style={ContractDetailScreenStyles.informationText}>付款时间</Text>
                  <View style={ContractDetailScreenStyles.informationInput}>
                    <Text>{ite.paymentTime ?? "-"}</Text>
                  </View>
                </View>
              ))}
          </View>
        </View>

        {/* 土地信息 */}
        <View style={ContractDetailScreenStyles.contentItem}>
          <View style={ContractDetailScreenStyles.titleRow}>
            <View style={ContractDetailScreenStyles.mark} />
            <Text style={ContractDetailScreenStyles.titleText}>土地信息</Text>
          </View>
          <View style={ContractDetailScreenStyles.informationBox}>
            {landInformation.map((item, index) => (
              <View key={index} style={[ContractDetailScreenStyles.informationBoxItem]}>
                <Text style={ContractDetailScreenStyles.informationText}>{item.title}</Text>
                <View style={[ContractDetailScreenStyles.informationInput]}>
                  {item.field === "gpsList" ? (
                    <Text style={{fontSize: 16, color: "#000"}} numberOfLines={1}>
                      {convertCoordinates(contractInfo[item.field]) ?? "-"}
                    </Text>
                  ) : (
                    <Text style={{fontSize: 16, color: "#000"}}>{contractInfo[item.field] ?? "-"}</Text>
                  )}
                  {item.field === "actualAcreNum" && <Text style={{fontSize: 16, color: "#08ae3c", marginLeft: 4}}>亩</Text>}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 甲方信息 */}
        <View style={ContractDetailScreenStyles.contentItem}>
          <View style={ContractDetailScreenStyles.titleRow}>
            <View style={ContractDetailScreenStyles.mark} />
            <Text style={ContractDetailScreenStyles.titleText}>甲方信息</Text>
          </View>
          <View style={ContractDetailScreenStyles.informationBox}>
            {partyAInformation.map((item, index) => (
              <View key={index} style={[ContractDetailScreenStyles.informationBoxItem]}>
                <Text style={ContractDetailScreenStyles.informationText}>{item.title}</Text>
                <Text style={ContractDetailScreenStyles.informationInput}>{contractInfo[item.field] ?? "-"}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 创建信息 */}
        <View style={ContractDetailScreenStyles.contentItem}>
          <View style={ContractDetailScreenStyles.titleRow}>
            <View style={ContractDetailScreenStyles.mark} />
            <Text style={ContractDetailScreenStyles.titleText}>创建信息</Text>
          </View>
          <View style={ContractDetailScreenStyles.informationBox}>
            {createInformation.map((item, index) => (
              <View key={index} style={ContractDetailScreenStyles.informationBoxItem}>
                <Text style={ContractDetailScreenStyles.informationText}>{item.title}</Text>
                <Text style={ContractDetailScreenStyles.informationInput}>{contractInfo[item.field] ?? "-"}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 作废信息 */}
        <View style={ContractDetailScreenStyles.contentItem}>
          <View style={ContractDetailScreenStyles.titleRow}>
            <View style={ContractDetailScreenStyles.mark} />
            <Text style={ContractDetailScreenStyles.titleText}>作废信息</Text>
          </View>
          <View style={ContractDetailScreenStyles.informationBox}>
            {cancelInformation.map((item, index) => (
              <View key={index} style={ContractDetailScreenStyles.informationBoxItem}>
                <Text style={ContractDetailScreenStyles.informationText}>{item.title}</Text>
                <Text style={ContractDetailScreenStyles.informationInput}>{contractInfo[item.field] ?? "-"}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  // 渲染账单信息模块
  const renderBillInfo = () => {
    return (
      <View style={ContractDetailScreenStyles.billInfoContainer}>
        <View style={ContractDetailScreenStyles.billTotal}>
          <Text>待付款合同款项共</Text>
          <Text style={ContractDetailScreenStyles.billTotalAmount}>{totalBillAmount} </Text>
          <Text>元</Text>
        </View>

        <View style={ContractDetailScreenStyles.billItem}>
          <View style={ContractDetailScreenStyles.billItemContent}>
            <View>
              <Text style={ContractDetailScreenStyles.billLeft}>2023-08-20前应付</Text>
              <View style={ContractDetailScreenStyles.billMoneyRow}>
                <Text style={ContractDetailScreenStyles.billMoney}>￥1200.00</Text>
                <TouchableOpacity onPress={expandBillDetail}>
                  <Image
                    source={require("@/assets/images/common/icon-expand.png")}
                    style={[
                      ContractDetailScreenStyles.expandIcon,
                      isOpenBillDetail && ContractDetailScreenStyles.expandIconRotated,
                    ]}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={ContractDetailScreenStyles.billRight}>
              <TouchableOpacity style={ContractDetailScreenStyles.payBtn} onPress={openAccountPopup}>
                <Text style={ContractDetailScreenStyles.payBtnText}>打款</Text>
              </TouchableOpacity>
              <Image
                source={require("@/assets/images/common/icon-bill-success.png")}
                style={ContractDetailScreenStyles.successIcon}
              />
            </View>
          </View>

          {/* 展开的账单详情 */}
          {isOpenBillDetail && (
            <View style={ContractDetailScreenStyles.billExpand}>
              <View style={ContractDetailScreenStyles.paymentTypeRow}>
                <View style={ContractDetailScreenStyles.paymentItem}>
                  <Text style={ContractDetailScreenStyles.paymentLabel}>打款方式：</Text>
                  <Text style={ContractDetailScreenStyles.paymentText}>对公打款</Text>
                </View>
                <View style={ContractDetailScreenStyles.paymentItem}>
                  <Text style={ContractDetailScreenStyles.paymentLabel}>打款人：</Text>
                  <Text style={ContractDetailScreenStyles.paymentText}>张三</Text>
                </View>
              </View>
              <View style={ContractDetailScreenStyles.paymentItem}>
                <Text style={ContractDetailScreenStyles.paymentLabel}>打款结果：</Text>
                <Text style={ContractDetailScreenStyles.paymentTextFail}>失败</Text>
              </View>
              <View style={ContractDetailScreenStyles.paymentItem}>
                <Text style={ContractDetailScreenStyles.paymentLabel}>失败原因：</Text>
                <Text style={ContractDetailScreenStyles.paymentText}>银行卡信息不一致</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={ContractDetailScreenStyles.container}>
      {/* 自定义导航栏 */}
      <CustomStatusBar navTitle="流转合同详情" onBack={() => navigation.goBack()} subTitle={contractType} />

      {/* Tab切换栏 */}
      {/* <View style={ContractDetailScreenStyles.tabBar}>
        {contractTypeTabs.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              ContractDetailScreenStyles.tabItem,
              index === 1 && ContractDetailScreenStyles.tabItemSecond,
              activeType === item.title && ContractDetailScreenStyles.tabItemActive,
            ]}
            onPress={() => changeMessageType(item)}>
            <Text
              style={[ContractDetailScreenStyles.tabText, activeType === item.title && ContractDetailScreenStyles.tabTextActive]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View> */}

      {/* 内容滚动区域 */}
      <ScrollView style={ContractDetailScreenStyles.scrollView} showsVerticalScrollIndicator={false}>
        {activeType === "基础信息" && renderBasicInfo()}
        {activeType === "账单信息" && renderBillInfo()}
      </ScrollView>

      {/* 收款账户弹窗 */}
      <Modal visible={isShowAccountPopup} transparent={true} animationType="fade" onRequestClose={handleCancel}>
        <View style={ContractDetailScreenStyles.popupOverlay}>
          <View style={ContractDetailScreenStyles.popupContent}>
            <Text style={ContractDetailScreenStyles.popupTitle}>收款账户信息</Text>
            <View style={ContractDetailScreenStyles.popupMessage}>
              {accountInformation.map((item, index) => (
                <View key={index} style={ContractDetailScreenStyles.popupMessageItem}>
                  <Text style={ContractDetailScreenStyles.popupMessageLabel}>{item.title}</Text>
                  <Text
                    style={[
                      ContractDetailScreenStyles.popupMessageText,
                      item.field === "12220元" && ContractDetailScreenStyles.popupMessageTextRed,
                    ]}>
                    {item.field}
                  </Text>
                </View>
              ))}
            </View>
            <View style={ContractDetailScreenStyles.popupBottom}>
              <TouchableOpacity style={ContractDetailScreenStyles.popupBtnLeft} onPress={handleCancel}>
                <Text style={ContractDetailScreenStyles.popupBtnLeftText}>取消</Text>
              </TouchableOpacity>
              <View style={ContractDetailScreenStyles.popupDivider} />
              <TouchableOpacity style={ContractDetailScreenStyles.popupBtnRight} onPress={handlePayment}>
                <Text style={ContractDetailScreenStyles.popupBtnRightText}>打款</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ContractDetailScreen;
