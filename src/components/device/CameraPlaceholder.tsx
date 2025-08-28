import React, {useEffect, useRef} from "react";
import {View, Animated, Easing, StyleSheet, ImageBackground, Image} from "react-native";

const CameraPlaceholder = () => {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animation]);

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 250], // 扫描框的高度，需要和样式保持一致
  });

  return (
    <View style={styles.container}>
      <ImageBackground source={require("@/assets/images/device/web-camera-bg.png")} style={styles.frame} resizeMode="stretch">
        {/* 扫描线 */}
        <Animated.Image
          source={require("@/assets/images/device/scan-line.png")}
          style={[styles.scanLine, {transform: [{translateY}]}]}
          resizeMode="contain"
        />
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  frame: {
    width: 250, // 扫描框宽度
    height: 250, // 扫描框高度
    justifyContent: "flex-start",
    overflow: "hidden",
  },
  scanLine: {
    width: "100%",
    height: 4, // 扫描线高度
  },
});

export default CameraPlaceholder;
