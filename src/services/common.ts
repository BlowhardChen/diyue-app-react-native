import {http} from "@/utils/http";

// 字典数据列表
export interface DictDataListItem {
  dictLabel: string;
  dictValue: string;
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
