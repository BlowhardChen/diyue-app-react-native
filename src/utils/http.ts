import axios, {AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse} from "axios";
import {getToken, removeToken} from "./tokenUtils";
import {navigateToLogin} from "./navigationUtils";
import {showCustomToast} from "@/components/common/CustomToast";

// 接口返回结构
export interface ApiResponse<T = any> {
  code: number | string;
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

// 响应拦截器（这里保持返回 AxiosResponse<ApiResponse<T>>）
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    const res = response.data;
    const errorCodes = [-1, -2, -3, -4, -5, -6, -7, -8, -9];

    if (response.status >= 200 && response.status < 300) {
      if (res.code === 200 || res.code === "200") {
        return response;
      } else if (errorCodes.includes(Number(res.code))) {
        showCustomToast("error", res.msg);
        return Promise.reject(response);
      } else {
        showCustomToast("error", res.msg);
        return Promise.reject(response);
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

/**
 * 返回完整 ApiResponse<T>
 */
export const httpResponse = async <T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  const response = await instance.request<ApiResponse<T>>(config);
  return response.data;
};

/**
 * 只返回 data 部分
 */
export const http = async <T = any>(config: AxiosRequestConfig): Promise<{data: T}> => {
  const response = await instance.request<ApiResponse<T>>(config);
  return {data: response.data.data};
};
