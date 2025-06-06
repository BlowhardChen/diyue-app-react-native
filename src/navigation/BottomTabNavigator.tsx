import React, {useCallback} from "react";
import {createBottomTabNavigator, BottomTabNavigationOptions} from "@react-navigation/bottom-tabs";
import {Image, StyleSheet, ImageSourcePropType, Pressable, PressableProps} from "react-native";
import {RouteProp} from "@react-navigation/native";
import LandManagementScreen from "../screens/tabBarPage/LandManagementScreen";
import MyScreen from "../screens/tabBarPage/MyScreen";
import FarmManagementScreen from "../screens/tabBarPage/FarmManagementScreen";
import FarmSuppliesScreen from "../screens/tabBarPage/FarmSuppliesScreen";

// 底部导航的参数类型
type TabParamList = {
  LandManagement: undefined;
  FarmManagement: undefined;
  FarmSupplies: undefined;
  My: undefined;
};

// Tab 实例
const Tab = createBottomTabNavigator<TabParamList>();

// 图片资源
const tabIcons: Record<keyof TabParamList, {active: ImageSourcePropType; inactive: ImageSourcePropType}> = {
  LandManagement: {
    active: require("../assets/tabBar/land_green.png"),
    inactive: require("../assets/tabBar/land_black.png"),
  },
  FarmManagement: {
    active: require("../assets/tabBar/tractor_green.png"),
    inactive: require("../assets/tabBar/tractor_black.png"),
  },
  FarmSupplies: {
    active: require("../assets/tabBar/barn_green.png"),
    inactive: require("../assets/tabBar/barn_black.png"),
  },
  My: {
    active: require("../assets/tabBar/my_green.png"),
    inactive: require("../assets/tabBar/my_black.png"),
  },
};

// TabBarIcon 组件
interface TabBarIconProps {
  iconSource: ImageSourcePropType;
}
const TabBarIcon: React.FC<TabBarIconProps> = ({iconSource}) => (
  <Image source={iconSource} style={styles.tabIcon} resizeMode="contain" />
);

const CustomTabBarButton: React.FC<PressableProps> = props => <Pressable {...props} android_ripple={null} />;

// 外部的 tabBarIcon 渲染函数
const renderTabBarIcon =
  (routeName: keyof TabParamList) =>
  ({focused}: {focused: boolean}) => {
    const iconConfig = tabIcons[routeName];
    const iconSource = focused ? iconConfig.active : iconConfig.inactive;
    return <TabBarIcon iconSource={iconSource} />;
  };

const BottomTabNavigator: React.FC = () => {
  // 记忆化 screenOptions
  const screenOptions = useCallback(
    ({route}: {route: RouteProp<TabParamList, keyof TabParamList>}): BottomTabNavigationOptions => ({
      tabBarIcon: renderTabBarIcon(route.name),
      tabBarActiveTintColor: "#4CAF50",
      tabBarInactiveTintColor: "#333",
      tabBarLabelStyle: {
        fontSize: 12,
        marginBottom: 3,
      },
      tabBarStyle: {
        height: 60,
        paddingTop: 5,
        backgroundColor: "#fff",
      },
      tabBarButton: props => <CustomTabBarButton {...props} />,
    }),
    [],
  );

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="LandManagement" component={LandManagementScreen} options={{title: "土地管理"}} />
      <Tab.Screen name="FarmManagement" component={FarmManagementScreen} options={{title: "农事管理"}} />
      <Tab.Screen name="FarmSupplies" component={FarmSuppliesScreen} options={{title: "农资商城"}} />
      <Tab.Screen name="My" component={MyScreen} options={{title: "我的"}} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    width: 24,
    height: 24,
  },
});

export default BottomTabNavigator;
