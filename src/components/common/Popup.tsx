import React from "react";
import {Modal, View, Text, Image, TouchableOpacity, StyleSheet, TextStyle} from "react-native";

/**
 * Popup 组件的属性接口
 * @interface PopupProps
 * @property {boolean} visible - 控制弹窗是否可见
 * @property {string} [title] - 弹窗的标题文本
 * @property {boolean} [showTitle] - 是否显示弹窗标题
 * @property {string} [msgText] - 弹窗的消息文本
 * @property {boolean} [showLeftBtnText] - 是否显示左侧按钮
 * @property {string} [leftBtnText] - 左侧按钮的文本
 * @property {string} [rightBtnText] - 右侧按钮的文本
 * @property {TextStyle} [rightBtnStyle] - 右侧按钮文本的样式
 * @property {TextStyle} [msgTextStyle] - 消息文本的样式
 * @property {() => void} [onLeftBtn] - 左侧按钮点击事件的回调函数
 * @property {() => void} [onRightBtn] - 右侧按钮点击事件的回调函数
 * @property {React.ReactNode} [children] - 弹窗内容的子组件
 */
interface PopupProps {
  visible: boolean;
  title?: string;
  showTitle?: boolean;
  showIcon?: boolean;
  msgText?: string;
  showLeftBtnText?: boolean;
  leftBtnText?: string;
  rightBtnText?: string;
  rightBtnStyle?: TextStyle;
  msgTextStyle?: TextStyle;
  onLeftBtn?: () => void;
  onRightBtn?: () => void;
  children?: React.ReactNode;
}

/**
 * Popup 组件，用于展示一个模态弹窗
 * @param {PopupProps} props - 组件的属性
 * @returns {JSX.Element} 渲染后的弹窗组件
 */
const Popup: React.FC<PopupProps> = ({
  visible,
  title = "",
  showTitle = true,
  showIcon = false,
  msgText = "",
  showLeftBtnText = true,
  leftBtnText = "",
  rightBtnText = "",
  rightBtnStyle = {},
  msgTextStyle = {},
  onLeftBtn,
  onRightBtn,
  children,
}) => {
  return (
    // 模态弹窗组件，透明背景，根据 visible 属性控制显示，淡入淡出动画
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.popupBox}>
        <View style={styles.popupContent}>
          <View style={styles.popupContentTop}>
            {/* 根据 showTitle 属性决定是否显示标题 */}
            {showTitle && (
              <View style={styles.title}>
                <Text style={styles.titleText}>{title}</Text>
              </View>
            )}
            {showIcon && (
              <View style={styles.icon}>
                <Image source={require("@/assets/images/common/icon-success.png")} style={styles.iconImg} />
              </View>
            )}
            <View style={styles.msg}>
              {/* 显示消息文本，应用默认样式和自定义样式 */}
              <Text style={[styles.msgText, msgTextStyle]}>{msgText}</Text>
            </View>
          </View>

          {/* 渲染子组件 */}
          {children}

          {/* 分割线 */}
          <View style={styles.divider} />

          <View style={styles.popupBottom}>
            {/* 根据 showLeftBtnText 属性决定是否显示左侧按钮 */}
            {showLeftBtnText && (
              <>
                <TouchableOpacity style={styles.btnLeft} onPress={onLeftBtn}>
                  <Text style={styles.leftText}>{leftBtnText}</Text>
                </TouchableOpacity>
                {/* 按钮之间的分割线 */}
                <View style={styles.cross} />
              </>
            )}
            <TouchableOpacity style={styles.btnRight} onPress={onRightBtn}>
              <Text style={[styles.rightText, rightBtnStyle]}>{rightBtnText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// 导出 Popup 组件供其他文件使用
export default Popup;

// 创建样式对象
const styles = StyleSheet.create({
  popupBox: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContent: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
    overflow: "hidden",
    elevation: 4,
  },
  popupContentTop: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 12,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
  },
  icon: {
    marginTop: 12,
    width: 32,
    height: 32,
  },
  iconImg: {
    width: "100%",
    height: "100%",
  },
  msg: {
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  msgText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
    textAlign: "center",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#ededed",
  },
  popupBottom: {
    flexDirection: "row",
    alignItems: "center",
    height: 51,
    width: "100%",
  },
  btnLeft: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  btnRight: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  leftText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
  },
  rightText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#08ae3c",
  },
  cross: {
    width: 1,
    height: 24,
    backgroundColor: "#ededed",
  },
});
