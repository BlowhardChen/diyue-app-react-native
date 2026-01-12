import React from "react";
import {CardStyleInterpolators, createStackNavigator} from "@react-navigation/stack";
import SplashScreen from "../screens/bootPage/SplashScreen";
import PrivacyPolicyScreen from "../screens/bootPage/PrivacyPolicyScreen";
import BottomTabNavigator from "./BottomTabNavigator";
import {RootStackParamList} from "@/types/navigation";
import LoginScreen from "@/screens/account/LoginScreen";
import RegisterScreen from "@/screens/account/RegisterScreen";
import CodeLoginScreen from "@/screens/account/CodeLoginScreen";
import SetPasswordScreen from "@/screens/account/SetPasswordScreen";
import AccountSettingScreen from "@/screens/account/AccountSettingScreen";
import PersonalInfoScreen from "@/screens/account/PersonalInfoScreen";
import EditPasswordScreen from "@/screens/account/EditPasswordScreen";
import EditUserNameScreen from "@/screens/account/EditUserNameScreen";
import AddDeviceScreen from "@/screens/device/AddDeviceScreen";
import EnclosureScreen from "@/screens/land/EnclosureScreen";
import CurrentConnectScreen from "@/screens/device/CurrentConnectScreen";
import ManualInputScreen from "@/screens/device/ManualInputScreen";
import BluetoothConnectScreen from "@/screens/device/BluetoothConnectScreen";
import DifferentialConfigScreen from "@/screens/device/DifferentialConfigScreen";
import DataUploadScreen from "@/screens/device/DataUploadScreen";
import ServiceAgreementScreen from "../screens/bootPage/ServiceAgreementScreen";
import PrivacyPolicyDetailScreen from "../screens/bootPage/PrivacyPolicyDetailScreen";
import LandInfoEditScreen from "@/screens/land/LandInfoEditScreen";
import OcrCardScannerScreen from "@/screens/land/OcrCardScannerScreen";
import LandDetailScreen from "@/screens/land/LandDetailScreen";
import QuitLandScreen from "@/screens/land/QuitLandScreen";
import SelectLandScreen from "@/screens/land/SelcetLandScreen";
import MergeLandScreen from "@/screens/land/MergeLandScreen";
import FindLandDetailScreen from "@/screens/land/FindLandDetailScreen";
import FindPointScreen from "@/screens/land/FindPointScreen";
import AddFarmScreen from "@/screens/farming/AddFarmScreen";
import FarmMapScreen from "@/screens/farming/FarmMapScreen";
import MechanicalTaskScreen from "@/screens/farming/MechanicalTaskScreen";
import PatrolFieldManageScreen from "@/screens/farming/PatrolFieldManageScreen";
import FarmDataCalculatorScreen from "@/screens/farming/FarmDataCalculatorScreen";
import ContractManageScreen from "@/screens/contract/ContractManageScreen";
import AddContractScreen from "@/screens/contract/AddContractScreen";
import ElectronicContractScreen from "@/screens/contract/ElectronicContractScreen";
import ContractDetailScreen from "@/screens/contract/ContractDetailScreen";
import AbnormalRecordScreen from "@/screens/patrol/AbnormalRecordScreen";
import AbnormalDetailScreen from "@/screens/patrol/AbnormalDetailScreen";
import AbnormalUploadScreen from "@/screens/patrol/AbnormalUploadScreen";
import MarkPositionScreen from "@/screens/patrol/MarkPositionScreen";
import PatrolDetailScreen from "@/screens/patrol/PatrolDetailScreen";

type Props = {
  initialRouteName?: keyof RootStackParamList;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC<Props> = ({initialRouteName = "Login"}) => {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        gestureEnabled: true, // 启用手势返回
        gestureDirection: "horizontal", // 手势方向
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // iOS风格水平滑动
        transitionSpec: {
          open: {
            animation: "spring",
            config: {
              stiffness: 1000,
              damping: 500,
              mass: 3,
              overshootClamping: true,
              restDisplacementThreshold: 0.01,
              restSpeedThreshold: 0.01,
            },
          },
          close: {
            animation: "spring",
            config: {
              stiffness: 1000,
              damping: 500,
              mass: 3,
              overshootClamping: true,
              restDisplacementThreshold: 0.01,
              restSpeedThreshold: 0.01,
            },
          },
        },
      }}>
      <Stack.Screen name="PatrolDetail" component={PatrolDetailScreen} />
      <Stack.Screen name="MarkPosition" component={MarkPositionScreen} />
      <Stack.Screen name="AbnormalUpload" component={AbnormalUploadScreen} />
      <Stack.Screen name="AbnormalDetail" component={AbnormalDetailScreen} />
      <Stack.Screen name="AbnormalRecord" component={AbnormalRecordScreen} />
      <Stack.Screen name="ContractDetail" component={ContractDetailScreen} />
      <Stack.Screen name="ElectronicContract" component={ElectronicContractScreen} />
      <Stack.Screen name="AddContract" component={AddContractScreen} />
      <Stack.Screen name="ContractManage" component={ContractManageScreen} />
      <Stack.Screen name="FarmDataCalculator" component={FarmDataCalculatorScreen} />
      <Stack.Screen name="PatrolFieldManage" component={PatrolFieldManageScreen} />
      <Stack.Screen name="MechanicalTask" component={MechanicalTaskScreen} />
      <Stack.Screen name="FarmMap" component={FarmMapScreen} />
      <Stack.Screen name="AddFarm" component={AddFarmScreen} />
      <Stack.Screen name="FindPoint" component={FindPointScreen} />
      <Stack.Screen name="FindLandDetail" component={FindLandDetailScreen} />
      <Stack.Screen name="MergeLand" component={MergeLandScreen} />
      <Stack.Screen name="SelectLand" component={SelectLandScreen} />
      <Stack.Screen name="QuitLand" component={QuitLandScreen} />
      <Stack.Screen name="LandDetail" component={LandDetailScreen} />
      <Stack.Screen name="OcrCardScanner" component={OcrCardScannerScreen} />
      <Stack.Screen name="LandInfoEdit" component={LandInfoEditScreen} />
      <Stack.Screen name="DataUpload" component={DataUploadScreen} />
      <Stack.Screen name="DifferentialConfig" component={DifferentialConfigScreen} />
      <Stack.Screen name="BluetoothConnect" component={BluetoothConnectScreen} />
      <Stack.Screen name="ManualInput" component={ManualInputScreen} />
      <Stack.Screen name="CurrentConnect" component={CurrentConnectScreen} />
      <Stack.Screen name="Enclosure" component={EnclosureScreen} />
      <Stack.Screen name="AddDevice" component={AddDeviceScreen} />
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
      <Stack.Screen name="ServiceAgreement" component={ServiceAgreementScreen} />
      <Stack.Screen name="PrivacyPolicyDetail" component={PrivacyPolicyDetailScreen} />
      <Stack.Screen name="Main" component={BottomTabNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
