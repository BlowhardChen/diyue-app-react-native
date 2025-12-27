// 自定义状态栏组件
import React from "react";
import {View, Text, Image, TouchableOpacity, StyleSheet, StatusBar, Platform} from "react-native";

interface NavBarProps {
  navTitle?: string;
  subTitle?: string;
  titleStyle?: object;
  rightIcon?: number; // require(image) 传进来
  rightTitle?: string;
  rightTitleStyle?: object;
  rightBtnColor?: object;
  onBack?: () => void;
  onRightPress?: () => void;
}

const STATUS_BAR_HEIGHT = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0;

const NavBar: React.FC<NavBarProps> = ({
  navTitle = "",
  subTitle = "",
  titleStyle = {},
  rightIcon,
  rightTitle,
  rightTitleStyle = {},
  rightBtnColor = {},
  onBack,
  onRightPress,
}) => {
  return (
    <View style={styles.navbar}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <View style={styles.header}>
        {/* 返回按钮 */}
        <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
          <Image source={require("@/assets/images/common/icon-back-top.png")} style={styles.iconImage} />
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
              <View style={rightTitleStyle}>
                <Text style={[styles.rightBtn, rightBtnColor]}>{rightTitle}</Text>
              </View>
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
    paddingTop: STATUS_BAR_HEIGHT,
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
    fontWeight: "500",
    color: "#000",
    maxWidth: 240,
  },
  subTitle: {
    fontSize: 12,
    color: "#000",
    fontWeight: "500",
    marginTop: 2,
  },
  rightContainer: {
    minWidth: 40,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  rightBtn: {
    fontSize: 14,
  },
});

export default NavBar;
