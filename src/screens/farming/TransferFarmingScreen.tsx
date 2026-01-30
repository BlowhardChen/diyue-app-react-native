// 转移农事
import {View, Text, TouchableOpacity, ScrollView, TextInput, Image, Pressable} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import CustomStatusBar from "@/components/common/CustomStatusBar";
import {TransferFarmingScreenStyles} from "./styles/TransferFarmingScreen";
import {useEffect, useState} from "react";
import {showCustomToast} from "@/components/common/CustomToast";
import {LandListData} from "@/types/land";

type AllocateFarmingStackParamList = {
  SelectLand: {type: string; onSelectLandResult: (result: LandListData[]) => void};
};

const TransferFarmingScreen = ({route}: {route: {params: {farmingId: string}}}) => {
  const navigation = useNavigation<StackNavigationProp<AllocateFarmingStackParamList>>();
  const [isFarmParComplete, setIsFarmParComplete] = useState(false);
  const [farmingLands, setFarmingLands] = useState<LandListData[]>([]);
  const [isShowPopup, setIsShowPopup] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [newOperatorAccount, setNewOperatorAccount] = useState("");
  const [selectedLand, setSelectedLand] = useState("点击选择");

  useEffect(() => {}, []);

  // 监听表单完整性，更新保存按钮状态
  useEffect(() => {
    const isComplete = !!selectedLand && !!selectedOperator;
    setIsFarmParComplete(isComplete);
  }, [selectedLand, selectedOperator]);

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
              <Text style={TransferFarmingScreenStyles.farmingTypeText}>犁地</Text>
            </View>
          </View>

          {/* 机手列表 */}
          <TouchableOpacity
            style={[
              TransferFarmingScreenStyles.operatorItem,
              selectedOperator === "张三 15686970097" && TransferFarmingScreenStyles.operatorItemActive,
            ]}
            onPress={() => setSelectedOperator("张三 15686970097")}>
            <Text style={TransferFarmingScreenStyles.operatorText}>张三 15686970097</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              TransferFarmingScreenStyles.operatorItem,
              selectedOperator === "李四 15686970097" && TransferFarmingScreenStyles.operatorItemActive,
            ]}
            onPress={() => setSelectedOperator("李四 15686970097")}>
            <Text style={TransferFarmingScreenStyles.operatorText}>李四 15686970097</Text>
          </TouchableOpacity>
        </View>

        {/* 选择地块 */}
        <View style={TransferFarmingScreenStyles.sectionContainer}>
          <Text style={[TransferFarmingScreenStyles.sectionTitle, {marginBottom: 16}]}>选择地块</Text>
          {farmingLands.length > 0 ? (
            <TouchableOpacity style={TransferFarmingScreenStyles.landSelectBtn} onPress={handleLandSelect}>
              <View style={TransferFarmingScreenStyles.selectLandTextContnet}>
                {farmingLands.length > 0 && (
                  <Text style={TransferFarmingScreenStyles.selectLandText}>
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
                {/* 显示消息文本，应用默认样式和自定义样式 */}
                <Text style={TransferFarmingScreenStyles.msgText}>
                  剩余<Text style={{color: "#FF3D3B"}}>20个</Text>地块，共<Text style={{color: "#FF3D3B"}}>200亩</Text>
                  待分配，是否继续保存？
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
                  <Text style={TransferFarmingScreenStyles.rightText}>保存</Text>
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
