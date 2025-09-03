import {DeviceImeiInfoRequest} from "@/types/device";
import {http} from "@/utils/http";

/**
 * 设备-获取设备连接状态
 */
export const getDeviceConnectStatus = () => {
  return http<any>({
    method: "GET",
    url: "/app/device/queryDeviceStatus",
  });
};

/**
 * 设备-查询设备Imei信息
 */
export const getDeviceImeiInfo = (imei: string) => {
  return http<DeviceImeiInfoRequest>({
    method: "POST",
    url: "/app/device/queryDeviceByImei",
    data: {imei},
  });
};
