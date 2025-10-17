import React, {useEffect, useState, useCallback} from "react";
import {View, Text, TextInput, Image, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator} from "react-native";
import {getLandListData} from "@/services/land";
import LandListItem from "@/components/land/LandListItem";
import FilterPopup from "@/components/land/FilterPopup";
import {LandListModelStyles} from "@/components/land/styles/LandListModel";
import {LandListData} from "@/types/land";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import {useFocusEffect} from "@react-navigation/native"; // 关键：使用useFocusEffect

const {height: screenHeight} = Dimensions.get("window");

type StackParamList = {
  OcrCardScanner: {type: string};
};

const LandListModel = () => {
  const [searchWord, setSearchWord] = useState<string>("");
  const [landMsgListInfo, setLandMsgListInfo] = useState<LandListData[] | []>([]);
  const [areaAmount, setAreaAmount] = useState<number>(0);
  const [showQueryPopup, setShowQueryPopup] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<StackNavigationProp<StackParamList>>();
  const [ocrResult, setOcrResult] = useState<any>(null);

  // 关键：使用useFocusEffect监听页面聚焦
  useFocusEffect(
    useCallback(() => {
      // 获取当前路由状态中的OCR结果
      const state = navigation.getState();
      // 找到OcrCardScanner页面的参数
      const ocrRoute = state.routes.find(route => route.name === "OcrCardScanner");
      const result = ocrRoute?.params?.ocrResult;

      if (result) {
        console.log("LandListModel接收的OCR结果：", result); // 调试用
        setOcrResult(result);
        // 延迟打开弹窗，确保状态更新
        setTimeout(() => {
          setShowQueryPopup(true);
        }, 100);
        // 清除参数，避免重复处理
        if (ocrRoute) {
          navigation.setParams({ocrResult: null});
        }
      }
    }, [navigation]),
  );

  // 打开扫描页面
  const handleOpenCardScan = (type: string) => {
    setShowQueryPopup(false);
    setTimeout(() => {
      navigation.navigate("OcrCardScanner", {type});
    }, 300);
  };

  // 传递OCR结果到FilterPopup
  const getFilterFormInitialData = () => {
    if (ocrResult) {
      const initialData = {
        // 从日志看，身份证识别结果中的身份证号字段是idNumber，姓名是name
        ...(ocrResult.type === "身份证"
          ? {
              cardid: ocrResult.data?.idNumber || "",
              relename: ocrResult.data?.name || "",
            }
          : {
              bankAccount: ocrResult.data?.bankNumber || "",
              relename: ocrResult.data?.name || "",
            }),
      };
      setOcrResult(null);
      return initialData;
    }
    return {};
  };

  // 其他逻辑（获取列表、查询等）保持不变
  const getLandMassList = useCallback(async (params: any = {}) => {
    try {
      setLoading(true);
      setAreaAmount(0);
      const {data} = await getLandListData({quitStatus: 0, ...params});
      setLandMsgListInfo(data || []);

      let total = 0;
      if (data && data.length) {
        data.forEach((item: LandListData) => {
          total += item.actualAcreNum || 0;
        });
      }
      setAreaAmount(total);
    } catch (error: any) {
      console.log("请求失败:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const openScreenPopup = () => setShowQueryPopup(true);
  const closeQueryPopup = () => setShowQueryPopup(false);

  const queryLand = (query: any) => {
    const params = {...query};
    delete params.formattedAddress;
    setShowQueryPopup(false);
    getLandMassList(params);
  };

  useEffect(() => {
    getLandMassList({});
  }, [getLandMassList]);

  return (
    <View style={LandListModelStyles.container}>
      {/* 顶部搜索栏 */}
      <View style={LandListModelStyles.topSearch}>
        <View style={LandListModelStyles.search}>
          <Image source={require("@/assets/images/home/icon-search.png")} style={LandListModelStyles.searchIcon} />
          <TextInput
            placeholder="姓名/手机号/身份证号等"
            value={searchWord}
            onChangeText={setSearchWord}
            onSubmitEditing={() => queryLand({keyword: searchWord})}
            onBlur={() => queryLand({keyword: searchWord})}
            style={LandListModelStyles.searchInput}
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity style={LandListModelStyles.screen} onPress={openScreenPopup}>
          <Image source={require("@/assets/images/home/icon-screen.png")} style={LandListModelStyles.screenIcon} />
          <Text style={LandListModelStyles.screenText}>筛选</Text>
        </TouchableOpacity>
      </View>

      {/* 地块统计、列表等保持不变 */}
      {landMsgListInfo.length > 0 && (
        <View style={LandListModelStyles.landMsg}>
          <Text style={{fontWeight: "500"}}>
            共<Text style={LandListModelStyles.highlight}>{landMsgListInfo.length}</Text>个地块，累计
            <Text style={LandListModelStyles.highlight}>{areaAmount.toFixed(2)}</Text>亩
          </Text>
        </View>
      )}

      <View style={LandListModelStyles.landList}>
        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" style={{marginTop: 20}} />
        ) : (
          <ScrollView style={[LandListModelStyles.landListBox, {height: screenHeight - 238 / 2}]}>
            {landMsgListInfo.map((item: any) => (
              <LandListItem key={item.id} landMsgItem={item} />
            ))}
          </ScrollView>
        )}
      </View>

      {/* 筛选弹窗 */}
      {showQueryPopup && (
        <FilterPopup
          onClose={closeQueryPopup}
          onQuery={queryLand}
          initialData={getFilterFormInitialData()}
          onOpenCardScan={handleOpenCardScan}
        />
      )}
    </View>
  );
};

export default LandListModel;
