import AsyncStorage from "@react-native-async-storage/async-storage";

export const isTokenValid = async (): Promise<boolean> => {
  const token = await AsyncStorage.getItem("userToken");
  const expiresAt = await AsyncStorage.getItem("tokenExpiresAt");
  return !!(token && expiresAt && Date.now() < Number(expiresAt));
};

export const getUserInfoFromStorage = async () => {
  const userInfoStr = await AsyncStorage.getItem("userInfo");
  return userInfoStr ? JSON.parse(userInfoStr) : null;
};
