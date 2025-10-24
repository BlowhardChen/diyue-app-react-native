import {http} from "@/utils/http";

/**
 * 合同管理 -获取合同信息详细信息
 */
export const getContractMessageDetail = (data: {landId: string}) => {
  return http({
    method: "POST",
    url: "/app/land/contract/getInfo",
    data,
  });
};
