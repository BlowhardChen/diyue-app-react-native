import React, {ReactNode} from "react";
import {View, Text, TouchableOpacity, StyleSheet, Dimensions} from "react-native";

// 适配 750 设计稿的 rpx 转换
const SCREEN_WIDTH = Dimensions.get("window").width;
const rpx = SCREEN_WIDTH / 750;

// 定义组件属性类型
interface PopupInfoProps {
  title: string; // 弹窗标题
  leftBtnText: string; // 左侧按钮文字
  rightBtnText: string; // 右侧按钮文字
  onLeftBtn: () => void; // 左侧按钮点击回调
  onRightBtn: () => void; // 右侧按钮点击回调
  children?: ReactNode; // 插槽内容（替代原 slot）
}

const PopupInfo: React.FC<PopupInfoProps> = ({title, leftBtnText, rightBtnText, onLeftBtn, onRightBtn, children}) => {
  return (
    <View style={styles.popupBox}>
      {/* 弹窗内容容器 */}
      <View style={styles.popupContent}>
        {/* 弹窗标题区域 */}
        <View style={styles.popupContentTop}>
          <View style={styles.title}>
            <Text style={styles.titleText}>{title}</Text>
          </View>
        </View>

        {children && <View style={styles.slotContent}>{children}</View>}

        {/* 分隔线 */}
        <View style={styles.divider} />

        {/* 底部按钮区域 */}
        <View style={styles.popupBottom}>
          <TouchableOpacity style={styles.btnLeft} onPress={onLeftBtn}>
            <Text style={styles.btnLeftText}>{leftBtnText}</Text>
          </TouchableOpacity>
          <View style={styles.cross} />
          <TouchableOpacity style={styles.btnRight} onPress={onRightBtn}>
            <Text style={styles.btnRightText}>{rightBtnText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// 样式定义
const styles = StyleSheet.create({
  // 遮罩层
  popupBox: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: Dimensions.get("window").height,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1999,
    justifyContent: "center",
    alignItems: "center",
  },
  // 弹窗内容容器
  popupContent: {
    width: 654 * rpx,
    backgroundColor: "#fff",
    borderRadius: 16 * rpx,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: -4 * rpx},
    shadowOpacity: 0.1,
    shadowRadius: 12 * rpx,
    elevation: 5, // Android 阴影
    alignItems: "center",
  },
  // 标题区域
  popupContentTop: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  title: {
    marginTop: 42 * rpx,
  },
  titleText: {
    fontSize: 40 * rpx,
    fontWeight: "500",
    color: "#000",
  },
  // 插槽内容容器（自定义间距）
  slotContent: {
    width: "100%",
    paddingHorizontal: 40 * rpx,
    paddingVertical: 20 * rpx,
  },
  // 分隔线
  divider: {
    width: "100%",
    height: 2 * rpx,
    backgroundColor: "#ededed",
  },
  // 底部按钮区域
  popupBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    height: 102 * rpx,
  },
  // 左侧按钮
  btnLeft: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  btnLeftText: {
    fontSize: 36 * rpx,
    fontWeight: "500",
    color: "#000",
    textAlign: "center",
  },
  // 右侧按钮
  btnRight: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  btnRightText: {
    fontSize: 36 * rpx,
    fontWeight: "500",
    color: "#08ae3c",
    textAlign: "center",
  },
  // 按钮分隔线
  cross: {
    width: 2 * rpx,
    height: 32 * rpx,
    backgroundColor: "#ededed",
  },
});

export default PopupInfo;
