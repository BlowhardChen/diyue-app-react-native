export type RootStackParamList = AuthParamList &
  MainParamList &
  AuthStackParamList &
  AccountStackParamList &
  DeviceStackParamList &
  LandMapStackParamList &
  FarmStackParamList &
  ContractStackParamList &
  PatrolParamList;

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
  AddDevice: {farmingJoinTypeId?: string; taskType?: string} | undefined;
  CurrentConnect: {imei: string; farmingJoinTypeId?: string; taskType?: string};
  ManualInput: {farmingJoinTypeId?: string; taskType?: string} | undefined;
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
  SelectLand: {
    type: string;
    farmingTypeId?: string;
    lands?: LandListData[] | [];
    landRequest?: () => Promise<LandListData[]>;
    onSelectLandResult: (result: LandListData[]) => void;
  };
  MergeLand: {landId: string};
  FindLandDetail: {landId: string};
  FindPoint: {point: {lat: number; lon: number}};
  CustomLayer: undefined;
};

// 农事管理相关
export type FarmStackParamList = {
  AddFarming: {id?: string; farmingId?: string};
  FarmingMap: undefined;
  MechanicalTask: undefined;
  PatrolFieldManage: undefined;
  FarmingDetail: {farmingId: string; farmingJoinTypeId: string; workStatus: string; navTitle: string};
  AllocateFarming: {farmingJoinTypeId: string};
  TransferFarming: {farmingJoinTypeId: string};
  FarmingWorkData: {farmingJoinTypeId: string; workUsers: {userName: string; userId: string}[]};
  HistoryWorkDetail: {farmingJoinTypeId: string};
  LandMark: {farmingJoinTypeId: string};
  MechanicalTaskDetail: {farmingId?: string; farmingJoinTypeId: string; navTitle: string};
};

// 合同管理相关
export type ContractStackParamList = {
  ContractManage: undefined;
  AddContract: {contractType: string; landId?: string; landCoordinates?: string};
  ElectronicContract: {contractInfo: string; page?: string};
  ContractDetail: {contractInfo: string; contractType: string};
};

// 巡田管理相关
export type PatrolParamList = {
  AbnormalUpload: undefined | {id?: string};
  AbnormalRecord: undefined;
  AbnormalDetail: {id?: string; taskLogId?: string};
  PatrolManage: {id: string};
  PatrolDetail: {id: string};
  MarkPosition: {
    type: string;
    taskLogId?: string;
    onMarkPointResult?: (result: {data: any}) => void;
    abnormalDetailInfoData?: AbnormalDetailInfoData[];
  };
};
