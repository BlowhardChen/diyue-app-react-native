import {FarmServiceListDetailsType, ReceiveUserListItem} from "@/types/mall";
import {http} from "@/utils/http";

/**
 * 农服-查询农服列表
 */
export const getFarmServiceList = (data: {pageSize: number; pageNum: number}) => {
  return http<any>({
    method: "GET",
    url: "/app/agricultural/combination/agriculturalCombinationList",
    data,
  });
};

/**
 * 农服-查询农服信息详情
 */
export const getFarmServiceDetails = (data: {id?: number | string}) => {
  return http<FarmServiceListDetailsType[]>({
    method: "POST",
    url: "/app/agricultural/combination/queryAgriculturalCombination",
    data,
  });
};

/**
 * 农资-查询农资列表
 */
export const getFarmDataList = (data: {pageSize: number; pageNum: number}) => {
  return http<any>({
    method: "GET",
    url: "/app/agricultural/goods/agriculturalGoodsList",
    data,
  });
};

/**
 * 农资-农资订单详情
 */
export const getFarmDataDetail = (data: {id: string | number}) => {
  return http<any>({
    method: "POST",
    url: "/app/agricultural/goods/queryAgriculturalGoods",
    data,
  });
};

/**
 * 农资-查询购物车列表
 */
export const getFarmCartList = () => {
  return http<any>({
    method: "GET",
    url: "/app/shoppingCart/queryShoppingCartList",
  });
};

/**
 * 农资-编辑购物车
 */
export const editFarmCart = (data: any) => {
  return http<any>({
    method: "POST",
    url: "/app/shoppingCart/updateShoppingCart",
    data,
  });
};

/**
 * 收件地址-查询用户收货地址
 */
export const getUserAddress = () => {
  return http<any>({
    method: "GET",
    url: "/app/address/queryUserAddressList",
  });
};

/**
 * 收件地址-查询用户默认收货地址
 */
export const getUserDefaultAddress = () => {
  return http<any>({
    method: "GET",
    url: "/app/address/getUserAddress",
  });
};

/**
 * 收件地址-新增用户收货地址
 */
export const addUserAddress = (data: any) => {
  return http<any>({
    method: "POST",
    url: "/app/address/addaddress",
    data,
  });
};

/**
 * 收件地址-修改用户收货地址
 */
export const editUserAddress = (data: any) => {
  return http<any>({
    method: "POST",
    url: "/app/address/updateAddress",
    data,
  });
};

/**
 * 收件地址-删除用户收货地址
 */
export const deleteUserAddress = (data: {id: number}) => {
  return http<any>({
    method: "POST",
    url: "/app/address/deleteAddress",
    data,
  });
};

/**
 * 收件农户-查询收件农户信息
 */
export const getFarmUserReceivingList = (data?: any) => {
  return http<ReceiveUserListItem[]>({
    method: "POST",
    url: "/app/consignee/queryUserConsigneeList",
    data: {...data},
  });
};

/**
 * 收件农户-新增收件农户信息
 */
export const addFarmUserReceiving = (data: {isDefault?: string; name: string; mobile: string}) => {
  return http<any>({
    method: "POST",
    url: "/app/consignee/addUserConsignee",
    data,
  });
};

/**
 * 收件农户-修改收件农户信息
 */
export const editFarmUserReceiving = (data: {id: number; name?: string; mobile?: string; isDefault?: string}) => {
  return http<any>({
    method: "POST",
    url: "/app/consignee/updateUserConsignee",
    data,
  });
};

/**
 * 收件农户-删除收件农户信息
 */
export const deleteFarmUserReceiving = (data: {ids: number[]}) => {
  return http<any>({
    method: "POST",
    url: "/app/consignee/deleteConsignee",
    data,
  });
};

/**
 * 订单-农资提交订单
 */
export const submitFarmDataOrder = (data: any) => {
  return http<any>({
    method: "POST",
    url: "/app/order/submitGoodsOrder",
    data,
  });
};

/**
 * 订单-农服提交订单
 */
export const submitFarmServiceOrder = (data: any) => {
  return http<any>({
    method: "POST",
    url: "/app/order/submitServiceOrder",
    data,
  });
};

/**
 * 订单-订单支付(待支付)
 */
export const waitPayOrder = (data: any) => {
  return http<any>({
    method: "POST",
    url: "/app/order/orderPay",
    data,
  });
};

/**
 * 订单-取消订单
 */
export const cancelOrder = (data: {id: number}) => {
  return http<any>({
    method: "POST",
    url: "/app/order/cancelorder",
    data,
  });
};

/**
 * 订单-订单退款
 */
export const orderRefund = (data: {id: number}) => {
  return http<any>({
    method: "POST",
    url: "/app/order/applyRefund",
    data,
  });
};

/**
 * 订单-服务完成
 */
export const completeOrder = (data: any) => {
  return http<any>({
    method: "POST",
    url: "/app/order/receiptOrder",
    data,
  });
};

/**
 * 订单-订单详情
 */
export const orderDetail = (data: {id: string | number; orderType: string}) => {
  return http<any>({
    method: "POST",
    url: "/app/order/queryOrder",
    data,
  });
};

/**
 * 订单-订单列表
 */
export const getOrderList = (data: {orderType?: string; status: string}) => {
  return http<any>({
    method: "POST",
    url: "/app/order/orderList",
    data,
  });
};

/**
 * 我的地块-订单列表
 */
export const getLandOrderList = (data: any) => {
  return http<any>({
    method: "POST",
    url: "/app/order/queryLandOrderList",
    data,
  });
};
