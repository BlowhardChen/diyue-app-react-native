import {createContext, useContext, useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getUserInfoFromStorage} from "@/utils/auth";
import {UserInfo} from "@/types/user";
import {getToken, removeToken, setToken} from "@/utils/tokenUtils";

interface AuthContextType {
  isLoggedIn: boolean;
  login: (token: string, userInfo: UserInfo) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = await getToken();
      const expiresAt = await AsyncStorage.getItem("tokenExpiresAt");
      if (token && expiresAt && Date.now() < Number(expiresAt)) {
        const info = await getUserInfoFromStorage();
        setIsLoggedIn(true);
      }
    };
    initAuth();
  }, []);

  // 登录
  const login = async (token: string) => {
    await setToken(token);
    setIsLoggedIn(true);
  };

  // 退出登录
  const logout = async () => {
    await removeToken();
    setIsLoggedIn(false);
  };

  return <AuthContext.Provider value={{isLoggedIn, login, logout}}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth 必须在 AuthProvider 内使用");
  return context;
};
