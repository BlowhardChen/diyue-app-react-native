import {NavigationState, PartialState} from "@react-navigation/native";
import {navigationRef} from "@/navigation/navigationRef";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_ROUTE_KEY = "LAST_VISITED_ROUTE";
const TARGET_ROUTE_KEY = "TARGET_ROUTE";

// 获取当前激活的路由名
export function getActiveRouteName(state: NavigationState | PartialState<NavigationState>): string {
  const route = state.routes[state.index || 0];

  if (route.state) {
    // @ts-ignore
    return getActiveRouteName(route.state);
  }

  return route.name;
}

// 跳转到登录页
export const navigateToLogin = () => {
  navigationRef.current?.navigate("Login");
};

// 保存最后访问的路由（自动触发）
export const saveLastRoute = async (routeName: string) => {
  try {
    await AsyncStorage.setItem(LAST_ROUTE_KEY, routeName);
  } catch (e) {
    console.error("保存路由失败:", e);
  }
};

// 获取最后访问的路由
export const getLastRoute = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(LAST_ROUTE_KEY);
  } catch (e) {
    console.error("读取路由失败:", e);
    return null;
  }
};

// 保存一个目标路由（手动触发）
export const saveTargetRoute = async (routeName: string, parent: string = "Main") => {
  try {
    const data = JSON.stringify({parent, screen: routeName});
    await AsyncStorage.setItem(TARGET_ROUTE_KEY, data);
  } catch (e) {
    console.error("保存目标路由失败:", e);
  }
};

// 获取目标路由
export const getTargetRoute = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TARGET_ROUTE_KEY);
  } catch (e) {
    console.error("读取目标路由失败:", e);
    return null;
  }
};

// 清除目标路由（手动触发）
export const clearTargetRoute = async () => {
  try {
    await AsyncStorage.removeItem(TARGET_ROUTE_KEY);
  } catch (e) {
    console.error("清除目标路由失败:", e);
  }
};

// 跳转到目标路由（如果存在）
export const navigateToTargetRoute = async () => {
  try {
    const targetRoute = await getTargetRoute();
    console.log("目标路由:", targetRoute);
    if (!targetRoute) {
      console.log("没有记录的目标路由");
      return;
    }

    const parsed = JSON.parse(targetRoute);

    if (typeof parsed === "string") {
      navigationRef.current?.navigate(parsed as never);
    } else if (parsed.parent && parsed.screen) {
      (navigationRef.current as any)?.navigate(parsed.parent, {
        screen: parsed.screen,
      });
    } else {
      console.warn("目标路由格式不正确:", parsed);
    }
  } catch (e) {
    console.error("跳转到目标路由失败:", e);
  }
};
