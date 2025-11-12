export type RootStackParamList = AuthParamList &
  MainParamList &
  AuthStackParamList &
  AccountStackParamList &
  DeviceStackParamList &
  LandMapStackParamList;

// 启动页&隐私政策&服务协议&隐私政策详情页
export type AuthParamList = {
  Splash: undefined;
  PrivacyPolicy: undefined;
  ServiceAgreement: undefined;
  PrivacyPolicyDetail: undefined;
};

// 主页面（底部导航栏）
export type MainParamList = {
  Main: undefined;
};

// 登录注册页
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  CodeLogin: undefined;
  SetPassword: undefined;
};

// 账户信息
export type AccountStackParamList = {
  AccountSetting: undefined;
  PersonalInfo: undefined;
  EditPassword: {mobile: string};
  EditUserName: {name: string};
};

// 设备
export type DeviceStackParamList = {
  AddDevice: undefined;
  CurrentConnect: {imei: string};
  ManualInput: undefined;
  BluetoothConnect: undefined;
  DifferentialConfig: {deviceInfo: any};
  DataUpload: {deviceInfo: any};
};

// 土地地图相关
export type LandMapStackParamList = {
  Enclosure: undefined;
  LandInfoEdit: {landInfo: SaveLandResponse};
  OcrCardScanner: {type: string};
  LandDetail: {landId: string};
  QuitLand: undefined;
  SelectLand: {type: string};
};
