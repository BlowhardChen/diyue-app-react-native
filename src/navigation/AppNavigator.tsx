import React from "react";
import {createStackNavigator} from "@react-navigation/stack";
import SplashScreen from "../screens/bootPage/SplashScreen";
import PrivacyPolicyScreen from "../screens/bootPage/PrivacyPolicyScreen";
import BottomTabNavigator from "./BottomTabNavigator";
import ServiceAgreement from "../screens/bootPage/ServiceAgreement";
import PrivacyPolicyDetail from "../screens/bootPage/PrivacyPolicyDetail";
import {RootStackParamList} from "@/types/navigation";

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="ServiceAgreement" component={ServiceAgreement} />
      <Stack.Screen name="PrivacyPolicyDetail" component={PrivacyPolicyDetail} />
      <Stack.Screen name="Main" component={BottomTabNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
