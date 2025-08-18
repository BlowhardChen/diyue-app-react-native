// AddDeviceScreen.tsx
import React, {useEffect, useRef, useState} from "react";
import {View, Text, Image, TouchableOpacity, Vibration} from "react-native";
import {Camera, useCameraDevice, useCameraPermission} from "react-native-vision-camera";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import {AddDeviceScreenStyles} from "./styles/AddDeviceScreen";
import {SafeAreaView} from "react-native-safe-area-context";
import PermissionPopup from "@/components/common/PermissionPopup";
import {ToastUtil} from "@/components/common/CustomCenterToast";
import CameraPlaceholder from "@/components/device/CameraPlaceholder";

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
  const [showPowerPopup, setShowPowerPopup] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
    // 没有权限时，先弹出权限弹窗
    if (!hasPermission) {
      setShowPermissionPopup(true);
      return;
    }

    if (!camera.current || isUploading) return;
    try {
      Vibration.vibrate(100);
      const photo = await camera.current.takePhoto({
        flash: "off",
      });
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
      formData.append("file", {
        uri: filePath,
        name: "ocr.jpg",
        type: "image/jpeg",
      } as any);
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
      {/* Header */}
      <SafeAreaView edges={["top"]}>
        <View style={AddDeviceScreenStyles.header}>
          {/* 左侧返回按钮 */}
          <TouchableOpacity style={AddDeviceScreenStyles.headerIcon} onPress={() => navigation.goBack()}>
            <Image style={AddDeviceScreenStyles.icon} source={require("@/assets/images/common/icon-back-white.png")} />
          </TouchableOpacity>

          {/* 标题（绝对居中） */}
          <Text style={AddDeviceScreenStyles.headerTitle}>添加设备</Text>

          {/* 右侧占位 */}
          <View style={AddDeviceScreenStyles.headerIcon} />
        </View>
      </SafeAreaView>

      {/* Camera */}
      <View style={AddDeviceScreenStyles.cameraBox}>
        {device && hasPermission ? (
          <Camera ref={camera} style={AddDeviceScreenStyles.camera} device={device} isActive={true} photo={true} />
        ) : (
          <CameraPlaceholder />
        )}
      </View>

      {/* Bottom buttons */}
      <View style={AddDeviceScreenStyles.buttonContent}>
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
