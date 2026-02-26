import {NavigationState, PartialState, StackActions} from "@react-navigation/native";
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

// 保存目标路由时，增加 params 参数（支持上级路由也带参数，或仅目标路由带参数）
export const saveTargetRoute = async (
  routeName: string,
  parentChain?: string[],
  params?: Record<string, any>,
  parentParams?: Record<string, any>[],
) => {
  try {
    // 关键修复1：过滤parentChain中的空值，设置默认值避免undefined
    const filteredParentChain = (parentChain || []).filter(name => name && name.trim() !== "");
    // 关键修复2：parentParams与parentChain长度对齐，避免参数越界
    const alignedParentParams = (parentParams || []).slice(0, filteredParentChain.length);

    const data = JSON.stringify({
      screen: routeName,
      parentChain: filteredParentChain, // 存储过滤后的上级路由
      params: params || {}, // 默认空对象，避免undefined
      parentParams: alignedParentParams || [], // 默认空数组，避免undefined
    });
    await AsyncStorage.setItem(TARGET_ROUTE_KEY, data);
  } catch (e) {
    console.error("保存目标路由失败:", e);
  }
};

// 获取目标路由
export const getTargetRoute = async (): Promise<{
  screen: string;
  parentChain: string[];
  params: Record<string, any>;
  parentParams: Record<string, any>[];
} | null> => {
  try {
    const rawData = await AsyncStorage.getItem(TARGET_ROUTE_KEY);
    if (!rawData) return null;
    const parsedData = JSON.parse(rawData);
    // 兜底：确保解析后的数据结构完整，避免空值
    return {
      screen: parsedData.screen || "",
      parentChain: parsedData.parentChain || [],
      params: parsedData.params || {},
      parentParams: parsedData.parentParams || [],
    };
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

// 跳转到目标路由时，携带参数
export const navigateToTargetRoute = async () => {
  try {
    const targetRoute = await getTargetRoute();
    if (!targetRoute || !targetRoute.screen) {
      console.log("没有记录的目标路由或路由名称为空");
      return;
    }

    const {screen, parentChain, params, parentParams} = targetRoute;

    // 处理LandManagement特殊逻辑
    if (screen === "LandManagement") {
      navigationRef.current?.reset({
        index: 0,
        routes: [{name: "Main"}],
      });
      return;
    }

    console.log("目标路由:", screen, parentChain, params, parentParams);

    // 处理tabbar上级路由（Main）的场景
    let newRoutes: string | any[] = [];
    if (screen === "Enclosure") {
      // Enclosure的上级是tabbar首页Main，直接构建 [Main, Enclosure] 路由栈
      newRoutes = [
        {name: "Main", params: {}}, // tabbar路由
        {name: "Enclosure", params: params || {}},
      ];
    } else if (screen && parentChain && parentChain.length > 0) {
      // 普通多级路由场景：构建带参数的路由栈
      newRoutes = parentChain
        .map((name, index) => ({
          name,
          params: parentParams[index] || {},
        }))
        .concat([
          {
            name: screen,
            params: params || {},
          },
        ]);
    }

    // 执行路由重置
    if (newRoutes.length > 0) {
      navigationRef.current?.reset({
        index: newRoutes.length - 1,
        routes: newRoutes,
      });
      return;
    }

    // 无上级路由的场景：直接替换当前路由
    if (screen) {
      navigationRef.current?.dispatch(StackActions.replace(screen, params || {}));
    }
  } catch (e) {
    console.error("跳转到目标路由失败:", e);
  }
};

// 手动触发精准跳转时
export const navigateToSpecificRoute = (
  routeName: string,
  parentChain: string[],
  params: Record<string, any> = {},
  parentParams: Record<string, any>[] = [],
) => {
  // 过滤parentChain空值，避免无效路由
  const filteredParentChain = (parentChain || []).filter(name => name && name.trim() !== "");
  const alignedParentParams = (parentParams || []).slice(0, filteredParentChain.length);

  // 处理Enclosure（tabbar首页下级路由）的特殊逻辑
  let newRoutes = [];
  if (routeName === "Enclosure") {
    newRoutes = [
      {name: "Main", params: {}},
      {name: "Enclosure", params: params || {}},
    ];
  } else {
    // 普通路由构建逻辑
    newRoutes = filteredParentChain
      .map((name, index) => ({
        name,
        params: alignedParentParams[index] || {},
      }))
      .concat([
        {
          name: routeName,
          params: params || {},
        },
      ]);
  }

  navigationRef.current?.reset({
    index: newRoutes.length - 1,
    routes: newRoutes,
  });
};
