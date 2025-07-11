import {http} from "@/utils/http";

/**
 * 设备-获取设备连接状态
 */
export const getDeviceConnectStatus = (data: {mobile: string}) => {
  return http<any>({
    method: "GET",
    url: "/app/device/queryDeviceStatus",
    data,
  });
};
