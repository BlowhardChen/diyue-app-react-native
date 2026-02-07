// 添加设备
import React, {useEffect, useRef, useState} from "react";
import {View, Text, Image, TouchableOpacity, Vibration} from "react-native";
import {Camera, useCameraPermission} from "react-native-vision-camera";
import {RouteProp, useNavigation, useRoute} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import {AddDeviceScreenStyles} from "./styles/AddDeviceScreen";
import {SafeAreaView} from "react-native-safe-area-context";
import PermissionPopup from "@/components/common/PermissionPopup";
import CameraPlaceholder from "@/components/device/CameraPlaceholder";
import FullscreenCamera from "@/components/device/FullscreenCamera";
import {showCustomToast} from "@/components/common/CustomToast";
import {getToken} from "@/utils/tokenUtils";
import {getDeviceInfo} from "@/services/device";
import CustomLoading from "@/components/common/CustomLoading";
import {useOCR} from "@/utils/uploadImg";

type AddDeviceStackParamList = {
  CurrentConnect: {imei: string; farmingJoinTypeId?: string; taskType?: string};
  ManualInput: {farmingJoinTypeId?: string; taskType?: string} | undefined;
  BluetoothConnect: undefined;
};

type AddDeviceParams = {
  farmingJoinTypeId: string;
  taskType?: string;
};

type AddDeviceRouteProp = RouteProp<Record<string, AddDeviceParams>, string>;

const AddDeviceScreen = () => {
  const navigation = useNavigation<StackNavigationProp<AddDeviceStackParamList>>();
  const route = useRoute<AddDeviceRouteProp>();
  const {hasPermission, requestPermission} = useCameraPermission();
  const camera = useRef<Camera>(null);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const {uploadImg, loading} = useOCR();

  useEffect(() => {
    // 初始化时检查权限
    (async () => {
      if (!hasPermission) {
        setShowPermissionPopup(true);
      } else {
        setPermissionGranted(true);
      }
    })();
  }, [hasPermission]);

  // 返回
  const handleGoBack = () => {
    navigation.goBack();
  };

  // 同意开启相机权限
  const handleAcceptPermission = async () => {
    setShowPermissionPopup(false);
    const granted = await requestPermission();
    if (granted) {
      setPermissionGranted(true);
    } else {
      showCustomToast("error", "未获得相机权限");
    }
  };

  // 拒绝开启相机权限
  const handleRejectPermission = () => {
    setShowPermissionPopup(false);
    setPermissionGranted(false);
  };

  // 渲染相机区域
  const renderCameraArea = () => {
    if (!permissionGranted) {
      return <View style={{flex: 1, backgroundColor: "#000"}} />;
    }
    return <FullscreenCamera cameraRef={camera} />;
  };

  // 手动输入
  const handleManualInput = () => {
    if (route.params?.farmingJoinTypeId) {
      navigation.navigate("ManualInput", {
        farmingJoinTypeId: route.params?.farmingJoinTypeId,
        taskType: route.params?.taskType || "1",
      });
    } else {
      navigation.navigate("ManualInput");
    }
  };

  // 拍照
  const snapshot = async () => {
    if (!hasPermission) {
      setShowPermissionPopup(true);
      return;
    }
    if (!camera.current || loading) return;
    try {
      Vibration.vibrate(100);
      const photo = await camera.current.takePhoto({flash: "off"});
      if (photo.path) {
        uploadOCRImg("file://" + photo.path);
      }
    } catch (e) {
      console.log("拍照失败", e);
    }
  };

  // 上传 OCR
  const uploadOCRImg = async (filePath: string) => {
    const token = (await getToken()) as string;
    const {success, ocrInfo} = await uploadImg(filePath, token as string, "4");
    if (success) {
      getDeviceBaseInfo(ocrInfo);
    }
  };

  // 查询设备信息
  const getDeviceBaseInfo = async (imei: string) => {
    try {
      const {data} = await getDeviceInfo(imei);
      if (route.params?.farmingJoinTypeId) {
        navigation.navigate("CurrentConnect", {
          imei: data.device.imei,
          farmingJoinTypeId: route.params?.farmingJoinTypeId,
          taskType: route.params?.taskType || "1",
        });
      } else {
        navigation.navigate("CurrentConnect", {imei: data.device.imei});
      }
    } catch (error) {
      showCustomToast("error", "RTK设备暂未添加，请联系管理员添加设备再扫码使用");
    }
  };

  return (
    <View style={AddDeviceScreenStyles.container}>
      {/* 相机区域（接收相同的 ref） */}
      {renderCameraArea()}
      {/* 顶部导航（只让内部元素可点，空白处透传） */}
      <SafeAreaView style={AddDeviceScreenStyles.headerOverlay} edges={["top"]} pointerEvents="box-none">
        <View style={AddDeviceScreenStyles.header} pointerEvents="auto">
          <TouchableOpacity
            style={AddDeviceScreenStyles.headerIcon}
            onPress={handleGoBack}
            testID="back-button"
            hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
            <Image
              style={AddDeviceScreenStyles.icon}
              source={require("@/assets/images/common/icon-back-white.png")}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={AddDeviceScreenStyles.headerTitle} pointerEvents="none">
            添加设备
          </Text>
          <View style={AddDeviceScreenStyles.headerIcon} pointerEvents="none" />
        </View>
      </SafeAreaView>

      {/* 扫描框装饰层（纯展示，不拦截触摸） */}
      <View style={AddDeviceScreenStyles.overlay} pointerEvents="none">
        <CameraPlaceholder />
      </View>

      {/* 底部操作区域*/}
      <View style={AddDeviceScreenStyles.bottomOverlay} pointerEvents="box-none">
        <Text style={AddDeviceScreenStyles.tips} pointerEvents="none">
          请开启设备后扫描二维码
        </Text>

        {/* 快门按钮：可点击 */}
        <TouchableOpacity style={[AddDeviceScreenStyles.button, AddDeviceScreenStyles.shot]} onPress={snapshot}>
          <Text style={AddDeviceScreenStyles.btnText}>点击识别二维码</Text>
        </TouchableOpacity>

        <View style={AddDeviceScreenStyles.buttonBottom} pointerEvents="box-none">
          <View style={AddDeviceScreenStyles.dividerRow} pointerEvents="none">
            <View style={AddDeviceScreenStyles.line} />
            <Text style={AddDeviceScreenStyles.text}>或</Text>
            <View style={AddDeviceScreenStyles.line} />
          </View>

          {/* 手动输入按钮：可点击 */}
          <TouchableOpacity style={[AddDeviceScreenStyles.button, AddDeviceScreenStyles.hand]} onPress={handleManualInput}>
            <Text style={AddDeviceScreenStyles.btnText}>手动输入</Text>
          </TouchableOpacity>

          {/* 蓝牙连接按钮：可点击 */}
          <TouchableOpacity
            style={[AddDeviceScreenStyles.button, AddDeviceScreenStyles.bluetooth]}
            onPress={() => navigation.navigate("BluetoothConnect")}>
            <Text style={AddDeviceScreenStyles.btnText}>蓝牙连接</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 权限弹窗 */}
      <PermissionPopup
        visible={showPermissionPopup}
        onAccept={handleAcceptPermission}
        onReject={handleRejectPermission}
        title={"开启相机权限"}
        message={"开启相机权限将用于识别设备IMEI码"}
      />

      {/* loading */}
      <CustomLoading visible={loading} text="图片识别中..." />
    </View>
  );
};

export default AddDeviceScreen;
