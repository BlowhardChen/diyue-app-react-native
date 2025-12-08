import {AddFarmingParams, FarmingListInfoData, FarmScientceListItem, FarmTypeListItem} from "@/types/farming";
import {http} from "@/utils/http";

/**
 * 新建农事-新增农事
 */
export const addFarming = (data: AddFarmingParams) => {
  return http<any>({
    method: "POST",
    url: "/app/farming/add",
    data,
  });
};

/**
 * 新建农事-编辑农事
 */
export const editFarming = (data: any) => {
  return http<any>({
    method: "POST",
    url: "/app/farming/edit",
    data,
  });
};

/**
 * 新建农事-删除农事
 */
export const deleteFarming = (data: {farmingId: string}) => {
  return http<any>({
    method: "POST",
    url: "/app/farming/deleteFarming",
    data,
  });
};

/**
 * 新建农事-农事技术方案列表
 */
export const farmingScientceList = (data: {dictValue: string; farmingTypeId: string}) => {
  return http<FarmScientceListItem[]>({
    method: "POST",
    url: "/app/farming/science/farmingScienceList",
    data,
  });
};

/**
 * 新建农事-农事类型列表
 */
export const farmingTypeList = (data: {dictValue: string}) => {
  return http<FarmTypeListItem[]>({
    method: "POST",
    url: "/app/farming/type/farmingTypeList",
    data,
  });
};

/**
 * 农事地图-农事列表
 */
export const farmingList = (data: {
  type: string;
  farmingName?: string;
  dictValue?: string;
  farmingScienceTypeId?: string;
  workStatus?: string;
}) => {
  return http<FarmingListInfoData[]>({
    method: "POST",
    url: "/app/farming/farmingList",
    data,
  });
};

/**
 * 农事地图-农事列表统计
 */
export const farmingCount = (data: {
  type: string;
  farmingName?: string;
  dictValue?: string;
  farmingScienceTypeIds?: string[];
  workStatus?: string;
}) => {
  return http<{farmingCoun: number; totalArea: number}>({
    method: "POST",
    url: "/app/farming/queryFarmingCount",
    data,
  });
};

/**
 * 农事地图-农事数据状态统计
 */
export const farmingStatusCount = (data: {
  type: string;
  dictValue: string;
  farmingScienceTypeIds: string[];
  taskType: string;
}) => {
  return http<{farmingCoun: number; totalArea: number}>({
    method: "POST",
    url: "/app/farming/queryFarmingWorkStatusCount",
    data,
  });
};

/**
 * 农事地图-农事详情
 */
export const farmingDetailInfo = (data: {farmingId: string; userId?: string; isShow?: string}) => {
  return http<any>({
    method: "POST",
    url: "/app/farming/queryFarming",
    data,
  });
};
