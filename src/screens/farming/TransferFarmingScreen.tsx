// 转移农事
import {View, Text, TouchableOpacity, ScrollView, TextInput, Image} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import CustomStatusBar from "@/components/common/CustomStatusBar";
import {TransferFarmingScreenStyles} from "./styles/TransferFarmingScreen";
import {useEffect, useState} from "react";
import {showCustomToast} from "@/components/common/CustomToast";
import {LandListData} from "@/types/land";
import {userStore} from "@/stores/userStore";
import {farmingDetailInfo, farmingScienceLandList, transferFarming} from "@/services/farming";
import {updateStore} from "@/stores/updateStore";
import {Global} from "@/styles/global";

type AllocateFarmingStackParamList = {
  SelectLand: {
    type: string;
    lands: LandListData[];
    landRequest: () => Promise<LandListData[]>;
    onSelectLandResult: (result: LandListData[]) => void;
  };
};

const TransferFarmingScreen = ({route}: {route: {params: {farmingId: string}}}) => {
  const navigation = useNavigation<StackNavigationProp<AllocateFarmingStackParamList>>();
  const [isFarmParComplete, setIsFarmParComplete] = useState(false);
  const [farmingLands, setFarmingLands] = useState<LandListData[]>([]);
  const [isShowPopup, setIsShowPopup] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [newOperatorAccount, setNewOperatorAccount] = useState("");
  const [selectedLand, setSelectedLand] = useState<LandListData[]>([]);
  const [farmingInfo, setFarmingInfo] = useState<any>(null);

  useEffect(() => {
    getFarmingDetailData();
    getUserFarmingLands();
  }, []);

  // 监听表单完整性，更新保存按钮状态
  useEffect(() => {
    const isComplete = !!selectedLand && !!selectedOperator;
    setIsFarmParComplete(isComplete);
    console.log("userInfo", userStore.userInfo);
  }, [selectedLand, selectedOperator]);

  // 选择地块
  const handleLandSelect = () => {
    navigation.navigate("SelectLand", {
      type: "farming",
      lands: selectedLand.length > 0 ? selectedLand : farmingLands,
      landRequest: (): Promise<LandListData[]> => farmingScienceLandList({id: route.params.farmingId}).then(res => res.data),
      onSelectLandResult: result => {
        handleSelectLandResult(result);
      },
    });
  };

  // 处理选择地块结果
  const handleSelectLandResult = (result: LandListData[]) => {
    setSelectedLand(result);
  };

  // 计算地块亩数之和
  const calculateTotalArea = (land: LandListData[]) => {
    return Number(land.reduce((total, item) => total + Number(item.actualAcreNum || 0), 0).toFixed(2));
  };

  // 保存分配农事
  const saveAllocateFarm = async () => {
    setIsShowPopup(true);
  };

  // 取消操作
  const popupCancel = () => {
    setIsShowPopup(false);
  };

  // 确认操作
  const popupConfirm = async () => {
    try {
      const submitParams = {
        farmingJoinTypeId: route.params.farmingId,
        assignMobile: newOperatorAccount.trim(),
        lands: selectedLand.map(land => ({landId: land.id})),
      };
      await transferFarming(submitParams);
      setIsShowPopup(false);
      showCustomToast("success", "转移农事成功");
      updateStore.setIsUpdateFarming(true);
      navigation.goBack();
    } catch (error: any) {
      showCustomToast("error", error.data.message ? error.data.message : "转移农事失败，请稍后重试");
      setIsShowPopup(false);
    }
  };
  // 获取农事详情数据
  const getFarmingDetailData = async () => {
    try {
      const {data} = await farmingDetailInfo({farmingJoinTypeId: route.params.farmingId, type: "1"});
      setFarmingInfo(data);
    } catch (error) {
      showCustomToast("error", "获取农事详情失败，请稍后重试");
    }
  };

  // 获取当前用户地块数据
  const getUserFarmingLands = async () => {
    try {
      const {data} = await farmingScienceLandList({id: route.params.farmingId});
      setFarmingLands(data || []);
    } catch (error: any) {
      showCustomToast("error", error.data.message ?? "获取地块数据失败，请重试");
    }
  };

  return (
    <View style={TransferFarmingScreenStyles.container}>
      {/* 自定义状态栏 */}
      <CustomStatusBar navTitle={"转移农事"} onBack={() => navigation.goBack()} />

      {/* 主内容区 */}
      <ScrollView style={TransferFarmingScreenStyles.content} showsVerticalScrollIndicator={false}>
        {/* 选择要转移的机手账号 */}
        <View style={TransferFarmingScreenStyles.sectionContainer}>
          <View style={TransferFarmingScreenStyles.sectionHeader}>
            <Text style={TransferFarmingScreenStyles.sectionTitle}>选择要转移的机手账号</Text>
            <View style={TransferFarmingScreenStyles.farmingTypeTag}>
              <Text style={TransferFarmingScreenStyles.farmingTypeText}>{farmingInfo?.farmingTypeName}</Text>
            </View>
          </View>

          {/* 机手列表 */}
          {farmingInfo?.userVos.map((user: {mobile: string; userName: string}) => (
            <TouchableOpacity
              key={user.mobile}
              style={[
                TransferFarmingScreenStyles.operatorItem,
                selectedOperator === user.mobile && TransferFarmingScreenStyles.operatorItemActive,
              ]}
              onPress={() => setSelectedOperator(user.mobile)}>
              <Text
                style={[
                  TransferFarmingScreenStyles.operatorText,
                  selectedOperator === user.mobile && TransferFarmingScreenStyles.operatorTextActive,
                ]}>
                {user.userName} {user.mobile}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 选择地块 */}
        <View style={TransferFarmingScreenStyles.sectionContainer}>
          <Text style={[TransferFarmingScreenStyles.sectionTitle, {marginBottom: 16}]}>选择地块</Text>
          {selectedLand.length > 0 ? (
            <TouchableOpacity style={TransferFarmingScreenStyles.landSelectBtn} onPress={handleLandSelect}>
              <View style={TransferFarmingScreenStyles.selectLandTextContnet}>
                {selectedLand.length > 0 && (
                  <Text style={TransferFarmingScreenStyles.selectLandText}>
                    <Text>共</Text>
                    <Text style={{color: "#08AE3C"}}>{selectedLand.length}</Text>
                    <Text>个地块，共</Text>
                    <Text style={{color: "#08AE3C"}}>{calculateTotalArea(selectedLand)}</Text>
                    <Text>亩</Text>
                  </Text>
                )}
              </View>
              <Image
                source={require("@/assets/images/common/icon-right-gray.png")}
                style={TransferFarmingScreenStyles.editIconImg}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={TransferFarmingScreenStyles.landSelectBtn} onPress={handleLandSelect}>
              <Text style={TransferFarmingScreenStyles.selectLandText}>
                <Text style={{color: "#999"}}>点击选择</Text>
              </Text>
              <Image
                source={require("@/assets/images/common/icon-right-gray.png")}
                style={TransferFarmingScreenStyles.editIconImg}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* 输入新机手账号 */}
        <View style={TransferFarmingScreenStyles.sectionContainer}>
          <Text style={[TransferFarmingScreenStyles.sectionTitle, {marginBottom: 16}]}>输入新机手账号</Text>
          <TextInput
            style={TransferFarmingScreenStyles.input}
            value={newOperatorAccount}
            onChangeText={setNewOperatorAccount}
            placeholder="点击填写"
            placeholderTextColor="#999"
          />
        </View>
      </ScrollView>

      {/* 保存按钮（保持绝对定位） */}
      <View style={TransferFarmingScreenStyles.btnSave}>
        <TouchableOpacity
          style={[TransferFarmingScreenStyles.btn, !isFarmParComplete && TransferFarmingScreenStyles.btnDisabled]}
          onPress={saveAllocateFarm}
          disabled={!isFarmParComplete}>
          <Text style={TransferFarmingScreenStyles.btnText}>保存</Text>
        </TouchableOpacity>
      </View>

      {isShowPopup && (
        <View style={TransferFarmingScreenStyles.mask}>
          <View style={TransferFarmingScreenStyles.popupBox}>
            <View style={TransferFarmingScreenStyles.popupContent}>
              <View style={TransferFarmingScreenStyles.popupContentTop}>
                <View style={TransferFarmingScreenStyles.title}>
                  <Text style={TransferFarmingScreenStyles.titleText}>提示</Text>
                </View>
              </View>
              <View style={TransferFarmingScreenStyles.msg}>
                <Text style={TransferFarmingScreenStyles.msgText}>
                  本次转移<Text style={{color: Global.colors.primary}}>{selectedLand.length}</Text>个地块，共
                  <Text style={{color: Global.colors.primary}}>{calculateTotalArea(selectedLand)}亩</Text>
                  是否继续转移？
                </Text>
              </View>

              <View style={TransferFarmingScreenStyles.divider} />

              <View style={TransferFarmingScreenStyles.popupBottom}>
                <TouchableOpacity style={TransferFarmingScreenStyles.btnLeft} onPress={popupCancel}>
                  <Text style={TransferFarmingScreenStyles.leftText}>取消</Text>
                </TouchableOpacity>
                {/* 按钮之间的分割线 */}
                <View style={TransferFarmingScreenStyles.cross} />
                <TouchableOpacity style={TransferFarmingScreenStyles.btnRight} onPress={popupConfirm}>
                  <Text style={TransferFarmingScreenStyles.rightText}>转移</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default TransferFarmingScreen;
