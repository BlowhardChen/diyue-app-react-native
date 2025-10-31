import {EditLandInfoParamsType, LandListData, MergeLandParams} from "@/types/land";
import {http} from "@/utils/http";

/**
 * 首页-查询地信息列表
 */
export const getLandListData = (data: any) => {
  return http<LandListData[]>({
    method: "POST",
    url: "/app/land/landList",
    data,
  });
};

/**
 * 首页-查询地块详情信息
 */
export const getLandDetailsInfo = (id: string) => {
  return http<any>({
    method: "POST",
    url: "/app/land/queryLandApp",
    data: {id},
  });
};

/**
 * 首页-查询托管地块订单列表
 */
export const getLandOrderList = (landId: string) => {
  return http<any>({
    method: "POST",
    url: "/app/order/queryLandOrderList",
    data: {landId},
  });
};

/**
 * 首页-删除地块
 */
export const deleteLand = (id: string) => {
  return http<any>({
    method: "POST",
    url: "/app/land/deleteLand",
    data: {id},
  });
};

/**
 * 首页-恢复地块
 */
export const restoreLand = (id: string) => {
  return http<any>({
    method: "POST",
    url: "/app/land/regainLand",
    data: {id},
  });
};

/**
 * 首页-转移地块
 */
export const transferLand = (data: {mobile: string; list: {type: string; landId: string}[]}) => {
  return http<any>({
    method: "POST",
    url: "/app/land/shiftLand",
    data,
  });
};

/**
 * 首页-移除地块
 */
export const removeLand = (data: {landId: string; mergeLandId: string}) => {
  return http<any>({
    method: "POST",
    url: "/app/land/removeLand",
    data,
  });
};

/**
 * 首页-合并地块
 */
export const mergeLand = (data: MergeLandParams) => {
  return http<any>({
    method: "POST",
    url: "/app/mergeLand/addMergeLand",
    data,
  });
};

/**
 * 首页-编辑合并地块
 */
export const editMergeLand = (data: {id: string; mergeLandName: string}) => {
  return http<any>({
    method: "POST",
    url: "/app/mergeLand/updateMergeLand",
    data,
  });
};

/**
 * 首页-退地块
 */
export const quitLand = (data: {id: string; type: string}) => {
  return http<any>({
    method: "POST",
    url: "/app/land/quitLand",
    data,
  });
};

/**
 * 首页-查询合并地块下单个地块列表
 */
export const getMergeLandlist = (id: string) => {
  return http<any>({
    method: "POST",
    url: "/app/land/queryMergeAndLandList",
    data: {id},
  });
};

/**
 * 圈地-新增地块
 */
export const addLand = (data: any) => {
  return http({
    method: "POST",
    url: "/app/land/addLand",
    data,
  });
};

/**
 * 地块信息-地理逆编码
 */
export const locationToAddress = (data: {latitude: string | number; longitude: string | number}) => {
  return http<any>({
    method: "POST",
    url: "/app/geo/geoLocationToAddress",
    data,
  });
};

/**
 * 地块信息-查询农户信息
 */
export const searchUserInfo = (data: any) => {
  return http<any>({
    method: "POST",
    url: "/app/land/landColumnlist",
    data,
  });
};

/**
 * 地块信息-编辑地块信息
 */
export const editLandInfo = (data: EditLandInfoParamsType) => {
  return http<any>({
    method: "POST",
    url: "/app/land/updateLand",
    data,
  });
};
