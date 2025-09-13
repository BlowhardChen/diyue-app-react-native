// 地图webview消息类型
export interface MapWebviewMessage {
  type: string;
  message?: string;
  total?: number;
  area?: string;
  isPolygonIntersect?: boolean;
  saveLandParams?: SaveLandParams;
  data?: any;
}

// 保存地块参数
export interface SaveLandParams {
  polygonPath: {
    lon: number;
    lat: number;
  }[];
  area: number;
  landUrl: string;
}

// 保存地块返回参数
export interface SaveLandResponse {
  id: string;
  landName: string;
  area: number;
  landType: string;
  landUrl: string;
  polygonPath: {
    lon: number;
    lat: number;
  }[];
}

// 地块列表数据
export interface LandListData {
  actualAcreNum: number;
  administrativeVillage: string;
  agrimensorMemberId: number;
  areaManager: number;
  bankAccount: string;
  beginActualNum: number;
  beginTime: string;
  cardid: string;
  city: string;
  country: string;
  createBy: string;
  createMobile: string;
  createName: string;
  createTime: string;
  createUserId: number;
  detailaddress: string;
  district: string;
  endActualNum: number;
  endTime: string;
  formattedAddress: string;
  gpsList: {landId: string; lat: number; lon: number; sort: number}[];
  id: string;
  landList: {landId: string; lat: number; lon: number; sort: number}[];
  landName: string;
  landType: string;
  memberId: number;
  mobile: string;
  openBank: string;
  province: string;
  quitAppByName: string;
  quitAppByPhone: string;
  quitByName: string;
  quitByPhone: string;
  quitStatus: string;
  quitTime: string;
  relename: string;
  remark: string;
  residualDay: number;
  status: string;
  township: string;
  type: string;
  updateTime: string;
  updateUserId: string;
  url: string;
  userId: number;
}
