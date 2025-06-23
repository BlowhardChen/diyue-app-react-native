import {UserInfo} from "@/types/user";
import {http} from "@/utils/http";

/**
 * 登录 - 账号登录
 */
export const accountLogin = (data: {mobile: string; password: string}) => {
  return http<{member: UserInfo; token: string}>({
    method: "POST",
    url: "/login",
    data,
  });
};

/**
 * 登录-获取验证码
 */
export const getCodeLogin = (data: {mobile: string}) => {
  return http<any>({
    method: "POST",
    url: "/getValidCodeForLogin",
    data,
  });
};

/**
 * 登录-验证码登录
 */
export const codeLogin = (data: {mobile: string; mobileCode: string}) => {
  return http<{member: any; token: string; register?: boolean}>({
    method: "POST",
    url: "/smsLogin",
    data,
  });
};

/**
 * 注册-注册
 */
export const registerAccount = (data: {mobile: string; mobileCode: string; password: string}) => {
  return http<any>({
    method: "POST",
    url: "/register",
    data,
  });
};

/**
 * 注册-获取验证码
 */
export const getCodeRegister = (data: {mobile: string}) => {
  return http<any>({
    method: "POST",
    url: "/getValidCodeForRegister",
    data,
  });
};

/**
 * 注册-设置密码
 */
export const setPassword = (data: {mobile: string; mobileCode: string; password: string}) => {
  return http<any>({
    method: "POST",
    url: "/setPwd",
    data,
  });
};

/**
 * 忘记密码-忘记密码
 */
export const forgotPassword = (data: {mobile: string; mobileCode: string; password: string}) => {
  return http<any>({
    method: "POST",
    url: "/resetPwd",
    data,
  });
};

/**
 * 忘记密码-获取验证码
 */
export const getCodeForgotPwd = (data: {mobile: string}) => {
  return http<any>({
    method: "POST",
    url: "/getValidCodeForRestPwd",
    data,
  });
};

/**
 * 我的-用户信息
 */
export const getUserInfo = () => {
  return http<any>({
    method: "POST",
    url: "/app/user/addUser",
  });
};
