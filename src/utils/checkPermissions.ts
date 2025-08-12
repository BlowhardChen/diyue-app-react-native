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
