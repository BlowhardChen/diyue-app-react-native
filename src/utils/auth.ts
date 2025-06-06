import AsyncStorage from "@react-native-async-storage/async-storage";

export const isTokenValid = async (): Promise<boolean> => {
  const token = await AsyncStorage.getItem("token");
  const expiresAt = await AsyncStorage.getItem("tokenExpiresAt");

  if (!token || !expiresAt) return false;

  const now = Date.now();
  return now < Number(expiresAt);
};
