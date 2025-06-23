import AsyncStorage from "@react-native-async-storage/async-storage";

export const isTokenValid = async (): Promise<boolean> => {
  const token = await AsyncStorage.getItem("token");
  return !!token;
};

export const getUserInfoFromStorage = async () => {
  const userInfoStr = await AsyncStorage.getItem("userInfo");
  return userInfoStr ? JSON.parse(userInfoStr) : null;
};
