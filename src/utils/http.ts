import axios, {AxiosRequestConfig, InternalAxiosRequestConfig} from "axios";
import {Alert} from "react-native";
import {getToken, removeToken} from "./tokenUtils";
import {navigateToLogin} from "./navigationUtils";
import {showCustomToast} from "@/components/common/CustomToast";

// 接口返回结构
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

const baseURL = "http://60.205.213.205:8091";

const instance = axios.create({
  baseURL,
  timeout: 60000,
});

// 请求拦截器
instance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getToken();
    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error),
);

// 响应拦截器
instance.interceptors.response.use(
  response => {
    const res = response.data;
    const errorCodes = [-1, -2, -3, -4, -5, -6, -7, -8, -9];

    if (response.status >= 200 && response.status < 300) {
      if (res.code === 200 || res.code === "200") {
        return res;
      } else if (errorCodes.includes(Number(res.code))) {
        showCustomToast("error", res.msg);
        return Promise.reject(res);
      } else {
        showCustomToast("error", res.msg);
        return Promise.reject(res);
      }
    } else if (response.status === 401) {
      removeToken();
      navigateToLogin();
      return Promise.reject(response);
    } else {
      showCustomToast("error", res.msg || "服务器错误");
      return Promise.reject(response);
    }
  },
  error => {
    showCustomToast("error", "网络错误,请检查网络或稍后重试");
    return Promise.reject(error);
  },
);

// 统一导出方法
export const http = <T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  return instance.request<ApiResponse<T>>(config).then(res => res.data);
};
