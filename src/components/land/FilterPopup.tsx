import React, {useState, useEffect} from "react";
import {View, Text, TextInput, TouchableOpacity, Image, ScrollView, Dimensions, StyleSheet, Modal} from "react-native";
import ProvincePicker from "@/components/common/ProvinceCityDistrictPicker";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {FilterPopupStyles} from "@/components/land/styles/FilterPopup";

const {height: screenHeight} = Dimensions.get("window");

interface LocationType {
  province: string;
  city: string;
  district: string;
}

interface SearchFormInfo {
  [key: string]: string;
}

interface Props {
  onClose: () => void;
  onQuery: (data: SearchFormInfo) => void;
  initialData: Partial<SearchFormInfo>;
  onOpenCardScan: (type: string) => void;
}

const FilterPopup: React.FC<Props> = ({onClose, onQuery, initialData, onOpenCardScan}) => {
  const insets = useSafeAreaInsets();
  const [showProvincePopup, setShowProvincePopup] = useState(false);
  const [isCheckedType, setIsCheckedType] = useState(0);

  const [searchFormInfo, setSearchFormInfo] = useState<SearchFormInfo>({
    province: "",
    city: "",
    district: "",
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

  // 关键：监听initialData变化并更新表单
  useEffect(() => {
    console.log("FilterPopup接收的初始数据：", initialData); // 调试用
    if (Object.keys(initialData).length > 0) {
      setSearchFormInfo(prev => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  // 银行卡号格式化
  useEffect(() => {
    const formatted = searchFormInfo.bankAccount
      .replace(/\s/g, "")
      .replace(/(\d{4})/g, "$1 ")
      .trim();
    if (formatted !== searchFormInfo.bankAccount) {
      setSearchFormInfo(prev => ({...prev, bankAccount: formatted}));
    }
  }, [searchFormInfo.bankAccount]);

  // 其他方法保持不变
  const selectContract = (index: number) => {
    setIsCheckedType(index);
    setSearchFormInfo(prev => ({
      ...prev,
      landType: index === 1 ? "2" : "1",
    }));
  };

  const openProvincePopup = () => setShowProvincePopup(true);

  const closeProvince = (location?: LocationType) => {
    setShowProvincePopup(false);
    if (location) {
      setSearchFormInfo(prev => ({
        ...prev,
        province: location.province,
        city: location.city,
        district: location.district,
        formattedAddress: `${location.province}/${location.city}/${location.district}`,
      }));
    }
  };

  const openCardScan = (type: string) => {
    onOpenCardScan(type);
  };

  const clickReset = () => {
    setSearchFormInfo({
      province: "",
      city: "",
      district: "",
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

  const clickQuery = () => {
    onQuery(searchFormInfo);
  };

  return (
    <Modal transparent animationType="slide">
      <View style={FilterPopupStyles.overlay}>
        <TouchableOpacity style={[FilterPopupStyles.overlayTouch, StyleSheet.absoluteFill]} onPress={onClose} activeOpacity={1} />

        <View style={FilterPopupStyles.popupContainer}>
          <View style={[FilterPopupStyles.popupBox, {marginTop: insets.top}]}>
            <ScrollView style={[FilterPopupStyles.condition, {height: screenHeight - 168}]} showsVerticalScrollIndicator={false}>
              {/* 表单内容保持不变 */}
              {/* 省市位置 */}
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

              {/* 地块位置 */}
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

              {/* 农户姓名 */}
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

              {/* 身份证号 */}
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

              {/* 银行卡号 */}
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

              {/* 其他表单项保持不变 */}
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

        {showProvincePopup && <ProvincePicker visible={showProvincePopup} onClose={closeProvince} onConfirm={closeProvince} />}
      </View>
    </Modal>
  );
};

export default FilterPopup;
