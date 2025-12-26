// 新增合同接口参数
export interface AddContractParamsType {
  id?: string;
  landId: string; // 地块ID
  termOfLease: number; // 租赁期限
  startTime: string; // 开始时间
  endTime: string; // 结束时间
  perAcreAmount: number; // 每亩价格
  totalAmount: number; // 合同总金额
  paymentAmount: number; // 付款金额
  paymentMethod: string; // 付款方式
  actualAcreNum: number; // 实际地块亩数
  gpsList: {lat: number; lng: number}[]; // 地块坐标
  province: string; // 省
  city: string; // 市
  district: string; // 县(区)
  township?: string; // 街道(乡镇)
  administrativeVillage?: string; // 行政村
  detailaddress: string; // 详细地址
  relename: string; // 真实姓名
  cardid: string; // 身份证
  mobile: string; // 手机号码
  bankAccount: string; // 银行卡号
  openBank?: string; // 开户行
  times: Array<{paymentTime: string}>; // 付款日期
}

// 合同列表查询参数
export interface ContractListQueryParamsType {
  contracStatus: string; // 合同状态
  cardid?: string; // 身份证
  bankAccount?: string; // 银行卡号
  relename?: string; // 真实姓名
  mobile?: string; // 手机号码
  contractNo?: string; // 合同编号
  startTime?: string; // 开始时间 yyyy-MM-dd
  endTime?: string; // 结束时间 yyyy-MM-dd
  startAcreageNum?: number; // 开始地块亩数
  endAcreageNum?: number; // 结束地块亩数
  province?: string; // 省
  city?: string; // 市
  district?: string; // 县(区)
  detailaddress?: string; // 详细地址
  pageNum: number; // 当前页
  pageSize: number; // 每页显示多少条
}

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
  gpsList: string[];
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
  gpsList: string;
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

export interface ContractListItemType {
  id: string; // 合同id
  landId: string; // 地块ID
  contractNo: string; // 合同编号
  termOfLease: number; // 租赁期限
  startTime: string; // 开始时间 yyyy-MM-dd
  endTime: string; // 结束时间 yyyy-MM-dd
  perAcreAmount: number; // 每亩价格
  totalAmount: number; // 合同总金额
  paymentAmount: number; // 付款金额
  paymentMethod: string; // 付款方式
  actualAcreNum: number; // 实际地块亩数
  landGps: string; // 地块坐标
  gpsList: {lat: number; lng: number}[]; // 地块坐标
  province: string; // 省
  city: string; // 市
  district: string; // 县(区)
  township: string; // 街道(乡镇)
  administrativeVillage: string; // 行政村
  detailaddress: string; // 详细地址
  relename: string; // 真实姓名
  cardid: string; // 身份证
  mobile: string; // 手机号码
  bankAccount: string; // 银行卡号
  openBank: string; // 开户行
  times: Array<{paymentTime: string}>; // 付款日期
  createTime: string; // 创建时间 yyyy-MM-dd HH:mm:ss
  createName: string; // 创建人
  phone: string; // 手机号
  createBy: string; // 创建人ID
  cancellationName: string; // 作废人
  cancellationTime: string; // 作废时间
}
