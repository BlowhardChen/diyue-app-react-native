import {LandListData} from "@/types/land";
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
 * 圈地-新增地块
 */
export const addLand = (data: any) => {
  return http({
    method: "POST",
    url: "/app/land/addLand",
    data,
  });
};
