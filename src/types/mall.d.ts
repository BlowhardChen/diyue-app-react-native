// 农资商品列表项
export interface FarmDataListItem {
  id: string | number;
  images: Array<{url: string}>;
  goodsName: string;
  spec: string;
  price: string | number;
  num: number;
}

// 农服服务列表项
export interface FarmServiceListItem {
  id: string | number;
  images: Array<{url: string}>;
  name: string;
  price: string | number;
}

// 商品列表项
export interface GoodsListItem {
  id: number;
  agriculturalGoodsId: number;
  name: string;
  num: number;
  orderId: number;
  price: number;
  spec: string;
  url: string;
}

// 农资服务列表项
export interface ServiceListItem {
  id: number;
  name: string;
  acreageNum: number;
  agriculturalServiceId: number;
  farmingTypeId: string;
  orderId: string;
  price: string;
  url: string;
}

// 农服详情类型
export interface FarmServiceListDetailsType {
  id: number;
  name: string;
  addressList: ReceiveUserListItem[];
  landList: LandListItemInfo[];
  goodsList: FarmDataListItem[];
  serviceList: FarmServiceListItem[];
}

// 用户收货地址item
export interface ReceiveUserListItem {
  id: number;
  userId: number;
  name: string;
  mobile: string;
  address: string;
  detailAddress: string;
  isDefault: string;
  province: string;
  city: string;
  district: string;
  township: string;
  createTime: string;
  updateTime: string;
}
