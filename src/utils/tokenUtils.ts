import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "userToken";
const TOKEN_EXPIRES_AT_KEY = "tokenExpiresAt";
const USER_INFO_KEY = "userInfo";

export const getToken = async () => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const setToken = async (token: string) => {
  // 设置 token 过期时间为 7 天
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(TOKEN_EXPIRES_AT_KEY, expiresAt.toString());
};

export const removeToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
  await AsyncStorage.removeItem(USER_INFO_KEY);
};

export const setUserInfo = async (userInfo: any) => {
  await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
};

export const removeUserInfo = async () => {
  await AsyncStorage.removeItem(USER_INFO_KEY);
};
