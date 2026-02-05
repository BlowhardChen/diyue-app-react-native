// 分配农事
import {View, Text, TouchableOpacity, ScrollView, TextInput, Image} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import CustomStatusBar from "@/components/common/CustomStatusBar";
import {AllocateFarmingScreenStyles} from "./styles/AllocateFarmingScreen";
import {useEffect, useState} from "react";
import {showCustomToast} from "@/components/common/CustomToast";
import {LandListData} from "@/types/land";
import {allocateFarming, farmingDetailInfo, unallocatedFarmingLandList} from "@/services/farming";
import {debounce} from "lodash";
import {updateStore} from "@/stores/updateStore";

type OperatorItem = {
  id: string;
  account: string;
  selectedLands: LandListData[];
};

type AllocateFarmingStackParamList = {
  SelectLand: {
    type: string;
    lands?: LandListData[];
    landRequest: () => Promise<LandListData[]>;
    onSelectLandResult: (result: LandListData[]) => void;
  };
};

const AllocateFarmingScreen = ({route}: {route: {params: {farmingId: string}}}) => {
  const navigation = useNavigation<StackNavigationProp<AllocateFarmingStackParamList>>();
  const [operators, setOperators] = useState<OperatorItem[]>([]);
  const [isFarmParComplete, setIsFarmParComplete] = useState(false);
  const [farmingLands, setFarmingLands] = useState<LandListData[]>([]);
  const [isShowPopup, setIsShowPopup] = useState(false);
  const [remainingLands, setRemainingLands] = useState<LandListData[]>([]);
  const [remainingArea, setRemainingArea] = useState<number>(0);
  const [farmingDetailData, setFarmingDetailData] = useState<any>({});
  const allAllocatedLands = operators.flatMap(item => item.selectedLands);

  useEffect(() => {
    getFarmingDetailData(route.params.farmingId);
  }, []);

  // 监听表单：所有模块有账号+有选中地块，且总选中地块不重复
  useEffect(() => {
    const allModuleComplete = operators.every(item => !!item.account.trim() && item.selectedLands.length > 0);
    const uniqueAllocatedLandIds = new Set(allAllocatedLands.map(land => land.id));
    const noRepeatAllocate = uniqueAllocatedLandIds.size === allAllocatedLands.length;
    const hasAtLeastOneOperator = operators.length > 0;

    setIsFarmParComplete(allModuleComplete && noRepeatAllocate && hasAtLeastOneOperator);
  }, [operators]);

  // 计算剩余未分配地块和面积
  useEffect(() => {
    const uniqueAllocatedLandIds = new Set(allAllocatedLands.map(land => land.id));
    const allocatedLands = farmingLands.filter(land => uniqueAllocatedLandIds.has(land.id));
    const unAllocatedLands = farmingLands.filter(land => !uniqueAllocatedLandIds.has(land.id));

    const totalArea = calculateTotalArea(farmingLands);
    const allocatedArea = calculateTotalArea(allocatedLands);
    const remainingAreaVal = Number((totalArea - allocatedArea).toFixed(2));

    setRemainingArea(remainingAreaVal);
    setRemainingLands(unAllocatedLands);
  }, [operators, farmingLands]);

  // 获取农事详情数据
  const getFarmingDetailData = async (id: string) => {
    try {
      const {data} = await farmingDetailInfo({farmingJoinTypeId: id, type: "1"});
      await getUnallocatedLands();
      setFarmingDetailData(data);
    } catch (error) {
      showCustomToast("error", "获取农事详情失败，请稍后重试");
    }
  };

  // 获取未分配农事地块
  const getUnallocatedLands = async () => {
    try {
      let initialOperator: OperatorItem;
      const {data} = await unallocatedFarmingLandList({id: route.params.farmingId});
      console.log("未分配农事地块", data);
      if (data.length) {
        initialOperator = {
          id: Date.now().toString(), // 用时间戳做唯一id
          account: "",
          selectedLands: data || [],
        };
        setFarmingLands(data || []);
      } else {
        initialOperator = {
          id: Date.now().toString(), // 用时间戳做唯一id
          account: "",
          selectedLands: farmingDetailData.lands || [],
        };
        setFarmingLands(farmingDetailData.lands || []);
      }
      setOperators([initialOperator]);
    } catch (error) {
      showCustomToast("error", "获取未分配农事地块失败，请稍后重试");
    }
  };

  // 选择地块
  const handleLandSelect = (operatorId: string) => {
    // 找到当前模块已选中的地块
    const currentOperator = operators.find(item => item.id === operatorId);
    if (!currentOperator) return;
    navigation.navigate("SelectLand", {
      type: "farming",
      lands: remainingLands.length > 0 ? remainingLands : farmingLands,
      landRequest: (): Promise<LandListData[]> => unallocatedFarmingLandList({id: route.params.farmingId}).then(res => res.data),
      onSelectLandResult: result => {
        handleSelectLandResult(operatorId, result);
      },
    });
  };

  // 处理选择地块结果
  const handleSelectLandResult = (operatorId: string, result: LandListData[]) => {
    setOperators(prev => prev.map(item => (item.id === operatorId ? {...item, selectedLands: result} : item)));
  };

  // 计算地块亩数之和
  const calculateTotalArea = (land: LandListData[]) => {
    return Number(land.reduce((total, item) => total + Number(item.actualAcreNum || 0), 0).toFixed(2));
  };

  // 添加机手账号模块
  const addOperatorAccount = debounce(() => {
    const newOperator: OperatorItem = {
      id: Date.now().toString(),
      account: "",
      selectedLands: [],
    };
    setOperators(prev => [...prev, newOperator]);
  }, 300);

  // 更新机手账号（指定模块）
  const updateOperatorAccount = (operatorId: string, account: string) => {
    setOperators(prev => prev.map(item => (item.id === operatorId ? {...item, account} : item)));
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
      const farmingJoinTypeLandParams = operators.map(item => ({
        farmingJoinTypeId: route.params.farmingId,
        assignMobile: item.account.trim(),
        lands: item.selectedLands.map(land => ({landId: land.id})),
      }));

      await allocateFarming({farmingJoinTypeLandParams});
      setIsShowPopup(false);
      showCustomToast("success", "分配农事成功");
      updateStore.triggerFarmingRefresh();
      navigation.goBack();
    } catch (error: any) {
      showCustomToast("error", error.data.message ? error.data.message : "分配农事失败，请稍后重试");
      setIsShowPopup(false);
    }
  };

  return (
    <View style={AllocateFarmingScreenStyles.container}>
      {/* 自定义状态栏 */}
      <CustomStatusBar navTitle={"分配农事"} onBack={() => navigation.goBack()} />
      {remainingLands?.length > 0 && (
        <View style={AllocateFarmingScreenStyles.popupTips}>
          <Text style={AllocateFarmingScreenStyles.popupTipsText}>
            剩余<Text style={AllocateFarmingScreenStyles.popupTipsActiveText}>{remainingLands?.length}个</Text>地块，共
            <Text style={AllocateFarmingScreenStyles.popupTipsActiveText}>{remainingArea}亩</Text>待分配
          </Text>
        </View>
      )}

      {/* 主内容区 */}
      <ScrollView style={AllocateFarmingScreenStyles.content} showsVerticalScrollIndicator={false}>
        {operators.map(operator => (
          <View key={operator.id} style={AllocateFarmingScreenStyles.sectionContainer}>
            <View style={AllocateFarmingScreenStyles.sectionHeader}>
              <Text style={AllocateFarmingScreenStyles.sectionTitle}>机手账号</Text>
              <View style={AllocateFarmingScreenStyles.farmingType}>
                <Text style={AllocateFarmingScreenStyles.farmingTypeText}>{farmingDetailData.farmingTypeName}</Text>
              </View>
            </View>
            <View style={AllocateFarmingScreenStyles.nameInputContainer}>
              <TextInput
                style={AllocateFarmingScreenStyles.nameInput}
                value={operator.account}
                onChangeText={val => updateOperatorAccount(operator.id, val)}
                placeholder="请输入机手账号"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
            <View style={{marginTop: 10}}>
              <View style={AllocateFarmingScreenStyles.sectionHeader}>
                <Text style={AllocateFarmingScreenStyles.sectionTitle}>选择地块</Text>
              </View>
              <TouchableOpacity style={AllocateFarmingScreenStyles.landSelectBtn} onPress={() => handleLandSelect(operator.id)}>
                <View style={AllocateFarmingScreenStyles.selectLandTextContnet}>
                  <Text style={AllocateFarmingScreenStyles.selectLandText}>
                    <Text>共</Text>
                    <Text style={{color: "#08AE3C"}}>{operator.selectedLands.length}</Text>
                    <Text>个地块，共</Text>
                    <Text style={{color: "#08AE3C"}}>{calculateTotalArea(operator.selectedLands)}</Text>
                    <Text>亩</Text>
                  </Text>
                </View>
                <Image
                  source={require("@/assets/images/common/icon-right-gray.png")}
                  style={AllocateFarmingScreenStyles.editIconImg}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* 添加机手账号按钮：所有地块分配完成后禁用（保持原有逻辑） */}
        <View style={AllocateFarmingScreenStyles.addAllocateFarmingContainer}>
          <TouchableOpacity
            style={[
              AllocateFarmingScreenStyles.addAllocateFarming,
              remainingLands?.length === 0 && AllocateFarmingScreenStyles.btnDisabled,
            ]}
            disabled={remainingLands?.length === 0}
            onPress={addOperatorAccount}>
            <Image
              source={require("@/assets/images/farming/icon-add.png")}
              style={AllocateFarmingScreenStyles.addAllocateFarmingImg}
            />
            <Text style={AllocateFarmingScreenStyles.addAllocateFarmingText}>添加机手账号</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 保存按钮：表单完整时可点击 */}
      <View style={AllocateFarmingScreenStyles.btnSave}>
        <TouchableOpacity
          style={[AllocateFarmingScreenStyles.btn, !isFarmParComplete && AllocateFarmingScreenStyles.btnDisabled]}
          onPress={saveAllocateFarm}
          disabled={!isFarmParComplete}>
          <Text style={AllocateFarmingScreenStyles.btnText}>保存</Text>
        </TouchableOpacity>
      </View>

      {/* 确认弹窗：适配多机手剩余地块提示 */}
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
                {remainingLands?.length > 0 ? (
                  <Text style={AllocateFarmingScreenStyles.msgText}>
                    剩余<Text style={{color: "#FF3D3B"}}>{remainingLands?.length}个</Text>地块，共
                    <Text style={{color: "#FF3D3B"}}>{remainingArea}亩</Text>
                    待分配，是否继续保存？
                  </Text>
                ) : (
                  <Text style={AllocateFarmingScreenStyles.msgText}>确认保存分配农事信息？</Text>
                )}
              </View>

              <View style={AllocateFarmingScreenStyles.divider} />

              <View style={AllocateFarmingScreenStyles.popupBottom}>
                <TouchableOpacity style={AllocateFarmingScreenStyles.btnLeft} onPress={popupCancel}>
                  <Text style={AllocateFarmingScreenStyles.leftText}>取消</Text>
                </TouchableOpacity>
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
