// 地图webview消息类型
export interface MapWebviewMessage {
  id?: string;
  type: string;
  message?: string;
  total?: number;
  area?: string;
  isPolygonIntersect?: boolean;
  saveLandParams?: SaveLandParams;
  data?: any;
  point?: {
    lon: number;
    lat: number;
  };
  isSelect?: boolean;
  mergeCoordinates?: number[][];
  mergeArea?: number;
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
  gpsList: {landId: string; lat: number; lng: number; sort: number}[];
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

// 地块详细信息

export interface LandDetailInfo {
  id: string;
  landName: string;
  landType: "1" | "2";
  type?: string;
  actualAcreNum?: string;
  createTime?: string;
  createName?: string;
  mobile?: string;
  cardid?: string;
  bankAccount?: string;
  detailaddress?: string;
  list?: {lng: number; lat: number}[];
}
// 托管地块订单列表
export interface LandOrderItem {
  id: number;
  createTime: string;
  name: string;
  orderCode: string;
  orderType: string;
  payTime: string;
  payType: string;
  status: string;
  totalPrice: number;
  url: string;
  goodsList: GoodsListItem[];
  serviceList: ServiceListItem[];
}

// 编辑地块信息参数
export interface EditLandInfoParamsType {
  id: string;
  landName?: string;
  relename?: string;
  cardid?: string;
  bankAccount?: string;
  openBank?: string;
  mobile?: string;
  landType?: string;
  acreageNum?: number;
  actualAcreNum?: number;
  country?: string;
  province?: string;
  city?: string;
  district?: string;
  township?: string;
  detailaddress?: string;
}

// 合并地块请求参数
export interface MergeLandParams {
  mergeLandName: string;
  mergeAcreageNum: number;
  country: string;
  province: string;
  city: string;
  district: string;
  township: string;
  detailaddress: string;
  url: string;
  list: {
    lat: number;
    lng: number;
  }[];
  landOrList: {landId: string}[];
}

// 地块表单信息
interface LandFormInfo {
  id: string;
  landName: string;
  cardid: string;
  bankAccount: string;
  openBank: string;
  mobile: string;
  landType: string;
  acreageNum: number;
  actualAcreNum: number;
  country: string;
  province: string;
  city: string;
  district: string;
  township: string;
  administrativeVillage: string;
  detailaddress: string;
}

// 转移地块请求参数
export interface TransferLandParams {
  mobile: string;
  list: {type: string; landId: string}[];
}
