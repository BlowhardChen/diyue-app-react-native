import {AddContractParamsType, ContractListQueryParamsType} from "@/types/contract";
import {http} from "@/utils/http";

/**
 * 新建流转合同 -新建合同
 */
export const addContract = (data: AddContractParamsType) => {
  return http<any>({
    method: "POST",
    url: "/app/land/contract/addLandContract",
    data,
  });
};

/**
 * 新建流转合同 -编辑合同信息
 */
export const editContract = (data: AddContractParamsType) => {
  return http<any>({
    method: "POST",
    url: "/app/land/contract/updateLandContract",
    data,
  });
};

/**
 * 合同管理 -获取合同信息列表
 */
export const getContractInfoList = (data: ContractListQueryParamsType) => {
  return http<any>({
    method: "POST",
    url: "/app/land/contract/queryLandContract",
    data,
  });
};

/**
 * 合同管理 -获取合同信息详细信息
 */
export const getContractInfoDetail = (data: {landId: string}) => {
  return http({
    method: "POST",
    url: "/app/land/contract/getInfo",
    data,
  });
};

/**
 * 合同管理 -作废合同
 */
export const cancelContractInfo = (data: {id: string}) => {
  return http<any>({
    method: "POST",
    url: "/app/land/contract/cancellationContract",
    data,
  });
};

/**
 * 历史合同 -查询历史合同详情
 */
export const getHistoryContractDetail = (id: string) => {
  return http<any>({
    method: "POST",
    url: "/app/land/contract/getContractInfo",
    data: {id},
  });
};

/**
 * 我的地块 -根据地块ID查询合同列表
 */
export const getLandContractList = (data: any) => {
  return http<any>({
    method: "POST",
    url: "/app/land/contract/queryLandContractList",
    data,
  });
};

/**
 * 我的地块 -根据地块ID查询合同列表详情
 */
export const getLandContractDetail = (id: string) => {
  return http<any>({
    method: "POST",
    url: "/app/land/contract/getLandContractInfo",
    data: {id},
  });
};
