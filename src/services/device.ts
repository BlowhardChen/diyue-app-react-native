import {DeviceDifferentialConfigRequsetParmer, DeviceImeiInfoResponse} from "@/types/device";
import {http} from "@/utils/http";

/**
 * 设备-获取设备连接状态
 */
export const getDeviceConnectStatus = (data: {imei: string; taskType: string}) => {
  return http<any>({
    method: "POST",
    url: "/app/device/queryDeviceStatus",
    data,
  });
};

/**
 * 设备-查询设备信息
 */
export const getDeviceInfo = (imei: string) => {
  return http<DeviceImeiInfoResponse>({
    method: "POST",
    url: "/app/device/queryDeviceByImei",
    data: {imei},
  });
};

/**
 * 当前连接-查询设备差分数据源配置
 */
export const getDeviceDifferentialConfig = (deviceId: string) => {
  return http<any>({
    method: "POST",
    url: "/app/device/queryDeviceDateList",
    data: {deviceId},
  });
};

/**
 * 当前连接-更新设备差分数据源配置
 */
export const updateDeviceDifferentialConfig = (data: DeviceDifferentialConfigRequsetParmer) => {
  return http<any>({
    method: "POST",
    url: "/app/device/updateDeviceDate",
    data,
  });
};

/**
 * 数据上传-查询设备上传数据配置
 */
export const getDeviceUploadConfig = (deviceId: string) => {
  return http<any>({
    method: "POST",
    url: "/app/device/queryDeviceUploadDateList",
    data: {deviceId},
  });
};

/**
 * RTK连接-获取设备弹窗提醒状态
 */
export const getRtkPopupStatus = (data: any) => {
  return http<any>({
    method: "POST",
    url: "/app/device/queryDevicePopUpWindows",
    data,
  });
};

/**
 * RTK连接-设置设备弹窗提醒
 */
export const setRtkPopupTips = (data: any) => {
  return http<any>({
    method: "POST",
    url: "/app/device/devicePopUpWindows",
    data,
  });
};
