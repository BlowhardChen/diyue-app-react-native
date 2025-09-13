import {LandListData} from "@/types/land";
import {http} from "@/utils/http";

/**
 * 首页-查询地信息列表
 */
export const getLandListData = (data: any) => {
  return http<LandListData>({
    method: "POST",
    url: "/app/land/landList",
    data,
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
