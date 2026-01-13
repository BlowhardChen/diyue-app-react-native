// 新建&编辑&作废合同
import React, {useState, useEffect, useMemo, useCallback, useRef} from "react";
import {View, Text, ScrollView, TextInput, Image, TouchableOpacity, Modal, BackHandler} from "react-native";
import {debounce, flatMap, set} from "lodash";
import moment from "moment";
import {AddContractScreenStyles} from "./styles/AddContractScreenStyles";
import CustomStatusBar from "@/components/common/CustomStatusBar";
import LeaseTermPicker from "@/components/common/LeaseTermPicker";
import LeaseTimePicker from "@/components/common/LeaseTimePicker";
import PaymentMethodPicker from "@/components/common/PaymentMethodPicker";
import PaymentTimePicker from "@/components/common/PaymentTimePicker";
import PopupCenterScan from "@/components/common/PopupCenterScan";
import PopupInfo from "@/components/common/PopupInfo";
import ProvinceCityDistrictPicker from "@/components/common/ProvinceCityDistrictPicker";
import Popup from "@/components/common/Popup";
import {AddContractParamsType, ContractCacheParams} from "@/types/contract";
import {Global} from "@/styles/global";
import {useFocusEffect} from "@react-navigation/native";
import {addContract, cancelContractInfo, editContract, getContractInfoDetail} from "@/services/contract";
import {showCustomToast} from "@/components/common/CustomToast";
import {updateStore} from "@/stores/updateStore";

// 类型定义
interface PaymentMethodsDictionary {
  dictLabel: string;
  dictValue: string;
}

