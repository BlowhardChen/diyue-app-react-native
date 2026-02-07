import React, {useState, useEffect} from "react";
import {View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet, Dimensions} from "react-native";
import ProvincePicker from "@/components/common/ProvinceCityDistrictPicker";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {FilterPopupStyles} from "@/components/land/styles/FilterPopup";
import {useNavigation, useRoute} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import {saveTargetRoute} from "@/utils/navigationUtils";

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
  superRouteName?: string;
  onClose: () => void;
  onQuery: (data: SearchFormInfo) => void;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;

const FilterPopup: React.FC<Props> = ({onClose, onQuery, height = SCREEN_HEIGHT - 111, marginTop = 0, superRouteName = ""}) => {
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const [showProvincePopup, setShowProvincePopup] = useState(false);
  const [isCheckedType, setIsCheckedType] = useState(0);
  const navigation = useNavigation<StackNavigationProp<StackParamList>>();
  const [searchFormInfo, setSearchFormInfo] = useState<SearchFormInfo>({
    province: "",
    city: "",
    district: "",
    township: "",
    formattedAddress: "",
    detailaddress: "",
    relename: "",
    mobile: "",
    cardid: "",
    bankAccount: "",
    landType: "1",
    beginActualNum: "",
    endActualNum: "",
  });

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

  // 选择地块类型
  const selectContract = (index: number) => {
    setIsCheckedType(index);
    setSearchFormInfo(prev => ({...prev, landType: index === 1 ? "2" : "1"}));
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
    saveTargetRoute(route.name, ["Main", superRouteName], {...route.params});
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
      mobile: "",
      cardid: "",
      bankAccount: "",
      landType: "1",
      beginActualNum: "",
      endActualNum: "",
    });
    setIsCheckedType(0);
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
              <Text style={FilterPopupStyles.label}>地块类型</Text>
              <View style={FilterPopupStyles.radioRow}>
                {["单个地块", "合并地块"].map((item, index) => (
                  <TouchableOpacity key={index} style={FilterPopupStyles.radioItem} onPress={() => selectContract(index)}>
                    <Image
                      source={
                        isCheckedType === index
                          ? require("@/assets/images/common/icon-checked.png")
                          : require("@/assets/images/common/icon-check.png")
                      }
                      style={FilterPopupStyles.radioIcon}
                      resizeMode="contain"
                    />
                    <Text style={FilterPopupStyles.radioText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={FilterPopupStyles.item}>
              <Text style={FilterPopupStyles.label}>亩数范围</Text>
              <View style={FilterPopupStyles.rangeBox}>
                <TextInput
                  style={FilterPopupStyles.rangeInput}
                  value={searchFormInfo.beginActualNum}
                  onChangeText={val => setSearchFormInfo(prev => ({...prev, beginActualNum: val}))}
                  keyboardType="numeric"
                  placeholder="最小"
                />
                <Text style={FilterPopupStyles.rangeDivider}>~</Text>
                <TextInput
                  style={FilterPopupStyles.rangeInput}
                  value={searchFormInfo.endActualNum}
                  onChangeText={val => setSearchFormInfo(prev => ({...prev, endActualNum: val}))}
                  keyboardType="numeric"
                  placeholder="最大"
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
    </View>
  );
};

export default FilterPopup;
