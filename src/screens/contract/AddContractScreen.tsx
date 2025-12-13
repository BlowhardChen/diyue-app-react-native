import React, {useState, useEffect, useMemo, useCallback} from "react";
import {View, Text, ScrollView, TextInput, Image, TouchableOpacity, Modal, BackHandler, ToastAndroid} from "react-native";
import {debounce} from "lodash";
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
import {AddContractParamsType, ContractCacheParams, QuarterItem} from "@/types/contract";
import {Global} from "@/styles/global";

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
  const [paymentYear, setPaymentYear] = useState<string>("");
  const [paymentOneSeason, setPaymentOneSeason] = useState<string>("");
  const [paymentTwoSeason, setPaymentTwoSeason] = useState<string>("");
  const [paymentThreeSeason, setPaymentThreeSeason] = useState<string>("");

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
    landGps: "",
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
  const [msgText, setMsgText] = useState<string>("");
  const [ocrInfo, setOcrInfo] = useState<any>(null);
  const [operateState, setOperateState] = useState<string>("");
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [leftBtnText, setLeftBtnText] = useState<string>("不保存");
  const [rightBtnText, setRightBtnText] = useState<string>("保存");
  const [scanType, setScanType] = useState<string>("");
  const [scanResultTitle, setScanResultTitle] = useState<string>("银行卡信息");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageType, setImageType] = useState<string>("");
  const [showSaveSuccessPopup, setShowSaveSuccessPopup] = useState(false);
  const [isChangeContractFormInfo, setIsChangeContractFormInfo] = useState(false);

  // 缓存数据
  const [contractCancheInfo, setContractCancheInfo] = useState<ContractCacheParams>({
    startTime: "",
    endTime: "",
    perAcreAmount: 0,
    paymentMethod: "",
    dictLabel: "",
    times: [],
  });

  // 计算属性
  const allFieldsFilled = useMemo(() => {
    return Object.values(contractFormInfo).every(value => Boolean(value));
  }, [contractFormInfo]);

  // 合同总金额
  const contractAmountTotal = useMemo(() => {
    const amountTotal = (
      Number(contractFormInfo.perAcreAmount) *
      contractFormInfo.actualAcreNum *
      contractFormInfo.termOfLease
    ).toFixed(2);
    return Number(amountTotal);
  }, [contractFormInfo.perAcreAmount, contractFormInfo.actualAcreNum, contractFormInfo.termOfLease]);

  // 付款金额
  const contractPayment = useMemo(() => {
    let payment = 0;
    switch (paymentMethod.dictLabel) {
      case "年付":
        payment = contractAmountTotal / contractFormInfo.termOfLease;
        break;
      case "两季付":
        payment = contractAmountTotal / contractFormInfo.termOfLease / 2;
        break;
      case "三季付":
        payment = Number((contractAmountTotal / contractFormInfo.termOfLease / 3).toFixed(2));
        break;
      default:
        break;
    }
    return payment;
  }, [contractAmountTotal, contractFormInfo.termOfLease, paymentMethod.dictLabel]);

  // 监听表单变化
  useEffect(() => {
    // 触发状态更新标记
    setIsChangeContractFormInfo(true);
  }, [contractFormInfo]);

  // 页面初始化
  useEffect(() => {
    const {contractType: type, landInfo, landCoordinates} = route.params || {};
    setContractType(type);

    if (type === "新建") {
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
      } = JSON.parse(landInfo || "{}");

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
        landGps: landCoordinates || "",
        province: province || "",
        city: city || "",
        district: district || "",
        township: township || "",
        administrativeVillage: administrativeVillage || "",
        detailaddress: detailaddress || "",
      }));
    } else {
      getLandContractDetail(JSON.parse(landInfo || "{}"));
    }

    // 安卓返回键处理
    const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    return () => backHandler.remove();
  }, [route.params]);

  // 返回处理
  const handleBackPress = () => {
    if (isChangeContractFormInfo) {
      setMsgText("是否保存修改信息？");
      setLeftBtnText("不保存");
      setRightBtnText("保存");
      setRightBtnStyle({color: Global.colors.primary});
      setShowSavePopup(true);
      setOperateState("保存");
      return true; // 阻止默认返回
    }
    navigation.goBack();
    return false;
  };

  // 作废合同
  const obsoleteContract = useCallback(
    debounce(() => {
      setMsgText("是否作废该合同？");
      setLeftBtnText("取消");
      setRightBtnText("作废");
      setRightBtnStyle({color: "#FF3D3B"});
      setShowSavePopup(true);
      setOperateState("作废");
    }, 500),
    [],
  );

  // 租赁期限选择器
  const openLeaseTermPicker = () => setIsShowLeaseTermPicker(true);
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
  const closePaymentMethodPicker = (method: PaymentMethodsDictionary) => {
    setIsShowPaymentMethodPicker(false);
    if (method) {
      setPaymentMethod(method);
      setContractFormInfo(prev => ({...prev, paymentMethod: method.dictValue}));
    }
  };

  // 付款时间常量
  const PAYMENT_YEAR = "paymentYear";
  const PAYMENT_ONE_SEASON = "paymentOneSeason";
  const PAYMENT_TWO_SEASON = "paymentTwoSeason";
  const PAYMENT_THREE_SEASON = "paymentThreeSeason";

  // 设置付款时间
  const setPaymentTime = (payMethod: string, time: string) => {
    switch (payMethod) {
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
      default:
        break;
    }
    formatParams();
  };

  // 付款时间选择器
  const openPaymentTimePicker = (method: string) => {
    setIsShowPaymentTimePicker(true);
    setPayMethod(method);
  };

  // 关闭付款时间选择器
  const closePaymentTimePicker = (time: QuarterItem) => {
    setIsShowPaymentTimePicker(false);
    if (time) setPaymentTime(payMethod, time);
  };

  // 亩数调整
  const addMuNumber = () => {
    setContractFormInfo(prev => ({
      ...prev,
      actualAcreNum: Number((prev.actualAcreNum + 0.1).toFixed(1)),
    }));
  };

  const reduceMuNumber = () => {
    if (contractFormInfo.actualAcreNum <= 0) return;
    setContractFormInfo(prev => ({
      ...prev,
      actualAcreNum: Number((prev.actualAcreNum - 0.1).toFixed(1)),
    }));
  };

  // 地块位置编辑
  const editLandPosition = () => setIsEditLandPosition(true);
  const positionPopupCancel = () => setIsEditLandPosition(false);
  const positionPopupConfirm = () => {
    setIsEditLandPosition(false);
    ToastAndroid.show("修改成功", ToastAndroid.SHORT);
  };

  // 省市区选择
  const openProvincePopup = () => setShowProvincePopup(true);
  const closeProvincePopup = (location: {province: string; city: string; district: string}) => {
    setShowProvincePopup(false);
    if (location) {
      setContractFormInfo(prev => ({
        ...prev,
        province: location.province,
        city: location.city,
        district: location.district,
        detailaddress: "",
      }));
    }
  };

  // 证件扫描
  const scanCard = (type: string) => {
    setScanType(type);
    if (type === "身份证") {
      setImageType("1");
      setScanResultTitle("身份证信息");
    } else {
      setImageType("2");
      setScanResultTitle("银行卡信息");
    }
    openChooseImage();
  };

  // 选择图片
  const openChooseImage = () => {
    // React Native 图片选择需集成 react-native-image-picker
    // 此处为示例逻辑
    // ImagePicker.showImagePicker({}, (response) => {
    //   if (response.didCancel) return;
    //   setImageUrl(response.uri);
    //   uploadImg(response.uri, imageType);
    // });
  };

  // 上传图片识别
  const uploadImg = (filePath: string, imageType: string) => {
    ToastAndroid.show("图片识别中", ToastAndroid.SHORT);
    // React Native 文件上传需使用 fetch/axios
    // 此处为示例逻辑
    // const formData = new FormData();
    // formData.append('file', {
    //   uri: filePath,
    //   type: 'image/jpeg',
    //   name: 'ocr.jpg',
    // });
    // formData.append('type', imageType);

    // fetch('http://60.205.213.205:8091/upload/uploadOCRImg', {
    //   method: 'POST',
    //   headers: {
    //     'token': 'xxx', // 从存储获取
    //     'Content-Type': 'multipart/form-data',
    //   },
    //   body: formData,
    // })
    // .then(res => res.json())
    // .then(data => {
    //   ToastAndroid.hide();
    //   if (data.code === 200) {
    //     setOcrInfo(JSON.parse(data.data));
    //     setShowOcrPopup(true);
    //   } else {
    //     setShowSavePopup(true);
    //     setOperateState('识别');
    //     setMsgText('无法识别银行卡');
    //     setRightBtnStyle({ color: '#08AE3C' });
    //     setLeftBtnText('重试');
    //     setRightBtnText('手动输入');
    //   }
    // });
  };

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
  const saveContract = useCallback(
    debounce(() => {
      if (allFieldsFilled) {
        setMsgText("是否保存修改信息？");
        setLeftBtnText("不保存");
        setRightBtnText("保存");
        setRightBtnStyle({color: Global.colors.primary});
        setShowSavePopup(true);
        setOperateState("保存");
      } else {
        ToastAndroid.show("当前有信息未填完成", ToastAndroid.SHORT);
      }
    }, 500),
    [allFieldsFilled],
  );

  // 保存弹窗取消
  const handleCancel = () => {
    if (operateState === "识别") {
      openChooseImage();
    } else {
      navigation.goBack();
    }
    setShowSavePopup(false);
  };

  // 保存弹窗确认
  const handleConfirm = async () => {
    switch (operateState) {
      case "识别":
        setShowSavePopup(false);
        break;
      case "保存":
        await saveContractRequest();
        break;
      case "作废":
        await cancelContractRequest();
        break;
      default:
        break;
    }
  };

  // 格式化参数
  const formatParams = () => {
    let times = [];
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
      default:
        break;
    }

    setContractFormInfo(prev => ({
      ...prev,
      times,
      totalAmount: contractAmountTotal,
      paymentAmount: contractPayment,
    }));

    // 更新缓存
    setContractCancheInfo({
      startTime: contractFormInfo.startTime,
      endTime: contractFormInfo.endTime,
      perAcreAmount: contractFormInfo.perAcreAmount,
      paymentMethod: contractFormInfo.paymentMethod,
      dictLabel: paymentMethod.dictLabel,
      times,
    });
  };

  // 保存合同请求
  const saveContractRequest = async () => {
    if (!allFieldsFilled) {
      setShowSavePopup(false);
      ToastAndroid.show("当前有信息未填完成", ToastAndroid.SHORT);
      return;
    }

    try {
      // 过滤参数
      const params = filterParams(contractFormInfo);
      // 接口请求逻辑（示例）
      // if (contractType === '新建') {
      //   await addContract(params);
      // } else {
      //   await editContractMessage(params);
      // }

      setShowSavePopup(false);
      setShowSaveSuccessPopup(true);
    } catch (error: any) {
      setShowSavePopup(false);
      ToastAndroid.show(error?.data?.msg || "保存失败", ToastAndroid.SHORT);
    }
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
      "landGps",
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

  // 作废合同请求
  const cancelContractRequest = async () => {
    try {
      // 接口请求逻辑
      // await cancelContractMessage({ id: contractFormInfo.id });
      setShowSavePopup(false);
      ToastAndroid.show("操作成功", ToastAndroid.SHORT);
      navigation.goBack();
    } catch (error: any) {
      ToastAndroid.show(error?.data?.msg || "请求失败", ToastAndroid.SHORT);
    }
  };

  // 关闭保存成功弹窗
  const closeSavePopup = () => {
    setShowSaveSuccessPopup(false);
    navigation.navigate("Home"); // 切换到首页tab
  };

  // 查看合同
  const viewContract = () => {
    setShowSaveSuccessPopup(false);
    navigation.navigate("ElectronicContractDetails", {
      contractInfo: JSON.stringify(contractFormInfo),
    });
  };

  // 获取地块合同详情
  const getLandContractDetail = (landInfo: any) => {
    const contractInfo = filterParams(landInfo);
    setContractFormInfo(prev => ({
      ...prev,
      ...contractInfo,
      paymentMethod: landInfo?.dictValue,
      totalAmount: contractAmountTotal,
      paymentAmount: contractPayment,
    }));
    setPaymentMethod({dictLabel: landInfo?.dictLabel, dictValue: landInfo?.dictValue});

    if (contractInfo.times) {
      switch (landInfo?.dictLabel) {
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
        rightTitleStyle={{color: "#FF3D3B", fontSize: 16, fontWeight: "500"}}
        onBack={handleBackPress}
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
                <Text style={AddContractScreenStyles.msgInputText}>{contractFormInfo.landGps}</Text>
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
        <TouchableOpacity style={[AddContractScreenStyles.btn, {opacity: allFieldsFilled ? 1 : 0.3}]} onPress={saveContract}>
          <Text style={AddContractScreenStyles.btnText}>保存</Text>
        </TouchableOpacity>
      </View>

      {/* 租赁期限弹窗 */}
      <LeaseTermPicker
        visible={isShowLeaseTermPicker}
        onClosePopup={() => setIsShowLeaseTermPicker(false)}
        onConfirm={year => closeLeaseTermPicker(year)}
      />

      {/* 租赁时间弹窗 */}
      <LeaseTimePicker
        visible={isShowLeaseTimePicker}
        onClose={() => setIsShowLeaseTimePicker(false)}
        onConfirm={time => closeLeaseTimePicker(time)}
      />

      {/* 支付方式弹窗 */}
      <PaymentMethodPicker
        visible={isShowPaymentMethodPicker}
        onClose={() => setIsShowPaymentMethodPicker(false)}
        onConfirm={method => closePaymentMethodPicker(method)}
      />

      {/* 支付时间弹窗 */}
      <PaymentTimePicker
        visible={isShowPaymentTimePicker}
        onClose={() => setIsShowPaymentTimePicker(false)}
        onConfirm={time => closePaymentTimePicker(time)}
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
        onClose={() => setShowProvincePopup(false)}
        onConfirm={closeProvincePopup}
      />

      {/* 保存成功弹窗 */}
      <Popup
        visible={showSaveSuccessPopup}
        title="提示"
        msgText={`合同${contractType}成功`}
        leftBtnText="关闭"
        rightBtnText="查看合同"
        onLeftBtn={() => closeSavePopup()}
        onRightBtn={() => viewContract()}
      />
    </View>
  );
};

export default AddContractScreen;
