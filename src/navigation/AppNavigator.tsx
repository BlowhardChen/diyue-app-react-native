import React from "react";
import {createStackNavigator} from "@react-navigation/stack";
import SplashScreen from "../screens/bootPage/SplashScreen";
import PrivacyPolicyScreen from "../screens/bootPage/PrivacyPolicyScreen";
import BottomTabNavigator from "./BottomTabNavigator";
import ServiceAgreement from "../screens/bootPage/ServiceAgreement";
import PrivacyPolicyDetail from "../screens/bootPage/PrivacyPolicyDetail";
import {RootStackParamList} from "@/types/navigation";
import LoginScreen from "@/screens/account/LoginScreen";
import RegisterScreen from "@/screens/account/RegisterScreen";
import CodeLoginScreen from "@/screens/account/CodeLoginScreen";
import SetPasswordScreen from "@/screens/account/SetPasswordScreen";
import AccountSettingScreen from "@/screens/account/AccountSettingScreen";
import PersonalInfoScreen from "@/screens/account/PersonalInfoScreen";
import EditPasswordScreen from "@/screens/account/EditPasswordScreen";
import EditUserNameScreen from "@/screens/account/EditUserNameScreen";

type Props = {
  initialRouteName?: keyof RootStackParamList;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC<Props> = ({initialRouteName = "Login"}) => {
  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{headerShown: false}}>
      <Stack.Screen name="EditUserName" component={EditUserNameScreen} />
      <Stack.Screen name="EditPassword" component={EditPasswordScreen} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="AccountSetting" component={AccountSettingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="CodeLogin" component={CodeLoginScreen} />
      <Stack.Screen name="SetPassword" component={SetPasswordScreen} />
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="ServiceAgreement" component={ServiceAgreement} />
      <Stack.Screen name="PrivacyPolicyDetail" component={PrivacyPolicyDetail} />
      <Stack.Screen name="Main" component={BottomTabNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
