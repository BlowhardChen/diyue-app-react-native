// 设备信息
export type DeviceImeiInfo = {
  createBy: string;
  createTime: string;
  createUserId: string;
  delFlag: string;
  devType: string;
  deviceId: number;
  farmingId: string;
  iccid: string;
  id: string;
  imei: string;
  imgUrl: string;
  name: string;
  onlineStatus: string;
  remark: string;
  status: "0" | "1"; // 帐号状态:0正常,1禁用
  updateTime: string;
  updateUserId: string;
  userId: number;
};
// 设备Imei信息
export type DeviceImeiInfoRequest = {
  device: DeviceImeiInfo;
  deviceDate: [];
  deviceNetwork: [];
  deviceStatus: string;
  dyDeviceUploadDate: [];
  existsStatus: string;
};
