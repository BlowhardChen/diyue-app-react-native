import React, {useEffect, useRef, useState} from "react";
import {View, Text, Image, TouchableOpacity, Vibration} from "react-native";
import {Camera, useCameraPermission} from "react-native-vision-camera";
import {useNavigation, useRoute} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import {OcrCardScannerStyles} from "../../screens/land/styles/OcrCardScanner";
import {SafeAreaView} from "react-native-safe-area-context";
import PermissionPopup from "@/components/common/PermissionPopup";
import OcrPlaceholder from "@/components/land/OcrPlaceholder";
import FullscreenCamera from "@/components/device/FullscreenCamera";
import {showCustomToast} from "@/components/common/CustomToast";
import {getToken} from "@/utils/tokenUtils";
import CustomLoading from "@/components/common/CustomLoading";
import {useOCR} from "@/utils/uploadImg";
import Popup from "../common/Popup";

// 定义路由参数类型（只关注接收的type）
type OcrCardScannerParams = {
  type: string;
};

const OcrCardScanner = () => {
  const navigation = useNavigation();
  const route = useRoute<{params: OcrCardScannerParams}>();
  const {type} = route.params; // 获取扫描类型（身份证/银行卡）

  // 其他状态保持不变
  const {hasPermission, requestPermission} = useCameraPermission();
  const camera = useRef<Camera>(null);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const {uploadImg, loading} = useOCR();
  const [showPopup, setShowPopup] = useState(false);

  // 权限处理逻辑保持不变
  useEffect(() => {
    (async () => {
      if (!hasPermission) {
        setShowPermissionPopup(true);
      } else {
        setPermissionGranted(true);
      }
    })();
  }, [hasPermission]);

  const handleGoBack = () => {
    navigation.goBack(); // 返回上一页（不传递参数时）
  };

  const handleAcceptPermission = async () => {
    setShowPermissionPopup(false);
    const granted = await requestPermission();
    if (granted) {
      setPermissionGranted(true);
    } else {
      showCustomToast("error", "未获得相机权限");
    }
  };

  const handleRejectPermission = () => {
    setShowPermissionPopup(false);
    setPermissionGranted(false);
  };

  const renderCameraArea = () => {
    if (!permissionGranted) {
      return <View style={{flex: 1, backgroundColor: "#000"}} />;
    }
    return <FullscreenCamera cameraRef={camera} />;
  };

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

  // 关键修复：使用goBack返回，并通过路由参数传递结果
  const uploadOCRImg = async (filePath: string) => {
    const token = (await getToken()) as string;
    const {success, ocrInfo} = await uploadImg(filePath, token, type === "身份证" ? "1" : "2");
    if (success) {
      console.log("识别成功，结果：", ocrInfo);
      // 获取上一页的路由名称（动态适配，避免硬编码）
      const state = navigation.getState();
      const previousRouteName = state.routes[state.index - 1]?.name;

      // 给上一页设置参数
      navigation.setParams({
        ocrResult: {
          type: type,
          data: ocrInfo,
        },
      });

      // 延迟返回，确保参数已设置
      setTimeout(() => {
        navigation.goBack();
      }, 100);
    } else {
      setShowPopup(true);
    }
  };

  const openPhotoAlbum = () => {
    // 打开相册逻辑
  };

  const handleManualInput = () => {
    setShowPopup(false);
    handleGoBack();
  };

  // 渲染部分保持不变
  return (
    <View style={OcrCardScannerStyles.container}>
      {renderCameraArea()}
      <SafeAreaView style={OcrCardScannerStyles.headerOverlay} edges={["top"]} pointerEvents="box-none">
        <View style={OcrCardScannerStyles.header} pointerEvents="auto">
          <TouchableOpacity
            style={OcrCardScannerStyles.headerIcon}
            onPress={handleGoBack}
            hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
            <Image
              style={OcrCardScannerStyles.icon}
              source={require("@/assets/images/common/icon-back-white.png")}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={OcrCardScannerStyles.headerTitle} pointerEvents="none">
            卡片识别
          </Text>
          <View style={OcrCardScannerStyles.headerIcon} pointerEvents="none" />
        </View>
      </SafeAreaView>

      <View style={OcrCardScannerStyles.overlay} pointerEvents="none">
        <OcrPlaceholder />
      </View>

      <View style={OcrCardScannerStyles.bottomOverlay} pointerEvents="box-none">
        <Text style={OcrCardScannerStyles.tips} pointerEvents="none">
          请将卡片边缘放入扫描框内以便扫描
        </Text>

        <TouchableOpacity style={[OcrCardScannerStyles.button, OcrCardScannerStyles.shot]} onPress={snapshot}>
          <Text style={OcrCardScannerStyles.btnText}>点击识别卡片</Text>
        </TouchableOpacity>
      </View>
      <View style={OcrCardScannerStyles.photoAlbum}>
        <TouchableOpacity style={OcrCardScannerStyles.photoAlbumItem} onPress={openPhotoAlbum}>
          <Image
            style={OcrCardScannerStyles.photoIcon}
            source={require("@/assets/images/device/icon-photo-album.png")}
            resizeMode="contain"
          />
          <Text style={OcrCardScannerStyles.photoAlbumText}>相册</Text>
        </TouchableOpacity>
      </View>

      <PermissionPopup
        visible={showPermissionPopup}
        onAccept={handleAcceptPermission}
        onReject={handleRejectPermission}
        title={"开启相机权限"}
        message={"开启相机权限将用于识别卡片信息"}
      />

      <CustomLoading visible={loading} text="卡片识别中..." />

      <Popup
        visible={showPopup}
        showTitle={false}
        msgText="卡片识别失败"
        leftBtnText="重新识别"
        rightBtnText="手动输入"
        onLeftBtn={() => setShowPopup(false)}
        onRightBtn={handleManualInput}
      />
    </View>
  );
};

export default OcrCardScanner;
