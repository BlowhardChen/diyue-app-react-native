import {showCustomToast} from "@/components/common/CustomToast";
import {PermissionsAndroid, Platform} from "react-native";

// 检查定位权限
export const checkLocationPermission = async () => {
  if (Platform.OS === "ios") {
    return true; // iOS 在调用前会弹窗，这里可以改成实际检查
  }
  const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
  return granted;
};

// 请求定位权限
export const requestLocationPermission = async () => {
  if (Platform.OS === "ios") {
    return true;
  }
  const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

// 检查电话权限
export const checkPhonePermission = async () => {
  if (Platform.OS === "ios") {
    return true;
  }
  const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CALL_PHONE);
  return granted;
};

// 请求电话权限
export const requestPhonePermission = async () => {
  if (Platform.OS === "ios") {
    return true;
  }
  try {
    // 直接拉起安卓系统权限授权弹窗
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CALL_PHONE, {
      title: "拨打电话权限",
      message: "需要获取拨打电话权限，以便直接拨打号码",
      buttonPositive: "允许",
      buttonNegative: "取消",
    });
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    showCustomToast("error", "申请拨打电话权限失败");
    return false;
  }
};
