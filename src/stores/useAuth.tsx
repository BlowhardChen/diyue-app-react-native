import {createContext, useContext, useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getUserInfoFromStorage} from "@/utils/auth";
import {UserInfo} from "@/types/user";

interface AuthContextType {
  isLoggedIn: boolean;
  userInfo: UserInfo | null;
  login: (token: string, userInfo: UserInfo) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      const expiresAt = await AsyncStorage.getItem("tokenExpiresAt");
      if (token && expiresAt && Date.now() < Number(expiresAt)) {
        const info = await getUserInfoFromStorage();
        setIsLoggedIn(true);
        setUserInfo(info);
      }
    };
    initAuth();
  }, []);

  // 登录
  const login = async (token: string, member: UserInfo) => {
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("userInfo", JSON.stringify(member));
    setIsLoggedIn(true);
    setUserInfo(userInfo);
  };

  // 退出登录
  const logout = async () => {
    await AsyncStorage.multiRemove(["token", "userInfo"]);
    setIsLoggedIn(false);
    setUserInfo(null);
  };

  return <AuthContext.Provider value={{isLoggedIn, userInfo, login, logout}}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth 必须在 AuthProvider 内使用");
  return context;
};
