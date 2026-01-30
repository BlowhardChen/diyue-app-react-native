// 分配农事
import {View, Text, TouchableOpacity, ScrollView, TextInput, Image, Pressable} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import CustomStatusBar from "@/components/common/CustomStatusBar";
import {AllocateFarmingScreenStyles} from "./styles/AllocateFarmingScreen";
import {useEffect, useState} from "react";
import {showCustomToast} from "@/components/common/CustomToast";
import {LandListData} from "@/types/land";

type AllocateFarmingStackParamList = {
  SelectLand: {type: string; onSelectLandResult: (result: LandListData[]) => void};
};

const AllocateFarmingScreen = ({route}: {route: {params: {farmingId: string}}}) => {
  const navigation = useNavigation<StackNavigationProp<AllocateFarmingStackParamList>>();
  const [selectedLand, setSelectedLand] = useState<string>("");
  const [farmingOperAccount, setFarmingOperAccount] = useState<string>("");
  const [isFarmParComplete, setIsFarmParComplete] = useState(false);
  const [farmingLands, setFarmingLands] = useState<LandListData[]>([]);
  const [isShowPopup, setIsShowPopup] = useState(false);

  useEffect(() => {}, []);

  // 监听表单完整性，更新保存按钮状态
  useEffect(() => {
    const isComplete = !!selectedLand && !!farmingOperAccount;
    setIsFarmParComplete(isComplete);
  }, [selectedLand, farmingOperAccount]);

  // 选择地块
  const handleLandSelect = () => {
    navigation.navigate("SelectLand", {
      type: "farming",
      onSelectLandResult: result => {
        handleSelectLandResult(result);
      },
    });
  };

  // 处理选择地块结果
  const handleSelectLandResult = (result: LandListData[]) => {
    console.log("处理选择地块结果", result);
    const farmingLands = result;
    setFarmingLands(farmingLands);
    console.log("地块", farmingLands);
  };

  // 计算地块亩数之和
  const calculateTotalArea = (land: LandListData[]) => {
    return Number(land.reduce((total, item) => total + Number(item.actualAcreNum || 0), 0).toFixed(2));
  };

  // 保存分配农事
  const saveAllocateFarm = async () => {};

  // 取消操作
  const popupCancel = () => {
    setIsShowPopup(false);
  };

  // 确认操作
  const popupConfirm = async () => {
    try {
      //   await completeFarming(farmingInfo.id);
      setIsShowPopup(false);
    } catch (error) {}
  };

  return (
    <View style={AllocateFarmingScreenStyles.container}>
      {/* 自定义状态栏 */}
      <CustomStatusBar navTitle={"分配农事"} onBack={() => navigation.goBack()} />
      <View style={AllocateFarmingScreenStyles.popupTips}>
        <Text style={AllocateFarmingScreenStyles.popupTipsText}>
          剩余<Text style={AllocateFarmingScreenStyles.popupTipsActiveText}>20个</Text>地块，共
          <Text style={AllocateFarmingScreenStyles.popupTipsActiveText}>200亩</Text>待分配
        </Text>
      </View>

      {/* 主内容区 */}
      <ScrollView style={AllocateFarmingScreenStyles.content} showsVerticalScrollIndicator={false}>
        <View style={AllocateFarmingScreenStyles.sectionContainer}>
          <View style={AllocateFarmingScreenStyles.sectionHeader}>
            <Text style={AllocateFarmingScreenStyles.sectionTitle}>机手账号</Text>
            <View style={AllocateFarmingScreenStyles.farmingType}>
              <Text style={AllocateFarmingScreenStyles.farmingTypeText}>犁地</Text>
            </View>
          </View>
          <View style={AllocateFarmingScreenStyles.nameInputContainer}>
            <TextInput
              style={AllocateFarmingScreenStyles.nameInput}
              value={farmingOperAccount}
              onChangeText={setFarmingOperAccount}
              placeholder="请输入机手账号"
              placeholderTextColor="#999"
            />
          </View>
          <View style={{marginTop: 10}}>
            <View style={AllocateFarmingScreenStyles.sectionHeader}>
              <Text style={AllocateFarmingScreenStyles.sectionTitle}>选择地块</Text>
            </View>
            {farmingLands.length > 0 ? (
              <TouchableOpacity style={AllocateFarmingScreenStyles.landSelectBtn} onPress={handleLandSelect}>
                <View style={AllocateFarmingScreenStyles.selectLandTextContnet}>
                  {farmingLands.length > 0 && (
                    <Text style={AllocateFarmingScreenStyles.selectLandText}>
                      <Text>共</Text>
                      <Text style={{color: "#08AE3C"}}>{farmingLands.length}</Text>
                      <Text>个地块，共</Text>
                      <Text style={{color: "#08AE3C"}}>{calculateTotalArea(farmingLands)}</Text>
                      <Text>亩</Text>
                    </Text>
                  )}
                </View>
                <Image
                  source={require("@/assets/images/common/icon-right-gray.png")}
                  style={AllocateFarmingScreenStyles.editIconImg}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={AllocateFarmingScreenStyles.landSelectBtn} onPress={handleLandSelect}>
                <View style={AllocateFarmingScreenStyles.selectLandTextContnet}>
                  <Text style={AllocateFarmingScreenStyles.selectLandText}>
                    <Text>共</Text>
                    <Text style={{color: "#08AE3C"}}>{"60"}</Text>
                    <Text>个地块，共</Text>
                    <Text style={{color: "#08AE3C"}}>{"2000"}</Text>
                    <Text>亩</Text>
                  </Text>
                </View>
                <Image
                  source={require("@/assets/images/common/icon-right-gray.png")}
                  style={AllocateFarmingScreenStyles.editIconImg}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={AllocateFarmingScreenStyles.addAllocateFarmingContainer}>
          <TouchableOpacity style={AllocateFarmingScreenStyles.addAllocateFarming}>
            <Image
              source={require("@/assets/images/farming/icon-add.png")}
              style={AllocateFarmingScreenStyles.addAllocateFarmingImg}
            />
            <Text style={AllocateFarmingScreenStyles.addAllocateFarmingText}>添加手机账号</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 保存按钮（保持绝对定位） */}
      <View style={AllocateFarmingScreenStyles.btnSave}>
        <TouchableOpacity
          style={[AllocateFarmingScreenStyles.btn, !isFarmParComplete && AllocateFarmingScreenStyles.btnDisabled]}
          onPress={saveAllocateFarm}
          disabled={!isFarmParComplete}>
          <Text style={AllocateFarmingScreenStyles.btnText}>保存</Text>
        </TouchableOpacity>
      </View>

      {isShowPopup && (
        <View style={AllocateFarmingScreenStyles.mask}>
          <View style={AllocateFarmingScreenStyles.popupBox}>
            <View style={AllocateFarmingScreenStyles.popupContent}>
              <View style={AllocateFarmingScreenStyles.popupContentTop}>
                <View style={AllocateFarmingScreenStyles.title}>
                  <Text style={AllocateFarmingScreenStyles.titleText}>提示</Text>
                </View>
              </View>
              <View style={AllocateFarmingScreenStyles.msg}>
                {/* 显示消息文本，应用默认样式和自定义样式 */}
                <Text style={AllocateFarmingScreenStyles.msgText}>
                  剩余<Text style={{color: "#FF3D3B"}}>20个</Text>地块，共<Text style={{color: "#FF3D3B"}}>200亩</Text>
                  待分配，是否继续保存？
                </Text>
              </View>

              <View style={AllocateFarmingScreenStyles.divider} />

              <View style={AllocateFarmingScreenStyles.popupBottom}>
                <TouchableOpacity style={AllocateFarmingScreenStyles.btnLeft} onPress={popupCancel}>
                  <Text style={AllocateFarmingScreenStyles.leftText}>取消</Text>
                </TouchableOpacity>
                {/* 按钮之间的分割线 */}
                <View style={AllocateFarmingScreenStyles.cross} />
                <TouchableOpacity style={AllocateFarmingScreenStyles.btnRight} onPress={popupConfirm}>
                  <Text style={AllocateFarmingScreenStyles.rightText}>保存</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default AllocateFarmingScreen;