// 主组件
const AddContractScreen: React.FC<{route: any; navigation: any}> = ({route, navigation}) => {
  // 状态管理
  const [contractType, setContractType] = useState<string>("新建");
  const [rightBtnStyle, setRightBtnStyle] = useState({color: Global.colors.primary});
  const [rightBtnText, setRightBtnText] = useState<string>("保存");
  const [leftBtnText, setLeftBtnText] = useState<string>("不保存");
  const [paymentYear, setPaymentYear] = useState<string>("");
  const [paymentOneSeason, setPaymentOneSeason] = useState<string>("");
  const [paymentTwoSeason, setPaymentTwoSeason] = useState<string>("");
  const [paymentThreeSeason, setPaymentThreeSeason] = useState<string>("");
  const beforeRemoveRef = useRef<any>(null);
  // 新增：保存返回键监听引用
  const backHandlerRef = useRef<any>(null);
  // 表单状态
  const [contractFormInfo, setContractFormInfo] = useState<AddContractParamsType>({
    id: "",
    landId: "",
    termOfLease: 0,
    actualAcreNum: 0,
    startTime: "",
    endTime: "",
    perAcreAmount: 0,
    totalAmount: 0,
    paymentAmount: 0,
    paymentMethod: "1",
    relename: "",
    cardid: "",
    bankAccount: "",
    openBank: "未知",
    mobile: "",
    gpsList: [],
    province: "",
    city: "",
    district: "",
    township: "",
    administrativeVillage: "",
    detailaddress: "",
    times: [],
  });
  // Picker显示状态
  const [isShowLeaseTermPicker, setIsShowLeaseTermPicker] = useState(false);
  const [isShowLeaseTimePicker, setIsShowLeaseTimePicker] = useState(false);
  const [timeType, setTimeType] = useState<string>("");
  const [isShowPaymentMethodPicker, setIsShowPaymentMethodPicker] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodsDictionary>({dictLabel: "年付", dictValue: "1"});
  const [isShowPaymentTimePicker, setIsShowPaymentTimePicker] = useState(false);
  const [payMethod, setPayMethod] = useState<string>("");
  const [isEditLandPosition, setIsEditLandPosition] = useState(false);
  const [showProvincePopup, setShowProvincePopup] = useState(false);
  // 弹窗状态
  const [showOcrPopup, setShowOcrPopup] = useState(false);
  const [msgText, setMsgText] = useState<string>("是否保存修改信息？");
  const [ocrInfo, setOcrInfo] = useState<any>(null);
  const [operateState, setOperateState] = useState<string>("");
  const [showOperationPopup, setShowOperationPopup] = useState(false);
  const [scanType, setScanType] = useState<string>("");
  const [scanResultTitle, setScanResultTitle] = useState<string>("银行卡信息");
  const [showSaveSuccessPopup, setShowSaveSuccessPopup] = useState(false);

  // 计算属性
  const allFieldsFilled = useMemo(() => {
    const ignoreEmptyFields = ["township", "administrativeVillage"];
    // 允许为0的数字字段（根据业务需求配置）
    const allowZeroFields = ["actualAcreNum", "termOfLease", "perAcreAmount", "totalAmount", "paymentAmount"];

    return Object.entries(contractFormInfo).every(([fieldKey, fieldValue]) => {
      // 跳过忽略字段
      if (ignoreEmptyFields.includes(fieldKey)) return true;

      // 允许为0的数字字段：仅校验非 undefined/null/空字符串
      if (allowZeroFields.includes(fieldKey)) {
        return fieldValue !== undefined && fieldValue !== null && fieldValue !== "";
      }

      // 普通字段：非空校验
      return Boolean(fieldValue);
    });
  }, [contractFormInfo]);

  // 合同总金额
  const contractAmountTotal = useMemo(() => {
    return Number(
      (Number(contractFormInfo.perAcreAmount) * contractFormInfo.actualAcreNum * contractFormInfo.termOfLease).toFixed(2),
    );
  }, [contractFormInfo.perAcreAmount, contractFormInfo.actualAcreNum, contractFormInfo.termOfLease]);

  // 合同付款金额
  const contractPayment = useMemo(() => {
    if (!contractFormInfo.termOfLease) return 0;

    switch (paymentMethod.dictLabel) {
      case "年付":
        return contractAmountTotal / contractFormInfo.termOfLease;
      case "两季付":
        return contractAmountTotal / contractFormInfo.termOfLease / 2;
      case "三季付":
        return Number((contractAmountTotal / contractFormInfo.termOfLease / 3).toFixed(2));
      default:
        return 0;
    }
  }, [contractAmountTotal, contractFormInfo.termOfLease, paymentMethod.dictLabel]);

  useEffect(() => {
    const {contractType, landInfo, landCoordinates} = route.params || {};
    setContractType(contractType);
    if (contractType === "新建") {
      const {
        id,
        actualAcreNum,
        landName,
        cardid,
        bankAccount,
        openBank,
        mobile,
        province,
        city,
        district,
        township,
        administrativeVillage,
        detailaddress,
      } = landInfo;
      setContractFormInfo(prev => ({
        ...prev,
        id,
        landId: id,
        actualAcreNum: actualAcreNum || 0,
        relename: landName || "",
        cardid: cardid || "",
        bankAccount: bankAccount || "",
        openBank: openBank || "未知",
        mobile: mobile || "",
        gpsList: landCoordinates || "",
        province: province || "",
        city: city || "",
        district: district || "",
        township: township || "",
        administrativeVillage: administrativeVillage || "",
        detailaddress: detailaddress || "",
      }));
    } else {
      getLandContractDetail();
    }
    // 安卓返回键处理 - 修改：保存监听引用
    backHandlerRef.current = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    return () => {
      if (backHandlerRef.current) {
        backHandlerRef.current.remove();
      }
    };
  }, [route.params]);

  useEffect(() => {
    let times: {paymentTime: string}[] = [];

    switch (paymentMethod.dictLabel) {
      case "年付":
        times = [{paymentTime: paymentYear}];
        break;
      case "两季付":
        times = [{paymentTime: paymentOneSeason}, {paymentTime: paymentTwoSeason}];
        break;
      case "三季付":
        times = [{paymentTime: paymentOneSeason}, {paymentTime: paymentTwoSeason}, {paymentTime: paymentThreeSeason}];
        break;
    }

    setContractFormInfo(prev => ({
      ...prev,
      times,
      totalAmount: contractAmountTotal,
      paymentAmount: contractPayment,
    }));
  }, [
    paymentMethod.dictLabel,
    paymentYear,
    paymentOneSeason,
    paymentTwoSeason,
    paymentThreeSeason,
    contractAmountTotal,
    contractPayment,
  ]);

  // 返回处理
  const handleBackPress = () => {
    if (contractType !== "新建") {
      setMsgText("是否保存修改信息？");
      setLeftBtnText("不保存");
      setRightBtnText("保存");
      setRightBtnStyle({color: Global.colors.primary});
      setShowOperationPopup(true);
      setOperateState("保存");
      return true; // 阻止默认返回
    } else {
      beforeRemoveRef.current();
      navigation.goBack();
    }
    return false;
  };

  // 作废合同
  const obsoleteContract = () => {
    setMsgText("是否作废该合同？");
    setLeftBtnText("取消");
    setRightBtnStyle({color: "#FF3D3B"});
    setRightBtnText("作废");
    setOperateState("作废");
    setShowOperationPopup(true);
  };

  // 打开租赁期限选择器
  const openLeaseTermPicker = () => setIsShowLeaseTermPicker(true);

  // 关闭租赁期限选择器
  const closeLeaseTermPicker = (year: number) => {
    setIsShowLeaseTermPicker(false);
    if (year) {
      setContractFormInfo(prev => ({
        ...prev,
        termOfLease: year,
        endTime: prev.startTime ? calculateEndDate(prev.startTime, year) : prev.endTime,
      }));
    }
  };

  // 计算结束日期
  const calculateEndDate = (startTime: string, termOfLease?: number) => {
    const year = termOfLease || contractFormInfo.termOfLease;
    const startDate = moment(startTime);
    const endDate = startDate.add(year, "years").subtract(1, "days");
    return endDate.format("YYYY-MM-DD");
  };

  // 打开租赁时间选择器
  const openLeaseTimePicker = (type: string) => {
    setTimeType(type);
    setIsShowLeaseTimePicker(true);
  };

  // 关闭租赁时间选择器
  const closeLeaseTimePicker = (time: string) => {
    setIsShowLeaseTimePicker(false);
    if (timeType === "start") {
      setContractFormInfo(prev => ({
        ...prev,
        startTime: time,
        endTime: prev.termOfLease ? calculateEndDate(time) : prev.endTime,
      }));
    } else {
      setContractFormInfo(prev => ({...prev, endTime: time}));
    }
  };

  // 付款方式选择器
  const openPaymentMethodPicker = () => setIsShowPaymentMethodPicker(true);

  // 关闭付款方式选择器
  const closePaymentMethodPicker = (method: PaymentMethodsDictionary) => {
    console.log("关闭付款方式选择器", method);
    setIsShowPaymentMethodPicker(false);
    if (method) {
      setPaymentMethod(method);
    }
  };

  const PAYMENT_YEAR = "paymentYear";
  const PAYMENT_ONE_SEASON = "paymentOneSeason";
  const PAYMENT_TWO_SEASON = "paymentTwoSeason";
  const PAYMENT_THREE_SEASON = "paymentThreeSeason";

  const setPaymentTime = (method: string, time: string) => {
    switch (method) {
      case PAYMENT_YEAR:
        setPaymentYear(time);
        break;
      case PAYMENT_ONE_SEASON:
        setPaymentOneSeason(time);
        break;
      case PAYMENT_TWO_SEASON:
        setPaymentTwoSeason(time);
        break;
      case PAYMENT_THREE_SEASON:
        setPaymentThreeSeason(time);
        break;
    }
  };

  // 付款时间选择器
  const openPaymentTimePicker = (method: string) => {
    console.log("付款时间选择器", method);
    setIsShowPaymentTimePicker(true);
    setPayMethod(method);
  };

  // 关闭付款时间选择器
  const closePaymentTimePicker = (time: string) => {
    console.log("关闭付款时间选择器", time);
    setIsShowPaymentTimePicker(false);
    if (time) {
      setPaymentTime(payMethod, time);
    }
  };

  // 亩数增加
  const addMuNumber = () => {
    setContractFormInfo(prev => ({
      ...prev,
      actualAcreNum: Number((prev.actualAcreNum + 0.1).toFixed(1)),
    }));
  };

  // 亩数减少
  const reduceMuNumber = () => {
    if (contractFormInfo.actualAcreNum <= 0) return;
    setContractFormInfo(prev => ({
      ...prev,
      actualAcreNum: Number((prev.actualAcreNum - 0.1).toFixed(1)),
    }));
  };

  // 地块位置编辑
  const editLandPosition = () => setIsEditLandPosition(true);

  // 地块修改取消
  const positionPopupCancel = () => setIsEditLandPosition(false);

  // 修改地块完成
  const positionPopupConfirm = () => {
    setIsEditLandPosition(false);
  };

  // 省市区选择
  const openProvincePopup = () => setShowProvincePopup(true);
  const closeProvincePopup = (location: {province: string; city: string; district: string; township: string}) => {
    setShowProvincePopup(false);
    if (location) {
      setContractFormInfo(prev => ({
        ...prev,
        province: location.province,
        city: location.city,
        district: location.district,
        township: location.township,
      }));
    }
  };

  // 证件扫描
  const scanCard = (type: string) => {
    setScanType(type);
    if (type === "身份证") {
      setScanResultTitle("身份证信息");
    } else {
      setScanResultTitle("银行卡信息");
    }
    navigation.navigate("OcrCardScanner", {
      type,
      onOcrResult: async (result: {type: string; data: any}) => {
        handleOcrResult(result, type);
      },
    });
  };

  // 处理OCR识别结果
  const handleOcrResult = (result: {type: string; data: any}, scanType: string) => {
    console.log("处理OCR识别结果", result);
    if (!result.data) return;
    const data = JSON.parse(result.data);
    setOcrInfo(data);
  };

  // 选择图片
  const openChooseImage = () => {};

  // OCR弹窗处理
  const scanPopupCance = () => setShowOcrPopup(false);
  const scanPopupConfirm = () => {
    setShowOcrPopup(false);
    if (scanType === "身份证") {
      setContractFormInfo(prev => ({
        ...prev,
        relename: ocrInfo.name,
        cardid: ocrInfo.idNumber,
      }));
    } else {
      setContractFormInfo(prev => ({
        ...prev,
        bankAccount: ocrInfo.cardNumber,
        openBank: ocrInfo.bankName,
      }));
    }
  };

  // 保存合同
  const saveContract = debounce(() => {
    if (allFieldsFilled) {
      setMsgText("是否保存该合同？");
      setRightBtnStyle({color: Global.colors.primary});
      setLeftBtnText("不保存");
      setRightBtnText("保存");
      setOperateState("保存");
      setShowOperationPopup(true);
    }
  }, 500);

  // 操作弹窗左侧按钮点击
  const handleOperationPopupCancel = () => {
    setShowOperationPopup(false);
    switch (leftBtnText) {
      case "返回上级":
        beforeRemoveRef.current();
        navigation.goBack();
        break;
      case "不保存":
        beforeRemoveRef.current();
        navigation.goBack();
        break;
      default:
        break;
    }
  };

  // 操作弹窗确认
  const handleOperationPopupConfirm = () => {
    setShowOperationPopup(false);
    switch (rightBtnText) {
      case "保存":
        saveContractRequest();
        break;
      case "作废":
        cancelContractRequest();
        break;
      case "识别":
        openChooseImage();
        break;
      default:
        break;
    }
  };

  // 保存合同请求
  const saveContractRequest = async () => {
    try {
      console.log("保存合同请求", contractFormInfo);
      if (contractType === "新建") {
        await addContract(contractFormInfo);
      } else {
        await editContract(contractFormInfo);
      }
      updateStore.setIsUpdateLand(true);
      updateStore.setIsUpdateLandDetail(true);
      setShowOperationPopup(false);
      setShowSaveSuccessPopup(true);
    } catch (error: any) {
      setShowOperationPopup(false);
      showCustomToast("error", error?.data?.msg || "保存失败");
    }
  };

  // 作废合同请求
  const cancelContractRequest = async () => {
    try {
      // 接口请求逻辑
      await cancelContractInfo({id: contractFormInfo.id as string});
      setShowOperationPopup(false);
      showCustomToast("success", "操作成功");
      updateStore.setIsUpdateContract(true);

      if (backHandlerRef.current) {
        backHandlerRef.current.remove();
        backHandlerRef.current = null;
      }

      if (beforeRemoveRef.current) {
        beforeRemoveRef.current();
        beforeRemoveRef.current = null;
      }

      navigation.goBack();
    } catch (error: any) {
      showCustomToast("error", error?.data?.msg || "请求失败");
    }
  };

  // 关闭保存成功弹窗
  const closeSaveSuccessPopup = () => {
    setShowSaveSuccessPopup(false);
    navigation.goBack();
  };

  // 查看合同
  const viewContract = () => {
    setShowSaveSuccessPopup(false);
    navigation.navigate("ElectronicContract", {
      contractInfo: contractFormInfo,
    });
  };

  // 获取地块合同详情
  const getLandContractDetail = async () => {
    const {data} = await getContractInfoDetail({landId: route.params.landId});
    console.log("获取地块合同详情", data);
    const contractInfo = filterParams(data);
    setContractFormInfo(prev => ({
      ...prev,
      ...contractInfo,
      paymentMethod: data?.dictValue,
      totalAmount: contractAmountTotal,
      paymentAmount: contractPayment,
    }));
    setPaymentMethod({dictLabel: data?.dictLabel, dictValue: data?.dictValue});

    if (contractInfo.times) {
      switch (data?.dictLabel) {
        case "年付":
          setPaymentYear(contractInfo.times[0].paymentTime);
          break;
        case "两季付":
          setPaymentOneSeason(contractInfo.times[0].paymentTime);
          setPaymentTwoSeason(contractInfo.times[1].paymentTime);
          break;
        case "三季付":
          setPaymentOneSeason(contractInfo.times[0].paymentTime);
          setPaymentTwoSeason(contractInfo.times[1].paymentTime);
          setPaymentThreeSeason(contractInfo.times[2].paymentTime);
          break;
        default:
          break;
      }
    }
  };

  // 转换地块坐标为json字符串
  const convertCoordinates = (coordinates: {lat: number; lng: number}[]) => {
    if (!coordinates || coordinates.length === 0) return "";
    return coordinates.map(item => `${item.lat},${item.lng}`).join(";");
  };

  // 过滤参数
  const filterParams = (input: any): AddContractParamsType => {
    const AddContractParamsKeys: (keyof AddContractParamsType)[] = [
      "id",
      "landId",
      "termOfLease",
      "startTime",
      "endTime",
      "perAcreAmount",
      "totalAmount",
      "paymentAmount",
      "paymentMethod",
      "actualAcreNum",
      "gpsList",
      "province",
      "city",
      "district",
      "township",
      "administrativeVillage",
      "detailaddress",
      "relename",
      "cardid",
      "mobile",
      "openBank",
      "bankAccount",
      "times",
    ];

    const result: any = {};
    for (const key of Object.keys(input)) {
      if (AddContractParamsKeys.includes(key as keyof AddContractParamsType)) {
        result[key] = input[key];
      }
    }
    return result as AddContractParamsType;
  };

  useFocusEffect(() => {
    beforeRemoveRef.current = navigation.addListener("beforeRemove", (e: {preventDefault: () => void}) => {
      e.preventDefault();
      if (contractType !== "新建") {
        setShowOperationPopup(true);
      }
    });

    // Android 实体返回键监听
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (contractType !== "新建") {
        setShowOperationPopup(true);
      }
      return true;
    });

    return () => {
      if (beforeRemoveRef.current) {
        beforeRemoveRef.current();
      }
      backHandler.remove();
    };
  });

  // 渲染省市区选择
  const renderProvinceContent = () => (
    <View>
      <View style={AddContractScreenStyles.contentItem}>
        <Text style={AddContractScreenStyles.label}>省市位置</Text>
        <TouchableOpacity style={AddContractScreenStyles.input} onPress={openProvincePopup}>
          <Text style={AddContractScreenStyles.content} numberOfLines={1}>
            <Text style={AddContractScreenStyles.contentText} numberOfLines={1}>
              {contractFormInfo.province}
            </Text>
            {contractFormInfo.city && <Text style={AddContractScreenStyles.splitText}>/</Text>}
            <Text style={AddContractScreenStyles.contentText} numberOfLines={1}>
              {contractFormInfo.city}
            </Text>
            {contractFormInfo.district && <Text style={AddContractScreenStyles.splitText}>/</Text>}
            <Text style={AddContractScreenStyles.contentText} numberOfLines={1}>
              {contractFormInfo.district}
            </Text>
            {contractFormInfo.township && <Text style={AddContractScreenStyles.splitText}>/</Text>}
            <Text style={AddContractScreenStyles.contentText} numberOfLines={1}>
              {contractFormInfo.township}
            </Text>
          </Text>
          <Image source={require("@/assets/images/common/icon-right.png")} style={AddContractScreenStyles.rightIcon} />
        </TouchableOpacity>
      </View>
      <View style={AddContractScreenStyles.contentItem}>
        <Text style={AddContractScreenStyles.label}>地块位置</Text>
        <View style={AddContractScreenStyles.input}>
          <TextInput
            style={AddContractScreenStyles.content}
            value={contractFormInfo.detailaddress}
            onChangeText={text => setContractFormInfo(prev => ({...prev, detailaddress: text}))}
          />
        </View>
      </View>
    </View>
  );

  // 主渲染
  return (
    <View style={AddContractScreenStyles.container}>
      {/* 导航栏 */}
      <CustomStatusBar
        navTitle={`${contractType}流转合同`}
        rightTitle={contractType === "编辑" ? "作废" : ""}
        rightBtnColor={{color: "#FF3D3B", fontSize: 16, fontWeight: "500"}}
        onBack={handleBackPress}
        onRightPress={obsoleteContract}
      />

      {/* 滚动内容 */}
      <ScrollView style={AddContractScreenStyles.msgContent} showsVerticalScrollIndicator={false}>
        {/* 合同租期 */}
        <View style={AddContractScreenStyles.contractLease}>
          <View style={AddContractScreenStyles.title}>
            <View style={AddContractScreenStyles.mark} />
            <Text style={AddContractScreenStyles.titleText}>合同期限</Text>
          </View>
          <View style={AddContractScreenStyles.msgBox}>
            <View style={[AddContractScreenStyles.msgBoxItem, AddContractScreenStyles.borderBottom]}>
              <Text style={AddContractScreenStyles.msgText}>租赁期限</Text>
              <TouchableOpacity style={AddContractScreenStyles.pickerRow} onPress={openLeaseTermPicker}>
                <View style={AddContractScreenStyles.msgInput}>
                  <Text style={AddContractScreenStyles.msgInputText}>
                    {contractFormInfo.termOfLease || ""}
                    {contractFormInfo.termOfLease ? "年" : ""}
                  </Text>
                </View>
                <View style={AddContractScreenStyles.msgImg}>
                  <Image source={require("@/assets/images/common/icon-right.png")} style={AddContractScreenStyles.icon} />
                </View>
              </TouchableOpacity>
            </View>
            <View style={AddContractScreenStyles.timePicker}>
              <TouchableOpacity style={AddContractScreenStyles.timeInput} onPress={() => openLeaseTimePicker("start")}>
                <Text style={{color: contractFormInfo.startTime ? "#000" : "#999", fontSize: 16, fontWeight: "500"}}>
                  {contractFormInfo.startTime || "请选择开始时间"}
                </Text>
              </TouchableOpacity>
              <Text style={AddContractScreenStyles.timeSplit}>~</Text>
              <TouchableOpacity style={AddContractScreenStyles.timeInput} onPress={() => openLeaseTimePicker("end")}>
                <Text style={{color: contractFormInfo.endTime ? "#000" : "#999", fontSize: 16, fontWeight: "500"}}>
                  {contractFormInfo.endTime || "请选择结束时间"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 付款信息 */}
        <View style={AddContractScreenStyles.payMsg}>
          <View style={AddContractScreenStyles.title}>
            <View style={AddContractScreenStyles.mark} />
            <Text style={AddContractScreenStyles.titleText}>付款信息</Text>
          </View>
          <View style={AddContractScreenStyles.msgBox}>
            <View style={[AddContractScreenStyles.msgBoxItem, AddContractScreenStyles.borderBottom]}>
              <Text style={AddContractScreenStyles.msgText}>每亩租金</Text>
              <View style={AddContractScreenStyles.rent}>
                <TextInput
                  style={AddContractScreenStyles.rentInput}
                  value={contractFormInfo.perAcreAmount.toString()}
                  onChangeText={text =>
                    setContractFormInfo(prev => ({
                      ...prev,
                      perAcreAmount: Number(text),
                    }))
                  }
                  keyboardType="numeric"
                />
                <Text style={AddContractScreenStyles.rentUnit}>元/亩</Text>
              </View>
            </View>
            <View style={[AddContractScreenStyles.msgBoxItem, AddContractScreenStyles.borderBottom]}>
              <Text style={AddContractScreenStyles.msgText}>合同总金额</Text>
              <View style={AddContractScreenStyles.msgInput}>
                <Text style={AddContractScreenStyles.msgInputText}>{contractAmountTotal || ""}</Text>
              </View>
            </View>
            <View style={[AddContractScreenStyles.msgBoxItem, AddContractScreenStyles.borderBottom]}>
              <Text style={AddContractScreenStyles.msgText}>{paymentMethod.dictLabel === "年付" ? "年" : "季"}付款金额</Text>
              <View style={AddContractScreenStyles.msgInput}>
                <Text style={AddContractScreenStyles.msgInputText}>{contractPayment || ""}</Text>
              </View>
            </View>
            <View style={[AddContractScreenStyles.msgBoxItem, AddContractScreenStyles.borderBottom]}>
              <Text style={AddContractScreenStyles.msgText}>付款方式</Text>
              <TouchableOpacity style={AddContractScreenStyles.pickerRow} onPress={openPaymentMethodPicker}>
                <View style={AddContractScreenStyles.msgInput}>
                  <Text style={AddContractScreenStyles.msgInputText}>{paymentMethod.dictLabel}</Text>
                </View>
                <View style={AddContractScreenStyles.msgImg}>
                  <Image source={require("@/assets/images/common/icon-right.png")} style={AddContractScreenStyles.icon} />
                </View>
              </TouchableOpacity>
            </View>

            {paymentMethod.dictLabel === "年付" && (
              <View style={AddContractScreenStyles.msgBoxItem}>
                <Text style={AddContractScreenStyles.msgText}>付款时间</Text>
                <TouchableOpacity style={AddContractScreenStyles.pickerRow} onPress={() => openPaymentTimePicker(PAYMENT_YEAR)}>
                  <View style={AddContractScreenStyles.msgInput}>
                    <Text style={[AddContractScreenStyles.msgInputText, {color: paymentYear ? "#000" : "#999"}]}>
                      {paymentYear || "月/日"}
                    </Text>
                  </View>
                  <View style={AddContractScreenStyles.msgImg}>
                    <Image source={require("@/assets/images/common/icon-right.png")} style={AddContractScreenStyles.icon} />
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {paymentMethod.dictLabel === "两季付" && (
              <>
                <View style={[AddContractScreenStyles.msgBoxItem, AddContractScreenStyles.borderBottom]}>
                  <Text style={AddContractScreenStyles.msgText}>第一季付款时间</Text>
                  <TouchableOpacity
                    style={AddContractScreenStyles.pickerRow}
                    onPress={() => openPaymentTimePicker(PAYMENT_ONE_SEASON)}>
                    <View style={AddContractScreenStyles.msgInput}>
                      <Text style={[AddContractScreenStyles.msgInputText, {color: paymentOneSeason ? "#000" : "#999"}]}>
                        {paymentOneSeason || "月/日"}
                      </Text>
                    </View>
                    <View style={AddContractScreenStyles.msgImg}>
                      <Image source={require("@/assets/images/common/icon-right.png")} style={AddContractScreenStyles.icon} />
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={[AddContractScreenStyles.msgBoxItem, AddContractScreenStyles.borderBottom]}>
                  <Text style={AddContractScreenStyles.msgText}>第二季付款时间</Text>
                  <TouchableOpacity
                    style={AddContractScreenStyles.pickerRow}
                    onPress={() => openPaymentTimePicker(PAYMENT_TWO_SEASON)}>
                    <View style={AddContractScreenStyles.msgInput}>
                      <Text style={[AddContractScreenStyles.msgInputText, {color: paymentTwoSeason ? "#000" : "#999"}]}>
                        {paymentTwoSeason || "月/日"}
                      </Text>
                    </View>
                    <View style={AddContractScreenStyles.msgImg}>
                      <Image source={require("@/assets/images/common/icon-right.png")} style={AddContractScreenStyles.icon} />
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {paymentMethod.dictLabel === "三季付" && (
              <>
                <View
                  style={[
                    AddContractScreenStyles.msgBoxItem,
                    AddContractScreenStyles.quarter,
                    AddContractScreenStyles.borderBottom,
                  ]}>
                  <Text style={AddContractScreenStyles.msgText}>第一季付款时间</Text>
                  <TouchableOpacity
                    style={AddContractScreenStyles.pickerRow}
                    onPress={() => openPaymentTimePicker(PAYMENT_ONE_SEASON)}>
                    <View style={AddContractScreenStyles.msgInput}>
                      <Text style={[AddContractScreenStyles.msgInputText, {color: paymentOneSeason ? "#000" : "#999"}]}>
                        {paymentOneSeason || "月/日"}
                      </Text>
                    </View>
                    <View style={AddContractScreenStyles.msgImg}>
                      <Image source={require("@/assets/images/common/icon-right.png")} style={AddContractScreenStyles.icon} />
                    </View>
                  </TouchableOpacity>
                </View>
                <View
                  style={[
                    AddContractScreenStyles.msgBoxItem,
                    AddContractScreenStyles.quarter,
                    AddContractScreenStyles.borderBottom,
                  ]}>
                  <Text style={AddContractScreenStyles.msgText}>第二季付款时间</Text>
                  <TouchableOpacity
                    style={AddContractScreenStyles.pickerRow}
                    onPress={() => openPaymentTimePicker(PAYMENT_TWO_SEASON)}>
                    <View style={AddContractScreenStyles.msgInput}>
                      <Text style={[AddContractScreenStyles.msgInputText, {color: paymentTwoSeason ? "#000" : "#999"}]}>
                        {paymentTwoSeason || "月/日"}
                      </Text>
                    </View>
                    <View style={AddContractScreenStyles.msgImg}>
                      <Image source={require("@/assets/images/common/icon-right.png")} style={AddContractScreenStyles.icon} />
                    </View>
                  </TouchableOpacity>
                </View>
                <View
                  style={[
                    AddContractScreenStyles.msgBoxItem,
                    AddContractScreenStyles.quarter,
                    AddContractScreenStyles.borderBottom,
                  ]}>
                  <Text style={AddContractScreenStyles.msgText}>第三季付款时间</Text>
                  <TouchableOpacity
                    style={AddContractScreenStyles.pickerRow}
                    onPress={() => openPaymentTimePicker(PAYMENT_THREE_SEASON)}>
                    <View style={AddContractScreenStyles.msgInput}>
                      <Text style={[AddContractScreenStyles.msgInputText, {color: paymentThreeSeason ? "#000" : "#999"}]}>
                        {paymentThreeSeason || "月/日"}
                      </Text>
                    </View>
                    <View style={AddContractScreenStyles.msgImg}>
                      <Image source={require("@/assets/images/common/icon-right.png")} style={AddContractScreenStyles.icon} />
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>

        {/* 土地信息 */}
        <View style={AddContractScreenStyles.landMsg}>
          <View style={AddContractScreenStyles.title}>
            <View style={AddContractScreenStyles.mark} />
            <Text style={AddContractScreenStyles.titleText}>土地信息</Text>
          </View>
          <View style={AddContractScreenStyles.msgBox}>
            <View
              style={[AddContractScreenStyles.msgBoxItem, AddContractScreenStyles.borderBottom, {justifyContent: "flex-start"}]}>
              <Text style={AddContractScreenStyles.msgText}>实际亩数</Text>
              <View style={AddContractScreenStyles.msgArea}>
                <TouchableOpacity onPress={reduceMuNumber}>
                  <Image source={require("@/assets/images/common/icon-reduce.png")} style={AddContractScreenStyles.msgIcon} />
                </TouchableOpacity>
                <View style={AddContractScreenStyles.msgUnit}>
                  <Text style={AddContractScreenStyles.unitText}>{contractFormInfo.actualAcreNum} 亩</Text>
                </View>
                <TouchableOpacity onPress={addMuNumber}>
                  <Image source={require("@/assets/images/common/icon-add.png")} style={AddContractScreenStyles.msgIcon} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={[AddContractScreenStyles.msgBoxItem, AddContractScreenStyles.borderBottom]}>
              <Text style={AddContractScreenStyles.msgText}>地块坐标</Text>
              <View style={[AddContractScreenStyles.msgInput, AddContractScreenStyles.ellipsis]}>
                <Text style={AddContractScreenStyles.msgInputText} numberOfLines={1}>
                  {convertCoordinates(contractFormInfo.gpsList)}
                </Text>
              </View>
            </View>
            <View style={AddContractScreenStyles.msgBoxItem}>
              <Text style={AddContractScreenStyles.msgText}>地块位置</Text>
              <View style={[AddContractScreenStyles.msgInput, AddContractScreenStyles.landLocation]}>
                <Text style={AddContractScreenStyles.msgInputText} numberOfLines={2}>
                  {contractFormInfo.detailaddress}
                </Text>
              </View>
              <TouchableOpacity style={AddContractScreenStyles.msgImg} onPress={editLandPosition}>
                <Image source={require("@/assets/images/common/icon-edit.png")} style={AddContractScreenStyles.icon} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 甲方信息 */}
        <View style={AddContractScreenStyles.partaMsg}>
          <View style={AddContractScreenStyles.title}>
            <View style={AddContractScreenStyles.mark} />
            <Text style={AddContractScreenStyles.titleText}>甲方信息</Text>
          </View>
          <View style={AddContractScreenStyles.msgBox}>
            <View style={AddContractScreenStyles.msgBoxItem}>
              <Text style={AddContractScreenStyles.msgText}>姓名/地块名</Text>
              <TextInput
                style={AddContractScreenStyles.msgInput}
                value={contractFormInfo.relename}
                onChangeText={text => setContractFormInfo(prev => ({...prev, relename: text}))}
                placeholder="请输入"
              />
              <TouchableOpacity style={AddContractScreenStyles.msgImg} onPress={() => scanCard("身份证")}>
                <Image source={require("@/assets/images/common/icon-scan.png")} style={AddContractScreenStyles.icon} />
              </TouchableOpacity>
            </View>
            <View style={AddContractScreenStyles.msgBoxItem}>
              <Text style={AddContractScreenStyles.msgText}>身份证号</Text>
              <TextInput
                style={AddContractScreenStyles.msgInput}
                value={contractFormInfo.cardid}
                onChangeText={text => setContractFormInfo(prev => ({...prev, cardid: text}))}
                placeholder="请输入"
                keyboardType="numeric"
              />
              <TouchableOpacity style={AddContractScreenStyles.msgImg} onPress={() => scanCard("身份证")}>
                <Image source={require("@/assets/images/common/icon-scan.png")} style={AddContractScreenStyles.icon} />
              </TouchableOpacity>
            </View>
            <View style={AddContractScreenStyles.msgBoxItem}>
              <Text style={AddContractScreenStyles.msgText}>银行卡号</Text>
              <TextInput
                style={AddContractScreenStyles.msgInput}
                value={contractFormInfo.bankAccount}
                onChangeText={text => setContractFormInfo(prev => ({...prev, bankAccount: text}))}
                placeholder="请输入"
                keyboardType="numeric"
              />
              <TouchableOpacity style={AddContractScreenStyles.msgImg} onPress={() => scanCard("银行卡")}>
                <Image source={require("@/assets/images/common/icon-scan.png")} style={AddContractScreenStyles.icon} />
              </TouchableOpacity>
            </View>
            <View style={AddContractScreenStyles.msgBoxItem}>
              <Text style={AddContractScreenStyles.msgText}>手机号</Text>
              <TextInput
                style={AddContractScreenStyles.msgInput}
                value={contractFormInfo.mobile}
                onChangeText={text => setContractFormInfo(prev => ({...prev, mobile: text}))}
                placeholder="请输入"
                keyboardType="phone-pad"
                maxLength={11}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 保存按钮 */}
      <View style={AddContractScreenStyles.btnSave}>
        <TouchableOpacity
          style={[AddContractScreenStyles.btn, {opacity: allFieldsFilled ? 1 : 0.3}]}
          disabled={!allFieldsFilled}
          onPress={saveContract}>
          <Text style={AddContractScreenStyles.btnText}>保存</Text>
        </TouchableOpacity>
      </View>

      {/* 租赁期限弹窗 */}
      <LeaseTermPicker
        visible={isShowLeaseTermPicker}
        onClosePopup={() => setIsShowLeaseTermPicker(false)}
        onConfirm={year => closeLeaseTermPicker(year)}
        defaultYear={contractFormInfo.termOfLease}
      />

      {/* 租赁时间弹窗 */}
      <LeaseTimePicker
        visible={isShowLeaseTimePicker}
        onClose={() => setIsShowLeaseTimePicker(false)}
        onConfirm={time => closeLeaseTimePicker(time)}
      />

      {/* 付款方式弹窗 */}
      <PaymentMethodPicker
        visible={isShowPaymentMethodPicker}
        onClose={() => setIsShowPaymentMethodPicker(false)}
        onConfirm={method => closePaymentMethodPicker(method)}
        initialValue={paymentMethod.dictValue}
      />

      {/* 付款时间弹窗 */}
      <PaymentTimePicker
        visible={isShowPaymentTimePicker}
        onClose={() => setIsShowPaymentTimePicker(false)}
        onConfirm={time => closePaymentTimePicker(time)}
        initialDate={
          // 使用对象映射替代多层三元表达式，更易维护且不易出错
          {
            [PAYMENT_YEAR]: paymentYear,
            [PAYMENT_ONE_SEASON]: paymentOneSeason,
            [PAYMENT_TWO_SEASON]: paymentTwoSeason,
            [PAYMENT_THREE_SEASON]: paymentThreeSeason,
          }[payMethod] || ""
        }
      />

      {/* 识别结果弹窗 */}
      {showOcrPopup && (
        <PopupCenterScan msgText={scanResultTitle} ocrInfo={ocrInfo} onLeftBtn={scanPopupCance} onRightBtn={scanPopupConfirm} />
      )}

      {/* 编辑地块位置弹窗 */}
      <Modal visible={isEditLandPosition} animationType="slide" transparent>
        <PopupInfo
          title="地块位置"
          leftBtnText="取消"
          rightBtnText="修改"
          onLeftBtn={positionPopupCancel}
          onRightBtn={positionPopupConfirm}>
          {renderProvinceContent()}
        </PopupInfo>
      </Modal>

      {/* 省市区三级联动选择 */}
      <ProvinceCityDistrictPicker
        visible={showProvincePopup}
        location={{
          province: contractFormInfo.province,
          city: contractFormInfo.city,
          district: contractFormInfo.district,
          township: contractFormInfo.township as string,
        }}
        onClose={() => setShowProvincePopup(false)}
        onConfirm={closeProvincePopup}
      />

      {/* 操作提示弹窗 */}
      <Popup
        visible={showOperationPopup}
        showTitle={false}
        msgText={msgText}
        leftBtnText={leftBtnText}
        rightBtnText={rightBtnText}
        rightBtnStyle={rightBtnStyle}
        onLeftBtn={handleOperationPopupCancel}
        onRightBtn={handleOperationPopupConfirm}
      />

      {/* 保存成功弹窗 */}
      <Popup
        visible={showSaveSuccessPopup}
        showTitle={false}
        msgText={`合同${contractType}成功`}
        leftBtnText="关闭"
        rightBtnText="查看合同"
        onLeftBtn={closeSaveSuccessPopup}
        onRightBtn={viewContract}
      />
    </View>
  );
};

export default AddContractScreen;
