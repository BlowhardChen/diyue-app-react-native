import React, {useState, useEffect, useRef} from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Modal,
  FlatList,
  Alert,
} from "react-native";
import {useNavigation} from "@react-navigation/native";
import debounce from "lodash/debounce";
import {PermissionsAndroid, NativeModules, ImagePropsAndroid} from "react-native";
import axios from "axios";
import {LandInfoEditScreenStyles} from "./styles/LandInfoEditScreen";
import {StackNavigationProp} from "@react-navigation/stack";
import CustomStatusBar from "@/components/common/CustomStatusBar";

// 类型定义
interface LandFormInfo {
  id: string;
  landName: string;
  cardid: string;
  bankAccount: string;
  openBank: string;
  mobile: string;
  landType: string;
  acreageNum: number;
  actualAcreNum: number;
  country: string;
  province: string;
  city: string;
  district: string;
  township: string;
  administrativeVillage: string;
  detailaddress: string;
}

interface SearchResultItem {
  relename: string;
  cardid: string;
  mobile: string;
  bankAccount: string;
}

interface ContractTypeItem {
  value: string;
}

type LandInfoEditStackParamList = {
  NewContract: {
    contractType: string;
    landInfo: LandFormInfo;
    landCoordinates: string;
  };
  Enclosure: undefined;
  FarmingServiceList: {
    farmInfo: {
      id: string;
      list: any;
      landType: string;
      landName: string;
      actualAcreNum: number;
    };
  };
};

