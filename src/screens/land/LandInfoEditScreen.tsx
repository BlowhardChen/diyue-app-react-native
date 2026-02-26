import React, {useState, useEffect, useRef, use} from "react";
import {View, Text, TextInput, Image, ScrollView, TouchableOpacity, Alert} from "react-native";
import {useNavigation} from "@react-navigation/native";
import debounce from "lodash/debounce";
import {LandInfoEditScreenStyles} from "./styles/LandInfoEditScreen";
import {StackNavigationProp} from "@react-navigation/stack";
import CustomStatusBar from "@/components/common/CustomStatusBar";
import HTMLView from "react-native-htmlview";
import {LandFormInfo} from "@/types/land";
import {editLandInfo, getLandDetailsInfo, locationToAddress, searchUserInfo} from "@/services/land";
import Popup from "@/components/common/Popup";
import {updateStore} from "@/stores/updateStore";

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
  OcrCardScanner: {
    type: string;
    onOcrResult: (result: {type: string; data: any}) => void;
  };
};

// 主组件
const LandInfoEditScreen = ({route}: {route: any}) => {
  const navigation = useNavigation<StackNavigationProp<LandInfoEditStackParamList>>();
  const {params} = route || {};
  const [landNameResults, setLandNameResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCheckedType, setIsCheckedType] = useState(0);
  const [isShowSavePopup, setIsShowSavePopup] = useState(false);
  const [isShowSaveSuccessPopup, setIsShowSaveSuccessPopup] = useState(false);
  const contractType: ContractTypeItem[] = [{value: "流转"}, {value: "托管"}];
  const landCoordinates = useRef<any[]>([]);
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

  useEffect(() => {
    updateStore.setIsUpdateLand(false);
  }, []);

  // 返回
  const backView = () => {
    navigation.goBack();
  };

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
      const {data} = await searchUserInfo({relename: name});
      setLandNameResults(data.rows || []);
    } catch (error) {
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

  // 扫描证件
  const scanCard = async (type: string) => {
    navigation.navigate("OcrCardScanner", {
      type,
      onOcrResult: result => handleOcrResult(result, type),
    });
  };

  // 处理OCR识别结果
  const handleOcrResult = (result: {type: string; data: any}, scanType: string) => {
    if (!result.data) return;
    const data = JSON.parse(result.data.data);
    if (scanType === "身份证") {
      setLandFormInfo(prev => ({
        ...prev,
        landName: data.name || prev.landName,
        cardid: data.idNumber || prev.cardid,
        bankAccount: data.cardNumber || prev.bankAccount,
      }));
      return;
    }
    if (scanType === "银行卡") {
      setLandFormInfo(prev => ({
        ...prev,
        landName: data.name || prev.landName,
        cardid: data.cardNumber || prev.cardid,
        bankAccount: data.cardNumber || prev.bankAccount,
      }));
      return;
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

  // 选择合同类型
  const selectContract = (index: number) => {
    setIsCheckedType(index);
    setLandFormInfo(prev => ({
      ...prev,
      landType: index === 1 ? "2" : "1",
    }));
  };

  // 保存弹窗取消
  const savePopupCancel = () => {
    setIsShowSavePopup(false);
  };

  // 保存弹窗确认
  const savePopupConfirm = debounce(async () => {
    await editLandInfo(landFormInfo);
    setIsShowSavePopup(false);
    updateStore.setIsUpdateLand(true);
    if (params.navigation === "Enclosure") {
      setIsShowSaveSuccessPopup(true);
    } else {
      navigation.goBack();
    }
  }, 500);

  // 继续圈地
  const continueDrawLand = () => {
    setIsShowSaveSuccessPopup(false);
    navigation.goBack();
  };

  // 创建托管订单
  const createOrder = () => {
    navigation.navigate("FarmingServiceList", {
      farmInfo: {
        id: params.queryInfo.id,
        landType: landFormInfo.landType,
        list: params.queryInfo.list,
        landName: params.queryInfo.landName,
        actualAcreNum: landFormInfo.actualAcreNum,
      },
    });
  };

  // 获取地块位置信息
  const getLandLocation = async (lnglat: {lng: number; lat: number}) => {
    const res = await locationToAddress({
      latitude: lnglat.lat.toString(),
      longitude: lnglat.lng.toString(),
    });
    const {regeocode} = JSON.parse(res.data);
    const {formatted_address, addressComponent} = regeocode;

    setLandFormInfo(prev => ({
      ...prev,
      country: addressComponent.country ?? "",
      province: addressComponent.province ?? "",
      city: addressComponent.city ?? "",
      district: addressComponent.district ?? "",
      township: addressComponent.township ?? "",
      detailaddress: formatted_address ?? "",
    }));
  };

  // 获取详情数据
  const getLandDetailInfData = async (id: string) => {
    const {data} = await getLandDetailsInfo(id);
    landCoordinates.current = data.list;
    setLandFormInfo({
      ...landFormInfo,
      landName: data[0].landName,
      acreageNum: data[0].acreageNum,
      actualAcreNum: data[0].actualAcreNum,
      id: data[0].id,
      cardid: data[0].cardid ?? "",
      bankAccount: data[0].bankAccount ?? "",
      mobile: data[0].mobile ?? "",
      landType: data[0].landType,
      administrativeVillage: data[0].administrativeVillage,
    });
    setIsCheckedType(data[0].landType === "1" ? 0 : 1);
  };

  // 生命周期
  useEffect(() => {
    console.log("params.queryInfo", params.queryInfo);
    if (params.queryInfo && params.queryInfo.gpsList && params.queryInfo.gpsList.length > 0) {
      getLandLocation(params.queryInfo.gpsList[0]);
    }
    if (params.queryInfo && params.queryInfo.id) {
      getLandDetailInfData(params.queryInfo.id);
    }
  }, [params.queryInfo]);

  return (
    <View style={LandInfoEditScreenStyles.container}>
      <CustomStatusBar navTitle="地块信息" onBack={backView} />
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
              {/* <TouchableOpacity style={LandInfoEditScreenStyles.informationImg} onPress={selectCity}>
                <Image source={require("@/assets/images/common/icon-right.png")} style={LandInfoEditScreenStyles.rightIcon} />
              </TouchableOpacity> */}
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

      {/* 姓名/地块名搜索结果列表 */}
      {landNameResults.length > 0 && (
        <ScrollView style={LandInfoEditScreenStyles.searchResults}>
          {landNameResults.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={LandInfoEditScreenStyles.searchResultItem}
              onPress={() => selectLandNameResult(item)}>
              <HTMLView
                value={`<div>${highlightKeyword(item.relename, landFormInfo.landName)}</div>`}
                stylesheet={{
                  span: {color: "#08AE3C"},
                  div: {fontSize: 16},
                }}
              />
              <Text style={LandInfoEditScreenStyles.cardidText}>{item.cardid}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      {/* 保存按钮 */}
      <View style={LandInfoEditScreenStyles.btnSave}>
        <TouchableOpacity style={LandInfoEditScreenStyles.btn} onPress={() => setIsShowSavePopup(true)}>
          <Text style={LandInfoEditScreenStyles.btnText}>保存</Text>
        </TouchableOpacity>
      </View>
      {/* 保存提示弹窗（首页地块详情弹窗） */}
      <Popup
        visible={isShowSavePopup}
        title="提示"
        msgText="是否保存修改信息？"
        leftBtnText="不保存"
        rightBtnText="保存"
        onLeftBtn={savePopupCancel}
        onRightBtn={savePopupConfirm}
      />
      {/* 保存成功弹窗（圈地） */}
      <Popup
        visible={isShowSaveSuccessPopup}
        title="提示"
        msgText="信息保存成功"
        leftBtnText="返回上级"
        rightBtnText="创建订单"
        onLeftBtn={() => continueDrawLand()}
        onRightBtn={() => createOrder()}
      />
    </View>
  );
};

export default LandInfoEditScreen;
