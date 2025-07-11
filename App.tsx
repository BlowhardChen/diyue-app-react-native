import React, {useEffect, useRef, useState} from "react";
import {NavigationContainer} from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import {navigationRef} from "@/navigation/navigationRef";
import {getActiveRouteName} from "@/utils/navigationUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {isTokenValid} from "@/utils/auth";
import {AuthProvider} from "@/stores/useAuth";
import {ActivityIndicator, View} from "react-native";
import {RootStackParamList} from "@/types/navigation";
import {RootSiblingParent} from "react-native-root-siblings"; // ✅ 引入这一行！

export default function App() {
  const routeNameRef = useRef<string>("");
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    const initApp = async () => {
      const agreed = await AsyncStorage.getItem("userAgreed");
      const token = await AsyncStorage.getItem("token");
      console.log("token:", token);
      if (agreed !== "true") {
        setInitialRoute("PrivacyPolicy");
        return;
      }

      const valid = await isTokenValid();
      console.log("token 是否有效:", valid);
      setInitialRoute(valid ? "Main" : "Login");
    };

    initApp();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <RootSiblingParent>
      <AuthProvider>
        <NavigationContainer
          ref={navigationRef}
          onReady={() => {
            routeNameRef.current = initialRoute;
          }}
          onStateChange={state => {
            const previousRouteName = routeNameRef.current;
            const currentRouteName = getActiveRouteName(state!);
            if (previousRouteName !== currentRouteName) {
              console.log("路由切换:", previousRouteName, "→", currentRouteName);
            }
            routeNameRef.current = currentRouteName;
          }}>
          <AppNavigator initialRouteName={initialRoute} />
        </NavigationContainer>
      </AuthProvider>
    </RootSiblingParent>
  );
}
