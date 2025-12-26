import React, {useState, useEffect} from "react";
import {View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet, Dimensions} from "react-native";
import ProvincePicker from "@/components/common/ProvinceCityDistrictPicker";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {FilterPopupStyles} from "@/components/land/styles/FilterPopup";
import {useNavigation, useRoute} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import {saveTargetRoute} from "@/utils/navigationUtils";
import LeaseTimePicker from "@/components/common/LeaseTimePicker";

// 类型定义保持不变
interface LocationType {
  province: string;
  city: string;
  district: string;
  township: string;
}

interface SearchFormInfo {
  [key: string]: string;
}

type StackParamList = {
  OcrCardScanner: {type: string; onOcrResult: (result: {type: string; data: string}) => void};
};

interface Props {
  height?: number;
  marginTop?: number;
  onClose: () => void;
  onQuery: (data: SearchFormInfo) => void;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;

const ContractFilterPopup: React.FC<Props> = ({onClose, onQuery, height = SCREEN_HEIGHT - 111, marginTop = 0}) => {
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const [showProvincePopup, setShowProvincePopup] = useState(false);
  const navigation = useNavigation<StackNavigationProp<StackParamList>>();
  const [searchFormInfo, setSearchFormInfo] = useState<SearchFormInfo>({
    province: "",
    city: "",
    district: "",
    township: "",
    formattedAddress: "",
    detailaddress: "",
    relename: "",
    startTime: "",
    endTime: "",
    mobile: "",
    cardid: "",
    bankAccount: "",
    beginActualNum: "",
    endActualNum: "",
  });
  const [isShowTimePicker, setIsShowTimePicker] = useState(false);
  const [timeType, setTimeType] = useState<string>("");

  // 格式化银行卡号
  useEffect(() => {
    const formatted = searchFormInfo.bankAccount
      .replace(/\s/g, "")
      .replace(/(\d{4})/g, "$1 ")
      .trim();
    if (formatted !== searchFormInfo.bankAccount) {
      setSearchFormInfo(prev => ({...prev, bankAccount: formatted}));
    }
  }, [searchFormInfo.bankAccount]);

  // 打开日期选择器
  const openDatePicker = (type: "start" | "end") => {
    setTimeType(type);
    setIsShowTimePicker(true);
  };

  // 关闭日期选择器
  const closeDatePicker = (time: string) => {
    setIsShowTimePicker(false);
    if (timeType === "start") {
      setSearchFormInfo(prev => ({
        ...prev,
        startTime: time,
      }));
    } else {
      setSearchFormInfo(prev => ({...prev, endTime: time}));
    }
  };

  // 打开省份选择器
  const openProvincePopup = () => setShowProvincePopup(true);

  // 关闭省份选择器并更新搜索表单信息
  const closeProvince = (location?: LocationType) => {
    setShowProvincePopup(false);
    if (location?.province) {
      const addressSegments = [location.province, location.city, location.district, location.township].filter(
        segment => segment && segment.trim() !== "",
      );

      const formattedAddress = addressSegments.join("/");
      setSearchFormInfo(prev => ({
        ...prev,
        province: location.province ?? "",
        city: location.city ?? "",
        district: location.district ?? "",
        township: location.township ?? "",
        formattedAddress,
      }));
    }
  };

  // 打开卡片扫描器
  const openCardScan = (type: string) => {
    saveTargetRoute(route.name);
    navigation.navigate("OcrCardScanner", {
      type,
      onOcrResult: async result => {
        handleOcrResult(result, type);
      },
    });
  };

  // 处理OCR识别结果
  const handleOcrResult = (result: {type: string; data: any}, scanType: string) => {
    console.log("处理OCR识别结果", result);
    if (!result.data) return;
    const data = JSON.parse(result.data);
    if (scanType === "身份证") {
      setSearchFormInfo(prev => ({
        ...prev,
        relename: data.name || prev.relename,
        cardid: data.idNumber || prev.cardid,
      }));
      return;
    }
    if (scanType === "银行卡") {
      setSearchFormInfo(prev => ({
        ...prev,
        relename: data.name || prev.relename,
        bankAccount: data.cardNumber || prev.bankAccount,
      }));
      return;
    }
  };

  // 点击重置
  const clickReset = () => {
    setSearchFormInfo({
      province: "",
      city: "",
      district: "",
      township: "",
      formattedAddress: "",
      detailaddress: "",
      relename: "",
      startTime: "",
      endTime: "",
      mobile: "",
      cardid: "",
      bankAccount: "",
      beginActualNum: "",
      endActualNum: "",
    });
  };

  // 点击查询
  const clickQuery = () => {
    onQuery(searchFormInfo);
  };

  return (
    <View style={FilterPopupStyles.overlay}>
      <TouchableOpacity style={[FilterPopupStyles.overlayTouch, StyleSheet.absoluteFill]} onPress={onClose} activeOpacity={1} />
      <View style={[FilterPopupStyles.popupContainer, {paddingBottom: insets.bottom + 36}]}>
        <View style={[FilterPopupStyles.popupBox, {height, marginTop}]}>
          <ScrollView
            style={FilterPopupStyles.condition}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={FilterPopupStyles.conditionContent}
            overScrollMode="always">
            <View style={FilterPopupStyles.item}>
              <Text style={FilterPopupStyles.label}>农户姓名</Text>
              <View style={FilterPopupStyles.inputBox}>
                <TextInput
                  style={FilterPopupStyles.input}
                  placeholder="请输入"
                  value={searchFormInfo.relename}
                  onChangeText={val => setSearchFormInfo(prev => ({...prev, relename: val}))}
                />
              </View>
            </View>

            <View style={FilterPopupStyles.item}>
              <Text style={FilterPopupStyles.label}>身份证号</Text>
              <View style={FilterPopupStyles.inputBox}>
                <TextInput
                  style={FilterPopupStyles.input}
                  placeholder="请输入"
                  value={searchFormInfo.cardid}
                  onChangeText={val => setSearchFormInfo(prev => ({...prev, cardid: val}))}
                />
                <TouchableOpacity onPress={() => openCardScan("身份证")}>
                  <Image
                    source={require("@/assets/images/common/icon-scan.png")}
                    style={FilterPopupStyles.iconScan}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={FilterPopupStyles.item}>
              <Text style={FilterPopupStyles.label}>银行卡号</Text>
              <View style={FilterPopupStyles.inputBox}>
                <TextInput
                  style={FilterPopupStyles.input}
                  keyboardType="number-pad"
                  placeholder="请输入"
                  value={searchFormInfo.bankAccount}
                  onChangeText={val => setSearchFormInfo(prev => ({...prev, bankAccount: val}))}
                />
                <TouchableOpacity onPress={() => openCardScan("银行卡")}>
                  <Image
                    source={require("@/assets/images/common/icon-scan.png")}
                    style={FilterPopupStyles.iconScan}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={FilterPopupStyles.item}>
              <Text style={FilterPopupStyles.label}>手机号码</Text>
              <View style={FilterPopupStyles.inputBox}>
                <TextInput
                  style={FilterPopupStyles.input}
                  placeholder="请输入"
                  value={searchFormInfo.mobile}
                  onChangeText={val => setSearchFormInfo(prev => ({...prev, mobile: val}))}
                />
              </View>
            </View>

            <View style={FilterPopupStyles.item}>
              <Text style={FilterPopupStyles.label}>合同编号</Text>
              <View style={FilterPopupStyles.inputBox}>
                <TextInput
                  style={FilterPopupStyles.input}
                  placeholder="请输入"
                  value={searchFormInfo.contractNo}
                  onChangeText={val => setSearchFormInfo(prev => ({...prev, contractNo: val}))}
                />
              </View>
            </View>

            <View style={FilterPopupStyles.item}>
              <Text style={FilterPopupStyles.label}>创建时间</Text>
              <View style={FilterPopupStyles.rangeBox}>
                <TouchableOpacity
                  style={FilterPopupStyles.rangeInput}
                  onPress={() => openDatePicker("start")}
                  activeOpacity={0.8}>
                  <Text style={[FilterPopupStyles.timeInput, !searchFormInfo.startTime && {color: "#666"}]}>
                    {searchFormInfo.startTime ? searchFormInfo.startTime : "请选择"}
                  </Text>
                </TouchableOpacity>
                <Text style={FilterPopupStyles.rangeDivider}>~</Text>
                <TouchableOpacity style={FilterPopupStyles.rangeInput} onPress={() => openDatePicker("end")} activeOpacity={0.8}>
                  <Text style={[FilterPopupStyles.timeInput, !searchFormInfo.endTime && {color: "#666"}]}>
                    {searchFormInfo.endTime ? searchFormInfo.endTime : "请选择"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={FilterPopupStyles.item}>
              <Text style={FilterPopupStyles.label}>亩数范围</Text>
              <View style={FilterPopupStyles.rangeBox}>
                <TouchableOpacity>
                  <TextInput
                    style={FilterPopupStyles.rangeInput}
                    value={searchFormInfo.beginActualNum}
                    onChangeText={val => setSearchFormInfo(prev => ({...prev, beginActualNum: val}))}
                    keyboardType="numeric"
                    placeholder="请输入"
                  />
                </TouchableOpacity>

                <Text style={FilterPopupStyles.rangeDivider}>~</Text>
                <TextInput
                  style={FilterPopupStyles.rangeInput}
                  value={searchFormInfo.endActualNum}
                  onChangeText={val => setSearchFormInfo(prev => ({...prev, endActualNum: val}))}
                  keyboardType="numeric"
                  placeholder="请输入"
                />
              </View>
            </View>

            <View style={FilterPopupStyles.item}>
              <Text style={FilterPopupStyles.label}>省市位置</Text>
              <TouchableOpacity style={FilterPopupStyles.inputBox} onPress={openProvincePopup}>
                <TextInput
                  style={FilterPopupStyles.input}
                  editable={false}
                  value={searchFormInfo.formattedAddress}
                  placeholder="请选择"
                />
                <Image
                  source={require("@/assets/images/common/icon-right.png")}
                  style={FilterPopupStyles.iconRight}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            <View style={FilterPopupStyles.item}>
              <Text style={FilterPopupStyles.label}>地块位置</Text>
              <View style={FilterPopupStyles.inputBox}>
                <TextInput
                  style={FilterPopupStyles.input}
                  placeholder="请输入"
                  value={searchFormInfo.detailaddress}
                  onChangeText={val => setSearchFormInfo(prev => ({...prev, detailaddress: val}))}
                />
              </View>
            </View>
          </ScrollView>

          <View style={FilterPopupStyles.bottomBtn}>
            <TouchableOpacity style={[FilterPopupStyles.btn, FilterPopupStyles.reset]} onPress={clickReset}>
              <Text style={FilterPopupStyles.btnTextReset}>重置</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[FilterPopupStyles.btn, FilterPopupStyles.query]} onPress={clickQuery}>
              <Text style={FilterPopupStyles.btnTextQuery}>查询</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 省市位置选择器 */}
      {showProvincePopup && (
        <ProvincePicker
          visible={showProvincePopup}
          onClose={closeProvince}
          onConfirm={closeProvince}
          location={{
            province: searchFormInfo.province,
            city: searchFormInfo.city,
            district: searchFormInfo.district,
            township: searchFormInfo.township,
          }}
        />
      )}

      {/* 创建时间选择器 */}
      <LeaseTimePicker
        visible={isShowTimePicker}
        onClose={() => setIsShowTimePicker(false)}
        onConfirm={time => closeDatePicker(time)}
      />
    </View>
  );
};

export default ContractFilterPopup;
