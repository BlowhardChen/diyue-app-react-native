export type RootStackParamList = AuthParamList & MainParamList;

// 启动页&隐私政策&服务协议&隐私政策详情页
export type AuthParamList = {
  Splash: undefined;
  PrivacyPolicy: undefined;
  ServiceAgreement: undefined;
  PrivacyPolicyDetail: undefined;
};

// 主页面（底部导航栏）
export type MainParamList = {
  Main: undefined;
};
