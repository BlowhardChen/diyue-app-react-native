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
export type DeviceImeiInfoResponse = {
  device: DeviceImeiInfo;
  deviceDate: [];
  deviceNetwork: [];
  deviceStatus: string;
  dyDeviceUploadDate: [];
  existsStatus: string;
};

// 修改差分数据源配置请求参数
export type DeviceDifferentialConfigRequsetParmer = {
  id?: string;
  deviceId: string;
  type: string;
  ip: string;
  port: string;
  topic: string;
  userName: string;
  pwd: string;
};
