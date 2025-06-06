import React from "react";
import {View, Text, Image, TouchableOpacity, StyleSheet, StatusBar} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";

interface NavBarProps {
  navTitle?: string;
  subTitle?: string;
  titleStyle?: object;
  rightIcon?: number; // require(image) 传进来
  rightTitle?: string;
  rightTitleStyle?: object;
  onBack?: () => void;
  onRightPress?: () => void;
}

const NavBar: React.FC<NavBarProps> = ({
  navTitle = "",
  subTitle = "",
  titleStyle = {},
  rightIcon,
  rightTitle,
  rightTitleStyle = {},
  onBack,
  onRightPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.navbar, {paddingTop: insets.top}]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={styles.header}>
        {/* 返回按钮 */}
        <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
          <Image
            source={require("../../assets/images/common/icon-back-top.png")} // 替换为你的本地路径
            style={styles.iconImage}
          />
        </TouchableOpacity>

        {/* 中间标题 */}
        <View style={styles.titleContainer}>
          <Text numberOfLines={1} style={[styles.title, titleStyle]}>
            {navTitle}
          </Text>
          {subTitle ? (
            <Text numberOfLines={1} style={styles.subTitle}>
              ({subTitle})
            </Text>
          ) : null}
        </View>

        {/* 右侧图标或按钮 */}
        <View style={styles.rightContainer}>
          {rightIcon ? (
            <TouchableOpacity onPress={onRightPress}>
              <Image source={rightIcon} style={styles.iconImage} />
            </TouchableOpacity>
          ) : rightTitle ? (
            <TouchableOpacity onPress={onRightPress}>
              <Text style={[styles.rightBtn, rightTitleStyle]}>{rightTitle}</Text>
            </TouchableOpacity>
          ) : (
            <View style={{width: 40}} /> // 占位
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: "#fff",
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "space-between",
    position: "relative",
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  iconImage: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  titleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    maxWidth: 240,
  },
  subTitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  rightContainer: {
    width: 40,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  rightBtn: {
    fontSize: 14,
    color: "#007AFF",
  },
});

export default NavBar;
