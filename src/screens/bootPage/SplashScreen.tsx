// 启动页
import React, {useEffect} from "react";
import {StyleSheet, ImageBackground, StatusBar} from "react-native";
import {StackNavigationProp} from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = {
  navigation: StackNavigationProp<any>;
};

const SplashScreen: React.FC<Props> = ({navigation}) => {
  useEffect(() => {
    const checkAgreement = async () => {
      const isAgreed = await AsyncStorage.getItem("userAgreed");
      if (isAgreed === "true") {
        navigation.replace("Main");
      } else {
        navigation.replace("PrivacyPolicy");
      }
    };

    const timer = setTimeout(() => {
      checkAgreement();
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground source={require("../../assets/images/bootPage/boot.png")} style={styles.container} resizeMode="cover" />
    </>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
});

export default SplashScreen;
