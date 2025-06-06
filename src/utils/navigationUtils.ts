import {NavigationState, PartialState} from "@react-navigation/native";

export function getActiveRouteName(state: NavigationState | PartialState<NavigationState>): string {
  const route = state.routes[state.index || 0];

  if (route.state) {
    // @ts-ignore
    return getActiveRouteName(route.state);
  }

  return route.name;
}
