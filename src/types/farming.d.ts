// 新增农事参数
export interface AddFarmingParams {
  farmingName: string;
  dictLabel: string;
  dictValue: string;
  totalArea: string;
  detailaddress: string;
  workBeginTime: string;
  workEndTime: string;
  teamMobile: string;
  farmingScienceId: string;
  farmingScienceName: string;
  farmingScienceTypeId: string;
  farmingScienceTypeName: string;
  farmingLands: Array<{land: string}> | [];
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
  dictValue: string;
  workBeginTime: string;
  workEndTime: string;
  totalArea: number;
  workStatus: string;
  country: string;
  province: string;
  city: string;
  district: string;
  township: string;
  administrativeVillage: string;
  detailaddress: string;
  nickName: string;
  mobile: number;
  teamUserId: string;
  teamName: string;
  teamMobile: string;
  teamMemberUserId: string;
  teamMemberName: string;
  teamMemberMobile: string;
  identity: string;
  isShow: string;
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