// 主组件
const LandInfoEditScreen = ({route}: {route: any}) => {
  const navigation = useNavigation<StackNavigationProp<LandInfoEditStackParamList>>();
  const {landInfo: queryInfo} = route.params || {};

  // 表单数据
  const [landFormInfo, setLandFormInfo] = useState<LandFormInfo>({
    id: "",
    landName: "",
    cardid: "",
    bankAccount: "",
    openBank: "",
    mobile: "",
    landType: "1",
    acreageNum: 0,
    actualAcreNum: 0,
    country: "",
    province: "",
    city: "",
    district: "",
    township: "",
    administrativeVillage: "",
    detailaddress: "",
  });

  // 状态管理
  const [leftBtnText, setLeftBtnText] = useState("不保存");
  const [rightBtnText, setRightBtnText] = useState("保存");
  const [scanType, setScanType] = useState("");
  const [scanResultTitle, setScanResultTitle] = useState("银行卡信息");
  const [imageUrl, setImageUrl] = useState("");
  const [imageType, setImageType] = useState("");
  const [landNameResults, setLandNameResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isShowPowerPopup, setIsShowPowerPopup] = useState(false);
  const [showOcrPopup, setShowOcrPopup] = useState(false);
  const [msgText, setMsgText] = useState("");
  const [popupType, setPopupType] = useState("save");
  const [ocrInfo, setOcrInfo] = useState<any>(null);
  const [isCheckedType, setIsCheckedType] = useState(0);
  const [showContractNumber, setShowContractNumber] = useState(false);
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [showSaveSuccessPopup, setShowSaveSuccessPopup] = useState(false);

  const contractType: ContractTypeItem[] = [{value: "流转"}, {value: "托管"}];

  const landInfo = useRef<any>(null);
  const landCoordinates = useRef<any[]>([]);
  const contractDetail = useRef<any>(null);

  // 返回
  const backView = () => {
    navigation.goBack();
  };

  // 扫描证件
  const scanCard = async (type: string) => {};

  // 姓名/地块名输入处理（带防抖）
  const handleLandNameInput = debounce(async (text: string) => {
    const keyword = text.trim();
    if (keyword.length < 1) {
      setLandNameResults([]);
      return;
    }
    await searchFarmerByName(keyword);
  }, 500);

  // 取消姓名聚焦
  const blurLandName = () => {
    setLandNameResults([]);
  };

  // 按姓名搜索农户
  const searchFarmerByName = async (name: string) => {
    if (isSearching) return;
    setIsSearching(true);
    try {
      // 实际项目中替换为真实API调用
      const response = await axios.post("/api/searchUserInfo", {relename: name});
      setLandNameResults(response.data.rows || []);
    } catch (error) {
      console.error("搜索失败:", error);
      setLandNameResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 选择姓名搜索结果
  const selectLandNameResult = (item: SearchResultItem) => {
    setLandFormInfo(prev => ({
      ...prev,
      landName: item.relename,
      cardid: item.cardid || prev.cardid,
      mobile: item.mobile || prev.mobile,
      bankAccount: item.bankAccount || prev.bankAccount,
    }));
    setLandNameResults([]);
  };

  // 关键字高亮显示
  const highlightKeyword = (text: string, keyword: string) => {
    if (!text || !keyword) return text || "";
    const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const reg = new RegExp(safeKeyword, "gi");
    return text.replace(reg, match => `<span style="color:#08AE3C">${match}</span>`);
  };

  // 暂不开启权限
  const cancelOpenPower = () => {
    setIsShowPowerPopup(false);
  };

  // 开启权限
  const confirmOpenPower = async () => {};

  // 上传图片获取ocr识别结果
  const uploadImg = (filePath: string, imageType: string) => {};

  // 识别结果弹窗取消
  const scanPopupCance = () => {
    setShowOcrPopup(false);
  };

  // 识别结果弹窗确定
  const scanPopupConfirm = () => {
    setShowOcrPopup(false);
    if (scanType === "身份证") {
      setLandFormInfo(prev => ({
        ...prev,
        landName: ocrInfo.name || prev.landName,
        cardid: ocrInfo.idNumber || prev.cardid,
        bankAccount: ocrInfo.bankAccount || prev.bankAccount,
      }));
    } else {
      setLandFormInfo(prev => ({
        ...prev,
        bankAccount: ocrInfo.cardNumber || prev.bankAccount,
        openBank: ocrInfo.bankName || prev.openBank,
      }));
    }
  };

  // 实际亩数失去焦点处理
  const blurAcreNum = () => {
    setLandFormInfo(prev => {
      let actualAcreNum = prev.actualAcreNum;
      if (actualAcreNum < prev.acreageNum - 0.1) {
        actualAcreNum = prev.acreageNum;
      }
      if (actualAcreNum > prev.acreageNum + 0.11) {
        actualAcreNum = prev.acreageNum;
      }
      return {...prev, actualAcreNum};
    });
  };

  // 亩数增加
  const addMuNumber = () => {
    setLandFormInfo(prev => {
      let newNum = prev.actualAcreNum + 0.01;
      if (newNum < prev.acreageNum + 0.11) {
        return {...prev, actualAcreNum: Number(newNum.toFixed(2))};
      }
      return prev;
    });
  };

  // 亩数减少
  const reduceMuNumber = () => {
    setLandFormInfo(prev => {
      let newNum = prev.actualAcreNum - 0.01;
      if (newNum > prev.acreageNum - 0.11) {
        return {...prev, actualAcreNum: Number(newNum.toFixed(2))};
      }
      return prev;
    });
  };

  // 选择城市
  const selectCity = () => {
    // 城市选择逻辑
  };

  // 选择合同类型
  const selectContract = (index: number) => {
    setIsCheckedType(index);
    setLandFormInfo(prev => ({
      ...prev,
      landType: index === 1 ? "2" : "1",
    }));
  };

  // 新建合同
  const addContractNumber = () => {
    navigation.navigate("NewContract", {
      contractType: "新建",
      landInfo: landFormInfo,
      landCoordinates: formatCoordinateString(landCoordinates.current),
    });
  };

  // 显示合同编号更多
  const openMoreNumber = () => {
    // 更多合同编号逻辑
  };

  // 保存
  const saveLandInfo = debounce(() => {
    setMsgText("是否保存修改信息？");
    setShowSavePopup(true);
    setPopupType("save");
  }, 500);

  // 弹窗取消
  const handleCancel = () => {
    if (msgText === "无法识别银行卡") {
      if (imageUrl && imageType) {
        uploadImg(imageUrl, imageType);
      }
    } else {
      setShowSavePopup(false);
      navigation.goBack();
    }
  };

  // 弹窗保存
  const handleConfirm = async () => {
    if (msgText === "无法识别银行卡") {
      setShowSavePopup(false);
    } else {
      try {
        // 实际项目中替换为真实API调用
        await axios.post("/api/editLandMsg", landFormInfo);
        setShowSavePopup(false);

        if (landFormInfo.landType === "2") {
          setShowSaveSuccessPopup(true);
        } else {
          Alert.alert("保存成功");
          backView();
        }
      } catch (error: any) {
        Alert.alert(error.response?.data?.information || "保存失败请重试");
      }
    }
  };

  // 继续圈地
  const continueDrawLand = () => {
    navigation.navigate("Enclosure");
  };

  // 创建托管订单
  const createOrder = () => {
    navigation.navigate("FarmingServiceList", {
      farmInfo: {
        id: queryInfo.id,
        landType: landFormInfo.landType,
        list: queryInfo.list,
        landName: queryInfo.landName,
        actualAcreNum: landFormInfo.actualAcreNum,
      },
    });
  };

  // 获取地块位置信息
  const getLandLocation = async (lnglat: {lng: number; lat: number}) => {
    try {
      // 实际项目中替换为真实API调用
      const response = await axios.post("/api/locationToAddress", {
        latitude: lnglat.lat.toString(),
        longitude: lnglat.lng.toString(),
      });

      const {regeocode} = JSON.parse(response.data);
      const {formatted_address, addressComponent} = regeocode;

      setLandFormInfo(prev => ({
        ...prev,
        country: addressComponent.country,
        province: addressComponent.province,
        city: addressComponent.city,
        district: addressComponent.district,
        township: addressComponent.township,
        detailaddress: formatted_address,
      }));
    } catch (error: any) {
      Alert.alert(error.response?.data?.msg || "请求失败");
    }
  };

  // 获取详情数据
  const getLandDetailInfData = async (id: string) => {
    try {
      // 实际项目中替换为真实API调用
      const response = await axios.get(`/api/getLandDetailsInfo/${id}`);
      const data = response.data[0];

      landInfo.current = data;
      landCoordinates.current = data.list;

      setLandFormInfo({
        ...landFormInfo,
        landName: data.landName,
        acreageNum: data.acreageNum,
        actualAcreNum: data.actualAcreNum,
        id: data.id,
        cardid: data.cardid ?? "",
        bankAccount: data.bankAccount ?? "",
        mobile: data.mobile ?? "",
        landType: data.landType,
        administrativeVillage: data.administrativeVillage,
      });

      setIsCheckedType(data.landType === "1" ? 0 : 1);
    } catch (error: any) {
      Alert.alert(error.response?.data?.msg || "请求失败");
    }
  };

  // 获取地块合同信息
  const getLandContractDetail = async (id: string) => {
    try {
      // 实际项目中替换为真实API调用
      const response = await axios.get(`/api/getContractMessageDetail?landId=${id}`);
      contractDetail.current = response.data;
    } catch (error: any) {
      Alert.alert(error.response?.data?.msg || "地块合同信息获取失败");
    }
  };

  // 格式化坐标字符串
  const formatCoordinateString = (coordinates: any[]) => {
    const coordinateList = coordinates;
    const coordinateStringList: number[][] = [];

    coordinates.slice(0, coordinateList.length - 1).forEach((item: any) => {
      coordinateStringList.push([item.lng, item.lat]);
    });

    return coordinateStringList.join(";");
  };

  // 生命周期
  useEffect(() => {
    if (queryInfo && queryInfo.list && queryInfo.list.length > 0) {
      getLandLocation(queryInfo.list[0]);
    }

    if (queryInfo && queryInfo.id) {
      getLandDetailInfData(queryInfo.id);
      getLandContractDetail(queryInfo.id);
    }
  }, [queryInfo]);

  return (
    <View style={LandInfoEditScreenStyles.container}>
      <CustomStatusBar navTitle="地块信息" onBack={() => navigation.goBack()} />
      <ScrollView style={LandInfoEditScreenStyles.informationContent}>
        {/* 农户个人信息 */}
        <View style={LandInfoEditScreenStyles.personalInfo}>
          <View style={LandInfoEditScreenStyles.titleContainer}>
            <View style={LandInfoEditScreenStyles.mark}></View>
            <Text style={LandInfoEditScreenStyles.titleText}>农户个人信息</Text>
          </View>

          <View style={LandInfoEditScreenStyles.informationBox}>
            <View style={LandInfoEditScreenStyles.informationBoxItem}>
              <Text style={LandInfoEditScreenStyles.informationText}>姓名/地块名</Text>
              <TextInput
                style={LandInfoEditScreenStyles.informationInput}
                value={landFormInfo.landName}
                placeholder="请输入"
                onChangeText={text => {
                  setLandFormInfo(prev => ({...prev, landName: text}));
                  handleLandNameInput(text);
                }}
                onBlur={blurLandName}
              />
              <TouchableOpacity style={LandInfoEditScreenStyles.informationImg} onPress={() => scanCard("身份证")}>
                <Image source={require("@/assets/images/common/icon-scan.png")} style={LandInfoEditScreenStyles.scanIcon} />
              </TouchableOpacity>

              {/* 姓名/地块名搜索结果列表 */}
              {landNameResults.length > 0 && (
                <View style={LandInfoEditScreenStyles.searchResults}>
                  {landNameResults.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={LandInfoEditScreenStyles.searchResultItem}
                      onPress={() => selectLandNameResult(item)}>
                      <Text
                        style={LandInfoEditScreenStyles.name}
                        dangerouslySetInnerHTML={{
                          __html: highlightKeyword(item.relename, landFormInfo.landName),
                        }}
                      />
                      <Text style={LandInfoEditScreenStyles.cardidText}>{item.cardid}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={LandInfoEditScreenStyles.informationBoxItem}>
              <Text style={LandInfoEditScreenStyles.informationText}>身份证号</Text>
              <TextInput
                style={LandInfoEditScreenStyles.informationInput}
                value={landFormInfo.cardid}
                placeholder="请输入"
                keyboardType="numeric"
                onChangeText={text => setLandFormInfo(prev => ({...prev, cardid: text}))}
              />
              <TouchableOpacity style={LandInfoEditScreenStyles.informationImg} onPress={() => scanCard("身份证")}>
                <Image source={require("@/assets/images/common/icon-scan.png")} style={LandInfoEditScreenStyles.scanIcon} />
              </TouchableOpacity>
            </View>

            <View style={LandInfoEditScreenStyles.informationBoxItem}>
              <Text style={LandInfoEditScreenStyles.informationText}>银行卡号</Text>
              <TextInput
                style={LandInfoEditScreenStyles.informationInput}
                value={landFormInfo.bankAccount}
                placeholder="请输入"
                keyboardType="numeric"
                onChangeText={text => setLandFormInfo(prev => ({...prev, bankAccount: text}))}
              />
              <TouchableOpacity style={LandInfoEditScreenStyles.informationImg} onPress={() => scanCard("银行卡")}>
                <Image source={require("@/assets/images/common/icon-scan.png")} style={LandInfoEditScreenStyles.scanIcon} />
              </TouchableOpacity>
            </View>

            <View style={LandInfoEditScreenStyles.informationBoxItem}>
              <Text style={LandInfoEditScreenStyles.informationText}>手机号</Text>
              <TextInput
                style={LandInfoEditScreenStyles.informationInput}
                value={landFormInfo.mobile}
                placeholder="请输入"
                keyboardType="phone-pad"
                maxLength={11}
                onChangeText={text => setLandFormInfo(prev => ({...prev, mobile: text}))}
              />
              <View style={LandInfoEditScreenStyles.informationImg} />
            </View>
          </View>
        </View>

        {/* 地块面积 */}
        <View style={LandInfoEditScreenStyles.landArea}>
          <View style={LandInfoEditScreenStyles.titleContainer}>
            <View style={LandInfoEditScreenStyles.mark}></View>
            <Text style={LandInfoEditScreenStyles.titleText}>地块面积</Text>
          </View>

          <View style={LandInfoEditScreenStyles.informationBox}>
            <View style={LandInfoEditScreenStyles.informationBoxItem}>
              <Text style={LandInfoEditScreenStyles.informationText}>测量亩数</Text>
              <View style={LandInfoEditScreenStyles.informationNumber}>
                <Text style={LandInfoEditScreenStyles.number}>{landFormInfo.acreageNum}</Text>
                <Text style={LandInfoEditScreenStyles.unit}>亩</Text>
              </View>
            </View>

            <View style={[LandInfoEditScreenStyles.informationBoxItem, LandInfoEditScreenStyles.lastItem]}>
              <Text style={LandInfoEditScreenStyles.informationText}>实际亩数</Text>
              <View style={LandInfoEditScreenStyles.informationArea}>
                <TouchableOpacity onPress={addMuNumber}>
                  <Image
                    source={require("@/assets/images/common/icon-add.png")}
                    style={LandInfoEditScreenStyles.informationIcon}
                  />
                </TouchableOpacity>
                <View style={LandInfoEditScreenStyles.informationUnit}>
                  <TextInput
                    value={landFormInfo.actualAcreNum.toString()}
                    placeholder="请输入"
                    keyboardType="numeric"
                    onChangeText={text =>
                      setLandFormInfo(prev => ({
                        ...prev,
                        actualAcreNum: parseFloat(text) || 0,
                      }))
                    }
                    onBlur={blurAcreNum}
                    style={LandInfoEditScreenStyles.unitInput}
                  />
                  <Text style={LandInfoEditScreenStyles.unitText}>亩</Text>
                </View>
                <TouchableOpacity onPress={reduceMuNumber}>
                  <Image
                    source={require("@/assets/images/common/icon-reduce.png")}
                    style={LandInfoEditScreenStyles.informationIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* 地块位置 */}
        <View style={LandInfoEditScreenStyles.landPosition}>
          <View style={LandInfoEditScreenStyles.titleContainer}>
            <View style={LandInfoEditScreenStyles.mark}></View>
            <Text style={LandInfoEditScreenStyles.titleText}>地块位置</Text>
          </View>

          <View style={LandInfoEditScreenStyles.informationBox}>
            <View style={LandInfoEditScreenStyles.informationBoxItem}>
              <Text style={LandInfoEditScreenStyles.informationText}>所在县/区</Text>
              <TextInput
                style={LandInfoEditScreenStyles.informationInput}
                value={landFormInfo.district}
                placeholder="请输入"
                onChangeText={text => setLandFormInfo(prev => ({...prev, district: text}))}
              />
              <TouchableOpacity style={LandInfoEditScreenStyles.informationImg} onPress={selectCity}>
                <Image source={require("@/assets/images/common/icon-right.png")} style={LandInfoEditScreenStyles.rightIcon} />
              </TouchableOpacity>
            </View>

            <View style={LandInfoEditScreenStyles.informationBoxItem}>
              <Text style={LandInfoEditScreenStyles.informationText}>所在镇/街道</Text>
              <TextInput
                style={LandInfoEditScreenStyles.informationInput}
                value={landFormInfo.township}
                placeholder="请输入"
                onChangeText={text => setLandFormInfo(prev => ({...prev, township: text}))}
              />
              <View style={LandInfoEditScreenStyles.informationImg} />
            </View>

            <View style={LandInfoEditScreenStyles.informationBoxItem}>
              <Text style={LandInfoEditScreenStyles.informationText}>所在行政村</Text>
              <TextInput
                style={LandInfoEditScreenStyles.informationInput}
                value={landFormInfo.administrativeVillage}
                placeholder="请输入"
                onChangeText={text =>
                  setLandFormInfo(prev => ({
                    ...prev,
                    administrativeVillage: text,
                  }))
                }
              />
              <View style={LandInfoEditScreenStyles.informationImg} />
            </View>

            <View style={[LandInfoEditScreenStyles.informationBoxItem, LandInfoEditScreenStyles.lastItem]}>
              <Text style={LandInfoEditScreenStyles.informationText}>具体位置</Text>
              <TextInput
                style={LandInfoEditScreenStyles.informationInput}
                value={landFormInfo.detailaddress}
                placeholder="请输入"
                onChangeText={text => setLandFormInfo(prev => ({...prev, detailaddress: text}))}
              />
              <View style={LandInfoEditScreenStyles.informationImg} />
            </View>
          </View>
        </View>

        {/* 合同类型 */}
        <View style={LandInfoEditScreenStyles.contractType}>
          <Text style={LandInfoEditScreenStyles.contractTitle}>合同类型</Text>
          <View style={LandInfoEditScreenStyles.contractRadio}>
            {contractType.map((item, index) => (
              <TouchableOpacity key={index} style={LandInfoEditScreenStyles.radioItem} onPress={() => selectContract(index)}>
                <Image
                  source={
                    isCheckedType === index
                      ? require("@/assets/images/common/icon-checked.png")
                      : require("@/assets/images/common/icon-check.png")
                  }
                  style={LandInfoEditScreenStyles.radioIcon}
                />
                <Text style={LandInfoEditScreenStyles.radioText}>{item.value}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      {/* 保存按钮 */}
      <View style={LandInfoEditScreenStyles.btnSave}>
        <TouchableOpacity style={LandInfoEditScreenStyles.btn} onPress={saveLandInfo}>
          <Text style={LandInfoEditScreenStyles.btnText}>保存</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LandInfoEditScreen;
