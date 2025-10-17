// 省市区三级联动选择器

import React, {useState, useEffect} from "react";
import {View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions} from "react-native";
import {WheelPicker} from "react-native-wheel-picker-android";
import {allCityList} from "@/assets/ts/cityList";
import {Global} from "@/styles/global";

const {width} = Dimensions.get("window");

interface DistrictItem {
  code: string;
  value: string;
}

interface CityItem {
  code: string;
  value: string;
  children: DistrictItem[];
}

interface ProvinceItem {
  code: string;
  value: string;
  children: CityItem[];
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (location: {province: string; city: string; district: string}) => void;
}

const ProvinceCityDistrictPicker: React.FC<Props> = ({visible, onClose, onConfirm}) => {
  const provinces: ProvinceItem[] = allCityList.map(item => item);
  const [provinceIndex, setProvinceIndex] = useState(0);
  const [cityIndex, setCityIndex] = useState(0);
  const [districtIndex, setDistrictIndex] = useState(0);

  const [cityList, setCityList] = useState<CityItem[]>(provinces[0].children);
  const [districtList, setDistrictList] = useState<DistrictItem[]>(provinces[0].children[0].children);

  // 更新城市列表
  const updateCityList = (pIndex: number) => {
    const cities = provinces[pIndex].children;
    setCityList(cities);
    setCityIndex(0);
    setDistrictList(cities[0].children);
    setDistrictIndex(0);
  };

  // 更新区县列表
  const updateDistrictList = (cIndex: number) => {
    const districts = cityList[cIndex]?.children || [];
    setDistrictList(districts);
    setDistrictIndex(0);
  };

  // 省份变化 → 更新城市和区
  useEffect(() => {
    updateCityList(provinceIndex);
  }, [provinceIndex]);

  // 城市变化 → 更新区
  useEffect(() => {
    updateDistrictList(cityIndex);
  }, [cityIndex]);

  // 确认选择
  const handleConfirm = () => {
    const selectedProvince = provinces[provinceIndex];
    const selectedCity = cityList[cityIndex];
    const selectedDistrict = districtList[districtIndex];
    onConfirm({
      province: selectedProvince?.value,
      city: selectedCity?.value,
      district: selectedDistrict?.value,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} />
        <View style={styles.pickerContent}>
          {/* 顶部按钮 */}
          <View style={styles.pickerTop}>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.pickerButton, styles.cancel]}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={[styles.pickerButton, styles.confirm]}>确认</Text>
            </TouchableOpacity>
          </View>

          {/* 三级滚轮 */}
          <View style={styles.wheelContainer}>
            {/* 省份 */}
            <WheelPicker
              data={provinces.map(item => item.value)}
              selectedItem={provinceIndex}
              onItemSelected={index => setProvinceIndex(index)}
              itemTextSize={20}
              selectedItemTextSize={20}
              itemTextFontFamily="System"
              selectedItemTextFontFamily="System"
              selectedItemTextColor="#333333"
              indicatorColor="#eeeeee"
              isCyclic={false}
              style={styles.wheel}
            />
            {/* 城市 */}
            <WheelPicker
              data={cityList.map(item => item.value)}
              selectedItem={cityIndex}
              onItemSelected={index => setCityIndex(index)}
              itemTextSize={20}
              selectedItemTextSize={20}
              itemTextFontFamily="System"
              selectedItemTextFontFamily="System"
              selectedItemTextColor="#333333"
              indicatorColor="#eeeeee"
              isCyclic={false}
              style={styles.wheel}
            />
            {/* 区县 */}
            <WheelPicker
              data={districtList.map(item => item.value)}
              selectedItem={districtIndex}
              onItemSelected={index => setDistrictIndex(index)}
              itemTextSize={20}
              selectedItemTextSize={20}
              itemTextFontFamily="System"
              selectedItemTextFontFamily="System"
              selectedItemTextColor="#333333"
              indicatorColor="#eeeeee"
              isCyclic={false}
              style={styles.wheel}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ProvinceCityDistrictPicker;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  overlayTouchable: {
    flex: 1,
  },
  pickerContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  pickerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  pickerButton: {
    fontSize: 16,
  },
  cancel: {
    color: "#999",
  },
  confirm: {
    color: Global.colors.primary,
    fontWeight: "500",
  },
  wheelContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 10,
  },
  wheel: {
    width: width / 3 - 10,
    height: 150,
  },
});
