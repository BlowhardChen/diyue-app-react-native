// AddDeviceScreen.tsx
import React, {useEffect, useRef, useState} from "react";
import {View, Text, Image, TouchableOpacity, Vibration, StyleSheet, Dimensions} from "react-native";
import {Camera, useCameraDevice, useCameraPermission} from "react-native-vision-camera";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import {AddDeviceScreenStyles} from "./styles/AddDeviceScreen";
import {SafeAreaView} from "react-native-safe-area-context";
import PermissionPopup from "@/components/common/PermissionPopup";
import {ToastUtil} from "@/components/common/CustomCenterToast";
import CameraPlaceholder from "@/components/device/CameraPlaceholder";
import {GestureDetector, Gesture} from "react-native-gesture-handler";

type AddDeviceStackParamList = {
  CurrentConnect: {imei: string};
  ManualInput: undefined;
  BluetoothConnect: undefined;
};

const AddDeviceScreen = () => {
  const navigation = useNavigation<StackNavigationProp<AddDeviceStackParamList>>();
  const device = useCameraDevice("back");
  const {hasPermission, requestPermission} = useCameraPermission();
  const camera = useRef<Camera>(null);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const windowHeight = Dimensions.get("window").height;

  const handleGoBack = () => {
    console.log("goBack clicked");
    navigation.goBack();
  };

  // 点击对焦手势
  const tapGesture = Gesture.Tap()
    .onStart(e => {
      // 限制在扫描框内识别
      const inScanArea = e.y > windowHeight * 0.2 && e.y < windowHeight * 0.6;
      return inScanArea;
    })
    .onEnd(async event => {
      if (camera.current && device?.supportsFocus) {
        try {
          await camera.current.focus({
            x: event.x / event.deviceEvent.pointerInside.width,
            y: event.y / event.deviceEvent.pointerInside.height,
          });
        } catch (e) {
          console.log("对焦失败:", e);
        }
      }
    });

  // 同意开启相机权限
  const handleAcceptPermission = async () => {
    setShowPermissionPopup(false);
    const granted = await requestPermission();
    if (!granted) {
      ToastUtil.showErrorToast("未获得相机权限");
    }
  };

  // 拒绝开启相机权限
  const handleRejectPermission = () => {
    setShowPermissionPopup(false);
  };

  // 拍照
  const snapshot = async () => {
    if (!hasPermission) {
      setShowPermissionPopup(true);
      return;
    }
    if (!camera.current || isUploading) return;
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
    setIsUploading(true);
    try {
      const token = ""; // 从 storage 里取
      const formData = new FormData();
      formData.append("file", {uri: filePath, name: "ocr.jpg", type: "image/jpeg"} as any);
      formData.append("type", "4");
      const res = await fetch("http://60.205.213.205:8091/upload/uploadOCRImg", {
        method: "POST",
        headers: {token},
        body: formData,
      });
      const json = await res.json();
      setIsUploading(false);
      if (json.code === 200) {
        getDeviceBaseInfo(json.data);
      } else {
        ToastUtil.showErrorToast("图片识别失败，请重试");
      }
    } catch (err) {
      setIsUploading(false);
      ToastUtil.showErrorToast("图片识别失败，请重试");
    }
  };

  // 查询设备信息
  const getDeviceBaseInfo = async (imei: string) => {
    const token = "";
    const res = await fetch("http://60.205.213.205:8091/app/device/queryDeviceByImei", {
      method: "POST",
      headers: {"Content-Type": "application/json", token},
      body: JSON.stringify({imei}),
    });
    const json = await res.json();
    if (json.data.existsStatus === "0") {
      navigation.navigate("CurrentConnect", {imei});
    } else {
      ToastUtil.showErrorToast("RTK设备暂未添加，请联系管理员添加设备再扫码使用");
    }
  };

  return (
    <View style={AddDeviceScreenStyles.container}>
      {/* 相机区域 */}

      {device && hasPermission ? (
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo={true}
          enableZoomGesture={true}>
          {/* 仅在相机区域添加手势层 */}
          <GestureDetector gesture={tapGesture}>
            <View style={AddDeviceScreenStyles.gestureLayer} />
          </GestureDetector>
        </Camera>
      ) : (
        <View style={AddDeviceScreenStyles.fullCamera} />
      )}

      {/* 顶部导航 */}
      <SafeAreaView style={AddDeviceScreenStyles.headerOverlay} edges={["top"]} pointerEvents="box-none">
        <View style={AddDeviceScreenStyles.header}>
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
          <Text style={AddDeviceScreenStyles.headerTitle}>添加设备</Text>
          <View style={AddDeviceScreenStyles.headerIcon} />
        </View>
      </SafeAreaView>

      {/* 扫描框 */}
      <View style={AddDeviceScreenStyles.overlay}>
        <CameraPlaceholder />
      </View>

      {/* 底部操作区域 */}
      <View style={AddDeviceScreenStyles.bottomOverlay}>
        <Text style={AddDeviceScreenStyles.tips}>请开启设备后扫描二维码</Text>
        <TouchableOpacity style={[AddDeviceScreenStyles.button, AddDeviceScreenStyles.shot]} onPress={snapshot}>
          <Text style={AddDeviceScreenStyles.btnText}>点击识别二维码</Text>
        </TouchableOpacity>
        <View style={AddDeviceScreenStyles.buttonBottom}>
          <View style={AddDeviceScreenStyles.dividerRow}>
            <View style={AddDeviceScreenStyles.line} />
            <Text style={AddDeviceScreenStyles.text}>或</Text>
            <View style={AddDeviceScreenStyles.line} />
          </View>
          <TouchableOpacity
            style={[AddDeviceScreenStyles.button, AddDeviceScreenStyles.hand]}
            onPress={() => navigation.navigate("ManualInput")}>
            <Text style={AddDeviceScreenStyles.btnText}>手动输入</Text>
          </TouchableOpacity>
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
    </View>
  );
};

export default AddDeviceScreen;
