import {AddFarmingParams, FarmingListInfoData, FarmScientceListItem, FarmTypeListItem} from "@/types/farming";
import {LandListData} from "@/types/land";
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
 * 编辑农事-查询编辑农事详情
 */
export const getEditFarmingDetail = (id: string) => {
  return http<any>({
    method: "POST",
    url: "/app/farming/queryEditFarming",
    data: {id},
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
export const getFarmingList = (data: {
  type: string;
  farmingName?: string;
  dictValue?: string;
  farmingScienceTypelds?: string[];
  workStatus?: string;
}) => {
  return http<FarmingListInfoData[]>({
    method: "POST",
    url: "/app/farming/farmingList",
    data,
  });
};

/**
 * 农事地图-农事详情
 */
export const farmingDetailInfo = (data: {farmingJoinTypeId: string; type: string}) => {
  return http<any>({
    method: "POST",
    url: "/app/farming/queryFarming",
    data,
  });
};

/**
 * 农事详情-分配农事
 */
export const allocateFarming = (data: {
  farmingJoinTypeLandParams: {farmingJoinTypeId: string; assignMobile: string; lands: {landId: string}[]}[];
}) => {
  return http<any>({
    method: "POST",
    url: "/app/farming/allotFarming",
    data,
  });
};

/**
 * 农事详情-转移农事
 */
export const transferFarming = (data: {farmingJoinTypeId: string; assignMobile: string; lands: {landId: string}[]}) => {
  return http<any>({
    method: "POST",
    url: "/app/farming/shiftFarmingLand",
    data,
  });
};

/**
 * 农事详情-完成农事
 */
export const completeFarming = (data: {id: string}) => {
  return http<any>({
    method: "POST",
    url: "/app/farming/farmingLinkWorkStatus",
    data,
  });
};

/**
 * 农事详情-标注农事地块
 */
export const markFarmingLand = (data: {farmingJoinTypeId: string; lands: {landId: string}[]}) => {
  return http<any>({
    method: "POST",
    url: "/app/farming/markFarmingLand",
    data,
  });
};

/**
 * 农事地图-查询农事地块列表（区域所有地块列表）
 */
export const farmingLandList = (data: {farmingTypeId?: string; dictValue?: string; memberId?: number; landType?: string}) => {
  return http<any>({
    method: "POST",
    url: "/app/farming/farmingLandVoList",
    data,
  });
};

/**
 * 农事地图-查询未分配农事地块列表
 */
export const unallocatedFarmingLandList = (data: {id: string}) => {
  return http<any>({
    method: "POST",
    url: "/app/farming/unassignedLandFarmingList",
    data,
  });
};

/**
 * 农事地图-查询农事环节地块列表
 */

export const farmingScienceLandList = (data: {id: string}) => {
  return http<any>({
    method: "POST",
    url: "/app/farming/farmingLandList",
    data,
  });
};

/**
 * 巡田管理-巡田任务列表
 */
export const patrolTaskList = (data: {status: string}) => {
  return http<any>({
    method: "POST",
    url: "/app/taskLog/queryTaskList",
    data,
  });
};

/**
 * 巡田管理-巡田任务详情
 */
export const patrolTaskDetail = (data: {id: string}) => {
  return http<any>({
    method: "POST",
    url: "/app/taskLog/queryTask",
    data,
  });
};

/**
 * 巡田管理-巡田任务开始
 */
export const patrolTaskStart = (data: {id: string}) => {
  return http<any>({
    method: "POST",
    url: "/app/taskLog/startTask",
    data,
  });
};

/**
 * 巡田管理-巡田任务结束
 */
export const patrolTaskEnd = (data: {id: string}) => {
  return http<any>({
    method: "POST",
    url: "/app/taskLog/stopTask",
    data,
  });
};

/**
 * 巡田管理-巡田任务轨迹列表
 */
export const patrolTaskLocusList = (data: {taskLogId?: string; taskLogLocusId?: string}) => {
  return http<any>({
    method: "POST",
    url: "/app/taskLogLocus/queryTaskLogLocusList",
    data,
  });
};

/**
 * 巡田管理-添加异常上报
 */
export const patrolTaskAddException = (data: any) => {
  return http<any>({
    method: "POST",
    url: "/app/exception/addException",
    data,
  });
};

/**
 * 巡田管理-异常上报列表
 */
export const patrolTaskExceptionList = () => {
  return http<any>({
    method: "POST",
    url: "/app/exception/queryExceptionList",
  });
};

/**
 * 巡田管理-异常上报详情
 */
export const patrolTaskExceptionDetail = (data: {id?: string; taskLogId?: string}) => {
  return http<any>({
    method: "POST",
    url: "/app/exception/queryException",
    data,
  });
};
