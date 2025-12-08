import {http} from "@/utils/http";

// 字典数据列表
export interface DictDataListItem {
  dictCode: number;
  dictType: string;
  dictLabel: string;
  dictValue: string;
  cssClass: string;
  listClass: string;
  default: boolean;
  isDefault: string;
  params: object;
  remark: string | null;
  searchValue: string;
  status: string;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
}

/**
 * 数据字典接口
 */
export const dictDataList = (data: {dictType: string}) => {
  return http<DictDataListItem[]>({
    method: "POST",
    url: "/app/sys/dict/data/sysDictDataList",
    data,
  });
};
