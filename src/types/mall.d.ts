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
