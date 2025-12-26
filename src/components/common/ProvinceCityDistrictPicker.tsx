// 省市区镇四级联动选择器
import React, {useState, useEffect} from "react";
import {View, Text, TouchableOpacity, Modal, Image, StyleSheet, Dimensions, ScrollView, FlatList} from "react-native";
import allCityList from "@/assets/ts/pcas-code.json";
import {Global} from "@/styles/global";

interface TownItem {
  code: string;
  value: string;
}

interface DistrictItem {
  code: string;
  value: string;
  children: TownItem[];
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

interface LocationType {
  province: string;
  city: string;
  district: string;
  township: string;
}

interface Props {
  visible: boolean;
  location?: LocationType;
  onClose: () => void;
  onConfirm: (location: LocationType) => void;
}

const ProvinceCityDistrictTownPicker: React.FC<Props> = ({visible, location, onClose, onConfirm}) => {
  const provinces: ProvinceItem[] = allCityList;
  const [selectedProvince, setSelectedProvince] = useState<ProvinceItem | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityItem | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictItem | null>(null);
  const [selectedTown, setSelectedTown] = useState<TownItem | null>(null);
  const [currentLevel, setCurrentLevel] = useState<"province" | "city" | "district" | "township">("province");

  useEffect(() => {
    if (!location) {
      setSelectedProvince(null);
      setSelectedCity(null);
      setSelectedDistrict(null);
      setSelectedTown(null);
      setCurrentLevel("province");
      return;
    }

    let targetProvince: ProvinceItem | null = null;
    if (location.province) {
      targetProvince = provinces.find(item => item.value === location.province) ?? null;
    }

    if (!targetProvince) {
      setSelectedProvince(null);
      setSelectedCity(null);
      setSelectedDistrict(null);
      setSelectedTown(null);
      setCurrentLevel("province");
      return;
    }

    let targetCity: CityItem | null = null;
    if (location.city && targetProvince) {
      targetCity = targetProvince.children.find(item => item.value === location.city) ?? null;
    }

    let targetDistrict: DistrictItem | null = null;
    if (location.district && targetCity) {
      targetDistrict = targetCity.children.find(item => item.value === location.district) ?? null;
    }

    let targetTown: TownItem | null = null;
    if (location.township && targetDistrict) {
      targetTown = targetDistrict.children.find(item => item.value === location.township) ?? null;
    }

    setSelectedProvince(targetProvince);
    setSelectedCity(targetCity);
    setSelectedDistrict(targetDistrict);
    setSelectedTown(targetTown);

    if (targetTown) {
      setCurrentLevel("township");
    } else if (targetDistrict) {
      setCurrentLevel("district");
    } else if (targetCity) {
      setCurrentLevel("city");
    } else {
      setCurrentLevel("province");
    }
  }, [location, provinces]);

  // 选中省份
  const handleSelectProvince = (item: ProvinceItem) => {
    setSelectedProvince(item);
    setSelectedCity(null);
    setSelectedDistrict(null);
    setSelectedTown(null);
    setCurrentLevel("city");
  };

  // 选中城市
  const handleSelectCity = (item: CityItem) => {
    setSelectedCity(item);
    setSelectedDistrict(null);
    setSelectedTown(null);
    setCurrentLevel("district");
  };

  // 选中区县
  const handleSelectDistrict = (item: DistrictItem) => {
    setSelectedDistrict(item);
    setSelectedTown(null);
    setCurrentLevel("township");
  };

  // 选中镇
  const handleSelectTown = (item: TownItem) => {
    setSelectedTown(item);
  };

  // 确认选择
  const handleConfirm = () => {
    if (!selectedProvince) return;

    const confirmData: LocationType = {
      province: selectedProvince.value,
      city: selectedCity?.value || "",
      district: selectedDistrict?.value || "",
      township: selectedTown?.value || "",
    };

    onConfirm(confirmData);
  };

  // 渲染列表项
  const renderItem = ({item}: {item: any}) => {
    const isSelected =
      (currentLevel === "province" && selectedProvince?.code === item.code) ||
      (currentLevel === "city" && selectedCity?.code === item.code) ||
      (currentLevel === "district" && selectedDistrict?.code === item.code) ||
      (currentLevel === "township" && selectedTown?.code === item.code);

    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => {
          if (currentLevel === "province") handleSelectProvince(item);
          else if (currentLevel === "city") handleSelectCity(item);
          else if (currentLevel === "district") handleSelectDistrict(item);
          else if (currentLevel === "township") handleSelectTown(item);
        }}>
        <Text style={isSelected ? styles.listItemTextSelected : styles.listItemText}>{item.value}</Text>
        {isSelected && (
          <View>
            <Image source={require("@/assets/images/common/icon-city-checked.png")} style={styles.checkMark} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // 获取当前层级的列表数据
  const getData = () => {
    if (currentLevel === "province") return provinces;
    if (currentLevel === "city") return selectedProvince?.children || [];
    if (currentLevel === "district") return selectedCity?.children || [];
    if (currentLevel === "township") return selectedDistrict?.children || [];
    return [];
  };

  // 获取当前层级标题
  const getTitle = () => {
    if (currentLevel === "province") return "请选择省份";
    if (currentLevel === "city") return "请选择城市";
    if (currentLevel === "district") return "请选择区县";
    if (currentLevel === "township") return "请选择镇/街道";
    return "请选择区域";
  };

  // 构建已选择的区域列表（过滤空值）
  const selectedRegions = [selectedProvince?.value, selectedCity?.value, selectedDistrict?.value, selectedTown?.value].filter(
    Boolean,
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {/* 遮罩层关闭 */}
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} />

        {/* 选择器主体 */}
        <View style={styles.pickerContent}>
          {/* 顶部操作栏 */}
          <View style={styles.pickerTop}>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.pickerButton, styles.cancel]}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{getTitle()}</Text>
            <TouchableOpacity onPress={handleConfirm} disabled={!selectedProvince}>
              <Text style={[styles.pickerButton, styles.confirm, !selectedProvince && styles.confirmDisabled]}>确认</Text>
            </TouchableOpacity>
          </View>

          {/* 已选择区域 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectedContent}
            contentContainerStyle={styles.selectedContentInner}>
            {selectedRegions.length === 0 ? (
              <View style={styles.selectTextContent}>
                <Text style={styles.selectText}>请选择</Text>
                <View style={styles.underline}></View>
              </View>
            ) : (
              <>
                {/* 渲染已选择的每一级 */}
                {selectedProvince && (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedProvince(null);
                      setSelectedCity(null);
                      setSelectedDistrict(null);
                      setSelectedTown(null);
                      setCurrentLevel("province");
                    }}>
                    <Text style={styles.selectedText}>{selectedProvince.value}</Text>
                  </TouchableOpacity>
                )}

                {selectedCity && (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedCity(null);
                      setSelectedDistrict(null);
                      setSelectedTown(null);
                      setCurrentLevel("city");
                    }}>
                    <Text style={styles.selectedText}>{selectedCity.value}</Text>
                  </TouchableOpacity>
                )}

                {selectedDistrict && (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedDistrict(null);
                      setSelectedTown(null);
                      setCurrentLevel("district");
                    }}>
                    <Text style={styles.selectedText}>{selectedDistrict.value}</Text>
                  </TouchableOpacity>
                )}

                {selectedTown && <Text style={styles.selectedText}>{selectedTown.value}</Text>}

                {selectedRegions.length < 4 && (
                  <View style={styles.selectTextContent}>
                    <Text style={styles.selectText}>请选择</Text>
                    <View style={styles.underline}></View>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* 列表选择区域 */}
          <View style={styles.wheelContainer}>
            <FlatList
              data={getData()}
              keyExtractor={item => item.code}
              renderItem={renderItem}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => <Text style={styles.emptyText}>暂无数据</Text>}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ProvinceCityDistrictTownPicker;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  overlayTouchable: {
    flex: 1,
  },
  pickerContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingBottom: 10,
  },
  pickerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerButton: {
    fontSize: 16,
  },
  cancel: {
    color: "#666666",
  },
  confirm: {
    color: Global.colors.primary,
    fontWeight: "500",
  },
  confirmDisabled: {
    color: "#999999",
    fontWeight: "normal",
  },
  title: {
    fontSize: 17,
    fontWeight: "500",
    color: "#000",
  },
  selectedContent: {
    width: "100%",
    height: 40,
    backgroundColor: "#F5F8FA",
  },
  selectedContentInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 4,
  },
  placeholderText: {
    fontSize: 18,
    color: "#999",
    fontWeight: 400,
  },
  selectedText: {
    fontSize: 18,
    fontWeight: 400,
    color: "#333",
    marginRight: 8,
  },
  separator: {
    color: "#666",
    marginHorizontal: 2,
  },
  selectTextContent: {
    position: "relative",
  },
  selectText: {
    fontSize: 18,
    color: Global.colors.primary,
    fontWeight: "400",
  },
  underline: {
    position: "absolute",
    bottom: -7,
    left: 0,
    width: "80%",
    transform: [{translateX: "15%"}],
    height: 2,
    backgroundColor: Global.colors.primary,
  },
  wheelContainer: {
    justifyContent: "center",
    paddingTop: 5,
    height: 450,
    backgroundColor: "#fff",
  },
  list: {
    height: 350,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#999",
    marginTop: 20,
  },
  listItem: {
    height: 50,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  listItemText: {
    fontSize: 18,
    color: "#000",
    fontWeight: 400,
  },
  listItemTextSelected: {
    fontSize: 18,
    color: Global.colors.primary,
    fontWeight: "500",
  },
  checkMark: {
    width: 26,
    height: 26,
  },
});
