// 定义合同详情类型
export interface ContractDetail {
  actualAcreNum: number;
  administrativeVillage: string;
  bankAccount: string;
  cardid: string;
  city: string;
  contracStatus: string;
  contractNo: string;
  contractType: string;
  createMobile: string;
  createName: string;
  createTime: string;
  detailaddress: string;
  dictLabel: string;
  dictValue: string;
  district: string;
  endAcreageNum: number;
  endTime: string;
  gpsList: string[];
  id: string;
  landGps: string[];
  landId: string;
  mobile: string;
  openBank: string;
  paymentAmount: number;
  paymentMethod: string;
  perAcreAmount: number;
  province: string;
  relename: string;
  startAcreageNum: number;
  startTime: string;
  status: string;
  termOfLease: number;
  totalAmount: number;
  township: number;
}

// 定义添加合同参数类型
export interface AddContractParamsType {
  id: string;
  landId: string;
  termOfLease: number;
  actualAcreNum: number;
  startTime: string;
  endTime: string;
  perAcreAmount: number;
  totalAmount: number;
  paymentAmount: number;
  paymentMethod: string;
  relename: string;
  cardid: string;
  bankAccount: string;
  openBank: string;
  mobile: string;
  landGps: string;
  province: string;
  city: string;
  district: string;
  township: string;
  administrativeVillage: string;
  detailaddress: string;
  times: Array<{paymentTime: string}>;
}

// 定义合同缓存参数类型
export interface ContractCacheParams {
  startTime: string;
  endTime: string;
  perAcreAmount: number;
  paymentMethod: string;
  dictLabel: string;
  times: Array<{paymentTime: string}>;
}

// 定义季度数据类型
interface QuarterItem {
  label: string;
  value: string;
  months: string;
  [key: string]: any;
}
