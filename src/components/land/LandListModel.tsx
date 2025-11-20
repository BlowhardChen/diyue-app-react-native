import React, {useEffect, useState, useCallback} from "react";
import {View, Text, TextInput, Image, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator} from "react-native";
import {getLandListData} from "@/services/land";
import LandListItem from "@/components/land/LandListItem";
import FilterPopup from "@/components/land/FilterPopup";
import {LandListModelStyles} from "@/components/land/styles/LandListModel";
import {LandListData} from "@/types/land";
import {updateStore} from "@/stores/updateStore";

const {height: screenHeight} = Dimensions.get("window");

const LandListModel = () => {
  const [searchWord, setSearchWord] = useState<string>("");
  const [LandListInfo, setLandListInfo] = useState<LandListData[] | []>([]);
  const [areaAmount, setAreaAmount] = useState<number>(0);
  const [showQueryPopup, setShowQueryPopup] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // 获取地块列表
  const getLandInfoList = useCallback(async (params: any = {}) => {
    try {
      setLoading(true);
      setAreaAmount(0);
      const {data} = await getLandListData({quitStatus: 0, ...params});
      setLandListInfo(data || []);

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

  // 打开筛选弹窗
  const openScreenPopup = () => setShowQueryPopup(true);

  // 关闭筛选弹窗
  const closeQueryPopup = () => setShowQueryPopup(false);

  // 筛选地块
  const queryLand = (query: any) => {
    const params = {...query};
    delete params.formattedAddress;
    setShowQueryPopup(false);
    getLandInfoList(params);
  };

  useEffect(() => {
    getLandInfoList({});
  }, [getLandInfoList, updateStore.isUpdateLand, updateStore.isUpdateLandDetail]);

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
      {LandListInfo.length > 0 && (
        <View style={LandListModelStyles.landMsg}>
          <Text style={{fontWeight: "500"}}>
            共<Text style={LandListModelStyles.highlight}>{LandListInfo.length}</Text>个地块，累计
            <Text style={LandListModelStyles.highlight}>{areaAmount.toFixed(2)}</Text>亩
          </Text>
        </View>
      )}

      <View style={LandListModelStyles.landList}>
        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" style={{marginTop: 20}} />
        ) : (
          <ScrollView style={[LandListModelStyles.landListBox, {height: screenHeight - 238 / 2}]}>
            {LandListInfo.map((item: any) => (
              <LandListItem key={item.id} landMsgItem={item} />
            ))}
          </ScrollView>
        )}
      </View>

      {/* 筛选弹窗 */}
      {showQueryPopup && <FilterPopup onClose={closeQueryPopup} onQuery={queryLand} />}
    </View>
  );
};

export default LandListModel;
