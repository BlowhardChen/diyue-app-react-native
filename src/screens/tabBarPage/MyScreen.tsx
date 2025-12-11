// 我的
import React, {useState, useCallback} from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ImageBackground,
  Platform,
  TextInput,
  Modal,
} from "react-native";
import {useNavigation, useFocusEffect} from "@react-navigation/native";
import {MyScreenStyles} from "./styles/MyScreen";
import {StackNavigationProp} from "@react-navigation/stack";
import {getUserInfo} from "@/services/account";
import useImagePicker from "@/hooks/useImagePicker";
import PermissionPopup from "@/components/common/PermissionPopup";
import {useCameraPermission} from "react-native-vision-camera";
import {useOCR} from "@/utils/uploadImg";
import {getToken} from "@/utils/tokenUtils";
import CustomLoading from "@/components/common/CustomLoading";
import {showCustomToast} from "@/components/common/CustomToast";

interface UserInfo {
  acreageNum: number;
  agrimensorAcreageNum: number;
  attestationStatus: "1" | "0";
  avatar: string;
  cancelNum: number;
  cardid: string;
  finishNum: number;
  obligationNum: number;
  relename: string;
  servicesNum: number;
  userId: number;
  userName: string;
  workAreaNum: number;
}

interface OrderItem {
  iconUrl: any;
  iconName: string;
  type: string;
  badge: number;
}

interface MangeItem {
  iconUrl: any;
  iconName: string;
  url: string;
}

type RootStackParamList = {
  Main: undefined;
  AccountSetting: undefined;
  PersonalInfo: undefined;
  HostedOrder: {type?: string};
};

const MyScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [userInfo, setUserInfo] = useState<any>({} as UserInfo);
  const [ordersList, setOrdersList] = useState<OrderItem[]>([]);
  const STATUS_BAR_HEIGHT = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0;
  const [isShowAuthPopup, setIsShowAuthPopup] = useState(false);
  const [popupForm, setPopupForm] = useState({
    name: "",
    cardid: "",
  });
  const [isShowPicker, setIsShowPicker] = useState(false);
  const {pickImageFromCamera, pickImageFromLibrary} = useImagePicker();
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const {hasPermission, requestPermission} = useCameraPermission();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const {uploadImg, loading} = useOCR();

  const mangeList: MangeItem[] = [
    {iconUrl: require("@/assets/images/my/icon-contract.png"), iconName: "合同管理", url: "ContractList"},
    {iconUrl: require("@/assets/images/my/icon-team.png"), iconName: "团队管理", url: "TeamManage"},
    {iconUrl: require("@/assets/images/my/icon-kf.png"), iconName: "客服电话", url: ""},
    {iconUrl: require("@/assets/images/my/icon-land.png"), iconName: "我的地块", url: "MyLand"},
    {
      iconUrl: require("@/assets/images/my/icon-account.png"),
      iconName: "我的账户",
      url: "MyAccount",
    },
    {
      iconUrl: require("@/assets/images/my/icon-user.png"),
      iconName: "农户信息",
      url: "FarmInfo",
    },
  ];

  const fetchUserInfo = async () => {
    try {
      const {data} = await getUserInfo();
      console.log("data", data);
      setUserInfo(data);
      setOrdersList([
        {iconUrl: require("@/assets/images/my/icon-pay.png"), iconName: "待付款", type: "1", badge: 1},
        {iconUrl: require("@/assets/images/my/icon-people.png"), iconName: "待服务", type: "2", badge: 99},
        {iconUrl: require("@/assets/images/my/icon-success.png"), iconName: "已完成", type: "3", badge: 133},
        {iconUrl: require("@/assets/images/my/icon-cancel.png"), iconName: "已取消", type: "4", badge: 44},
      ]);
    } catch (err) {
      console.warn("获取失败", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserInfo();
    }, []),
  );

  // 设置
  const handleSetting = () => {
    navigation.navigate("AccountSetting");
  };

  // 个人信息
  const viewPersonInfo = () => {
    navigation.navigate("PersonalInfo");
  };

  // 认证
  const oepnAuth = () => {
    if (userInfo?.attestationStatus === "1") return;
    setIsShowAuthPopup(true);
  };

  // 认证输入
  const handleInputChange = (field: string, value: string) => {
    setPopupForm(prev => ({...prev, [field]: value}));
  };

  // 扫描身份证
  const scanCard = () => {
    if (hasPermission) {
      setIsShowPicker(true);
    } else {
      setShowPermissionPopup(true);
    }
  };

  // 同意开启相机权限
  const handleAcceptPermission = async () => {
    setShowPermissionPopup(false);
    const granted = await requestPermission();
    if (granted) {
      setPermissionGranted(true);
      setIsShowPicker(true);
    }
  };

  // 拒绝开启相机权限
  const handleRejectPermission = () => {
    setShowPermissionPopup(false);
    setPermissionGranted(false);
    showCustomToast("error", "相机权限未开启");
  };

  // 处理选择
  const handlePick = async (type: "camera" | "library") => {
    try {
      let result;
      if (type === "camera") {
        result = await pickImageFromCamera();
      } else {
        result = await pickImageFromLibrary();
      }

      if (result?.uri) {
        handleFile(result.uri);
      }
    } catch (err) {
    } finally {
      setIsShowPicker(false);
    }
  };

  // 上传图片
  const handleFile = async (filePath: string) => {
    const token = await getToken();
    const result = await uploadImg(filePath, token as string, "1");
    if (result.success) {
      setPopupForm({name: result.ocrInfo.name, cardid: result.ocrInfo.cardid});
    }
  };

  // 认证取消
  const cancelAuth = () => {
    setIsShowAuthPopup(false);
    setPopupForm({name: "", cardid: ""});
  };

  // 立即认证
  const confirmAuth = () => {
    if (popupForm.name && popupForm.cardid) {
      cancelAuth();
    }
  };

  // 查看更多订单
  const viewMoreOrder = () => {
    navigation.navigate("HostedOrder", {});
  };
  2;

  // 订单类别
  const handleOrder = (item: OrderItem) => {
    navigation.navigate("HostedOrder", {type: item.type});
  };

  // 管理类别
  const handleManage = (item: MangeItem) => {};

  return (
    <View style={MyScreenStyles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground source={require("@/assets/images/my/my-bg.png")} style={MyScreenStyles.topBg}>
        <TouchableOpacity style={MyScreenStyles.topIcon} onPress={handleSetting}>
          <Image source={require("@/assets/images/my/icon-setting.png")} style={MyScreenStyles.iconImg} />
        </TouchableOpacity>
        {/* 占位高度，避免内容上移 */}
        <View style={{height: STATUS_BAR_HEIGHT}} />
        <View style={MyScreenStyles.userInfoRow}>
          <TouchableOpacity onPress={viewPersonInfo} style={MyScreenStyles.avatarContainer}>
            <Image
              source={userInfo?.avatar ? {uri: userInfo.avatar} : require("@/assets/images/my/icon-avatar.png")}
              style={MyScreenStyles.avatar}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <View style={MyScreenStyles.msgContainer}>
            <Text style={MyScreenStyles.name}>{userInfo?.nickName ?? "张三"}</Text>
            <View style={MyScreenStyles.phoneAuthRow}>
              <View style={MyScreenStyles.phoneRow}>
                <Image source={require("@/assets/images/my/icon-phone.png")} style={MyScreenStyles.phoneIcon} />
                <Text style={MyScreenStyles.phoneText}>{userInfo?.userName ?? "未知"}</Text>
              </View>
              <TouchableOpacity
                style={[
                  MyScreenStyles.authBtn,
                  userInfo?.attestationStatus === "1" ? MyScreenStyles.authDone : MyScreenStyles.authPending,
                ]}
                onPress={oepnAuth}>
                <Text style={userInfo?.attestationStatus === "1" ? MyScreenStyles.authDoneText : MyScreenStyles.authPendingText}>
                  {userInfo?.attestationStatus === "1" ? "已认证" : "未认证"}
                </Text>
                <Image
                  source={
                    userInfo?.attestationStatus === "1"
                      ? require("@/assets/images/my/icon-right-green.png")
                      : require("@/assets/images/my/icon-right-red.png")
                  }
                  style={MyScreenStyles.authIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* 亩数信息 */}
        <View style={MyScreenStyles.dataRow}>
          {[
            {
              num: userInfo.agrimensorAcreageNum ?? 0,
              label: "测量面积(亩)",
            },
            {num: userInfo.acreageNum ?? 0, label: "管理面积(亩)"},
            {num: userInfo.workAreaNum ?? 0, label: "作业面积(亩)"},
          ].map((d, i) => (
            <View key={i} style={MyScreenStyles.dataItem}>
              <Text style={MyScreenStyles.dataNum}>{d.num}</Text>
              <Text style={MyScreenStyles.dataLabel}>{d.label}</Text>
            </View>
          ))}
        </View>
      </ImageBackground>

      {/* 托管订单 */}
      <View style={MyScreenStyles.hostedOrdersBox}>
        <View style={MyScreenStyles.hostedOrdersTop}>
          <Text style={MyScreenStyles.orderTitle}>托管订单</Text>
          <TouchableOpacity style={MyScreenStyles.orderMore} onPress={viewMoreOrder}>
            <Text style={MyScreenStyles.orderMoreText}>查看更多</Text>
            <Image source={require("@/assets/images/my/icon-right.png")} style={MyScreenStyles.iconSmall} />
          </TouchableOpacity>
        </View>
        {/* 托管订单类型 */}
        <FlatList
          data={ordersList}
          horizontal
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={MyScreenStyles.orderList}
          renderItem={({item}) => (
            <TouchableOpacity onPress={() => handleOrder(item)} style={MyScreenStyles.orderItem}>
              <View style={MyScreenStyles.ordersItemIcon}>
                <Image source={item.iconUrl} style={MyScreenStyles.orderIcon} />

                {item.badge > 0 && (
                  <View style={[MyScreenStyles.badgeContainer, item.badge > 99 && MyScreenStyles.largeBadge]}>
                    <Text style={MyScreenStyles.badgeText}>{item.badge > 99 ? "99+" : item.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={MyScreenStyles.orderName}>{item.iconName}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* 管理功能列表 */}
      <View style={MyScreenStyles.manageList}>
        {mangeList.map((item, i) => (
          <TouchableOpacity key={i} style={MyScreenStyles.mangeItem} onPress={() => handleManage(item)}>
            <Image source={item.iconUrl} style={MyScreenStyles.mangeIcon} />
            <Text style={MyScreenStyles.mangeText}>{item.iconName}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 认证弹窗 */}
      {isShowAuthPopup && (
        <View style={MyScreenStyles.popupBox}>
          <View style={MyScreenStyles.popupContent}>
            <ImageBackground
              source={require("@/assets/images/my/auth-dialog-bg.png")}
              style={[MyScreenStyles.popupContentMain, MyScreenStyles.popupTopRadius]}>
              <View style={MyScreenStyles.popupContentTop}>
                <Text style={MyScreenStyles.title}>实名认证</Text>
                <Text style={MyScreenStyles.msg}>为方便绑定相关地块信息，请尽快完成实名认证</Text>
              </View>

              <View style={MyScreenStyles.authFrom}>
                <View>
                  <Text style={MyScreenStyles.label}>真实姓名</Text>
                  <View style={MyScreenStyles.popupInput}>
                    <TextInput
                      style={MyScreenStyles.input}
                      placeholder="请输入或者扫描身份证"
                      value={popupForm.name}
                      onChangeText={text => handleInputChange("name", text)}
                      placeholderTextColor="#999"
                    />
                    <TouchableOpacity style={MyScreenStyles.popupImg} onPress={scanCard}>
                      <Image source={require("@/assets/images/common/icon-scan.png")} style={MyScreenStyles.scanIcon} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{marginTop: 24}}>
                  <Text style={MyScreenStyles.label}>身份证号</Text>
                  <View style={MyScreenStyles.popupInput}>
                    <TextInput
                      style={MyScreenStyles.input}
                      placeholder="请输入或者扫描身份证"
                      value={popupForm.cardid}
                      onChangeText={text => handleInputChange("cardid", text)}
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                    />
                    <TouchableOpacity style={MyScreenStyles.popupImg} onPress={scanCard}>
                      <Image source={require("@/assets/images/common/icon-scan.png")} style={MyScreenStyles.scanIcon} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ImageBackground>

            <View style={MyScreenStyles.divider}></View>

            <View style={MyScreenStyles.popupBottom}>
              <TouchableOpacity style={MyScreenStyles.btnLeft} onPress={cancelAuth}>
                <Text style={MyScreenStyles.btnLeftText}>以后再说</Text>
              </TouchableOpacity>

              <View style={MyScreenStyles.cross}></View>

              <TouchableOpacity style={MyScreenStyles.btnRight} onPress={confirmAuth}>
                <Text
                  style={[
                    MyScreenStyles.btnRightText,
                    popupForm.name && popupForm.cardid ? MyScreenStyles.activeBtnText : MyScreenStyles.inactiveBtnText,
                  ]}>
                  立即认证
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* 图片选择弹窗 */}
      <Modal visible={isShowPicker} animationType="slide" transparent onRequestClose={() => setIsShowPicker(false)}>
        <View style={{flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)"}}>
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              paddingBottom: 20,
            }}>
            <TouchableOpacity onPress={() => handlePick("camera")} style={{padding: 16}}>
              <Text style={{textAlign: "center", fontSize: 16}}>拍照</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePick("library")} style={{padding: 16}}>
              <Text style={{textAlign: "center", fontSize: 16}}>从相册选择</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsShowPicker(false)} style={{padding: 16}}>
              <Text style={{textAlign: "center", fontSize: 16, color: "red"}}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 权限弹窗 */}
      <PermissionPopup
        visible={showPermissionPopup}
        onAccept={handleAcceptPermission}
        onReject={handleRejectPermission}
        title={"开启相机权限"}
        message={"开启相机权限将用于识别用户身份信息"}
      />

      {/* loading */}
      <CustomLoading visible={loading} text="图片识别中..." />
    </View>
  );
};

export default MyScreen;
