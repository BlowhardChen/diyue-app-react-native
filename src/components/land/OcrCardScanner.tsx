import React, {useEffect, useRef, useState} from "react";
import {View, Text, Image, TouchableOpacity, Vibration} from "react-native";
import {Camera, useCameraPermission} from "react-native-vision-camera";
import {RouteProp, useNavigation, useRoute} from "@react-navigation/native";
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
import {launchImageLibrary} from "react-native-image-picker";

type OcrCardScannerParams = {
  type: "身份证" | "银行卡";
  onOcrResult: (result: {type: string; data: any}) => void;
};

type OcrCardScannerRouteProp = RouteProp<Record<string, OcrCardScannerParams>, string>;

const OcrCardScanner = () => {
  const navigation = useNavigation();
  const route = useRoute<OcrCardScannerRouteProp>();
  const {type, onOcrResult} = route.params;
  const {hasPermission, requestPermission} = useCameraPermission();
  const camera = useRef<Camera>(null);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const {uploadImg, loading} = useOCR();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    (async () => {
      if (!hasPermission) {
        setShowPermissionPopup(true);
      } else {
        setPermissionGranted(true);
      }
    })();
  }, [hasPermission]);

  // 返回上一页（不传递参数时）
  const handleGoBack = () => {
    navigation.goBack();
  };

  // 接受权限
  const handleAcceptPermission = async () => {
    setShowPermissionPopup(false);
    const granted = await requestPermission();
    if (granted) {
      setPermissionGranted(true);
    } else {
      showCustomToast("error", "未获得相机权限");
    }
  };

  // 拒绝权限
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

  // 拍照并上传图片
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

  // 上传图片并处理结果
  const uploadOCRImg = async (filePath: string) => {
    const token = (await getToken()) as string;
    const {success, ocrInfo} = await uploadImg(filePath, token, type === "身份证" ? "1" : "2");
    if (success) {
      onOcrResult({type, data: ocrInfo});
      navigation.goBack();
    } else {
      setShowPopup(true);
    }
  };

  // 打开相册
  const openPhotoAlbum = async () => {};

  // 手动输入
  const handleManualInput = () => {
    setShowPopup(false);
    handleGoBack();
  };

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
