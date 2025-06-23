import {NavigationState, PartialState} from "@react-navigation/native";
import {navigationRef} from "@/navigation/navigationRef";

export function getActiveRouteName(state: NavigationState | PartialState<NavigationState>): string {
  const route = state.routes[state.index || 0];

  if (route.state) {
    // @ts-ignore
    return getActiveRouteName(route.state);
  }

  return route.name;
}

export const navigateToLogin = () => {
  navigationRef.current?.navigate("Login"); // 或根据实际路由结构调整
};
