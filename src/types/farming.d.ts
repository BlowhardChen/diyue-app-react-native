// 新增农事参数
export interface AddFarmingParams {
  farmingId?: string;
  farmingName: string;
  dictLabel: string;
  dictValue: string;
  totalArea: number;
  farmingLands: {landType: string; landId: string}[];
  farmingJoinTypes: {farmingTypeId: string; farmingTypeName: string}[];
}

// 农技方案列表item
export interface FarmScientceListItem {
  attachmentName: string;
  attachmentUrl: string;
  createBy: string;
  createTime: string;
  createUserId: string;
  deptId: number;
  dictValue: string;
  farmingScienceId: string;
  farmingScienceName: string;
  farmingScienceTypes: FarmingScienceTypes[];
  remark: string;
  status: string;
  updateTime: string;
  updateUserId: string;
}

// 农事类型列表item
export interface FarmTypeListItem {
  createMobile: string;
  createName: string;
  createTime: string;
  deptId: number;
  dictValue: string;
  farmingFields: FarmFieldListItem[];
  farmingTypeId: string;
  farmingTypeName: string;
  status: string;
}

// 农事列表数据
export interface FarmingListInfoData {
  farmingId: string;
  farmingName: string;
  farmingJoinTypeVoList: FarmingJoinTypeVoList[];
}

// 农事类型子项数据
export interface FarmingJoinTypeVoList {
  farmingJoinTypeId: string;
  farmingTypeName: string;
  totalArea: number;
  totalLandCount: number;
  workArea: number;
  workLandCount: number;
}

// 异常记录详情数据
export interface AbnormalDetailInfoData {
  comment: string;
  createName: string;
  createTime: string;
  exceptionGpsList: {lat: number; lng: number}[];
  exceptionImageList: {url: string}[];
  exceptionReportList: {dictLabel: string}[];
  id: string;
  location: string;
  mobile: string;
  taskLogId: string;
  taskName: string;
}

// 农事类型列表item
export interface FarmingTypeListItem {
  createMobile: string;
  createName: string;
  createTime: string;
  dictValue: string;
  farmingTypeId: string;
  farmingTypeName: string;
}

// 异常记录详情数据
export interface AbnormalDetailInfoData {
  id: string;
  taskLogId: string;
  taskName: string;
  mobile: string;
  locationL: string;
  comment: string;
  createName: string;
  createTime: string;
  exceptionGpsList: {lat: number; lng: number}[];
  exceptionImageList: {url: string}[];
  exceptionReportList: {dictLabel: string}[];
}

// 农事地图详情数据
export interface FarmingMapDetailInfoData {
  farmingJoinTypeId: string;
  farmingName: string;
  farmingTypeName: string;
  landCount: number;
  lands: {id: string; landName: string; landType: string; landStatus: string; gpsList: {lat: number; lng: number}[]}[];
  status: string;
  totalArea: number;
  userVos: {userName: string}[];
  workArea: number;
}
