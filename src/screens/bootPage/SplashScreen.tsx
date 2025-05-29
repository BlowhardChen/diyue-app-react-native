import React, {useEffect} from "react";
import {StyleSheet, ImageBackground} from "react-native";
import {StackNavigationProp} from "@react-navigation/stack";

type Props = {
  navigation: StackNavigationProp<any>;
};

const SplashScreen: React.FC<Props> = ({navigation}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Main");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ImageBackground source={require("../../assets/images/bootPage/boot.png")} style={styles.container} resizeMode="cover" />
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
});

export default SplashScreen;
