// 扫码添加自定义图层
import React, {useEffect, useRef, useState} from "react";
import {View, Text, Image, TouchableOpacity, Vibration} from "react-native";
import {Camera, useCameraPermission} from "react-native-vision-camera";
import {useNavigation} from "@react-navigation/native";
import {ScanAddCustomLayerStyles} from "./styles/ScanAddCustomLayerScreen";
import {SafeAreaView} from "react-native-safe-area-context";
import PermissionPopup from "@/components/common/PermissionPopup";
import OcrPlaceholder from "@/components/land/OcrPlaceholder";
import FullscreenCamera from "@/components/device/FullscreenCamera";
import {showCustomToast} from "@/components/common/CustomToast";
import {getToken} from "@/utils/tokenUtils";
import CustomLoading from "@/components/common/CustomLoading";
import {useOCR} from "@/utils/uploadImg";
import Popup from "../../components/common/Popup";
import {launchImageLibrary} from "react-native-image-picker";
import {debounce} from "lodash";
import {addCustomLayer} from "@/services/land";

const ScanAddCustomLayerScreen = () => {
  const navigation = useNavigation();
  const {hasPermission, requestPermission} = useCameraPermission();
  const camera = useRef<Camera>(null);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const {uploadImg, loading} = useOCR();
  const [showPopup, setShowPopup] = useState(false);
  const [ocrInfo, setOcrInfo] = useState<any | null>(null);

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
    const {success, ocrInfo} = await uploadImg(filePath, token, "4");
    setOcrInfo(ocrInfo);
    console.log("上传二维码结果", success, ocrInfo);
    if (success) {
      setShowPopup(true);
    } else {
      showCustomToast("error", "二维码识别失败");
    }
  };

  // 打开相册
  const openPhotoAlbum = async () => {
    launchImageLibrary({mediaType: "photo", quality: 0.8, includeBase64: false}, async response => {
      if (response.didCancel) return;
      if (response.assets) {
        uploadOCRImg(response.assets[0].uri as string);
      }
    });
  };

  // 添加自定义图层
  const handleAddCustomLayer = debounce(async () => {
    try {
      await addCustomLayer({name: ocrInfo?.name || "自定义图层", url: ocrInfo?.data || ""});
      setShowPopup(false);
      showCustomToast("success", "添加自定义图层成功");
      setTimeout(() => {
        handleGoBack();
      }, 100);
    } catch (error: any) {
      showCustomToast("error", error?.data?.message || "添加自定义图层失败");
    } finally {
      setShowPopup(false);
    }
  }, 300);

  return (
    <View style={ScanAddCustomLayerStyles.container}>
      {renderCameraArea()}
      <SafeAreaView style={ScanAddCustomLayerStyles.headerOverlay} edges={["top"]} pointerEvents="box-none">
        <View style={ScanAddCustomLayerStyles.header} pointerEvents="auto">
          <TouchableOpacity
            style={ScanAddCustomLayerStyles.headerIcon}
            onPress={handleGoBack}
            hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
            <Image
              style={ScanAddCustomLayerStyles.icon}
              source={require("@/assets/images/common/icon-back-white.png")}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={ScanAddCustomLayerStyles.headerTitle} pointerEvents="none">
            扫码添加
          </Text>
          <View style={ScanAddCustomLayerStyles.headerIcon} pointerEvents="none" />
        </View>
      </SafeAreaView>

      <View style={ScanAddCustomLayerStyles.overlay} pointerEvents="none">
        <OcrPlaceholder />
      </View>

      <View style={ScanAddCustomLayerStyles.bottomOverlay} pointerEvents="box-none">
        <Text style={ScanAddCustomLayerStyles.tips} pointerEvents="none">
          请将二维码放入扫描框内以便扫描
        </Text>

        <TouchableOpacity style={[ScanAddCustomLayerStyles.button, ScanAddCustomLayerStyles.shot]} onPress={snapshot}>
          <Text style={ScanAddCustomLayerStyles.btnText}>点击识别二维码</Text>
        </TouchableOpacity>
      </View>
      <View style={ScanAddCustomLayerStyles.photoAlbum}>
        <TouchableOpacity style={ScanAddCustomLayerStyles.photoAlbumItem} onPress={openPhotoAlbum}>
          <Image
            style={ScanAddCustomLayerStyles.photoIcon}
            source={require("@/assets/images/device/icon-photo-album.png")}
            resizeMode="contain"
          />
          <Text style={ScanAddCustomLayerStyles.photoAlbumText}>相册</Text>
        </TouchableOpacity>
      </View>

      <PermissionPopup
        visible={showPermissionPopup}
        onAccept={handleAcceptPermission}
        onReject={handleRejectPermission}
        title={"开启相机权限"}
        message={"开启相机权限将用于识别二维码信息"}
      />

      <CustomLoading visible={loading} text="二维码识别中..." />

      <Popup
        visible={showPopup}
        title="提示"
        msgText="是否添加自定义图层？"
        leftBtnText="取消"
        rightBtnText="添加"
        rightBtnStyle={{color: "#08AE3C"}}
        onLeftBtn={() => setShowPopup(false)}
        onRightBtn={handleAddCustomLayer}
      />
    </View>
  );
};

export default ScanAddCustomLayerScreen;
