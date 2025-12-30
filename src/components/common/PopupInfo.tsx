import {Global} from "@/styles/global";
import React, {ReactNode} from "react";
import {View, Text, TouchableOpacity, StyleSheet, Image} from "react-native";

// 定义组件属性类型
interface PopupInfoProps {
  title: string; // 弹窗标题
  leftBtnText: string; // 左侧按钮文字
  rightBtnText: string; // 右侧按钮文字
  onLeftBtn: () => void; // 左侧按钮点击回调
  onRightBtn: () => void; // 右侧按钮点击回调
  onClosePopup: () => void; // 关闭弹窗回调
  children?: ReactNode; // 插槽内容
  showCloseBtn?: boolean; // 是否显示关闭按钮
}

const PopupInfo: React.FC<PopupInfoProps> = ({
  title,
  leftBtnText,
  rightBtnText,
  onLeftBtn,
  onRightBtn,
  onClosePopup,
  children,
  showCloseBtn = false,
}) => {
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
        {showCloseBtn && (
          <View>
            <TouchableOpacity style={styles.closePopupBtn} onPress={onClosePopup}>
              <Image
                source={require("@/assets/images/my/icon-close-popup.png")}
                style={styles.closePopupIcon}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        )}
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
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1999,
    justifyContent: "center",
    alignItems: "center",
  },
  // 弹窗内容容器
  popupContent: {
    width: 327,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: -2},
    elevation: 5,
    alignItems: "center",
  },
  // 标题区域
  popupContentTop: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  title: {
    marginTop: 21,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
  },
  // 插槽内容容器（自定义间距）
  slotContent: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  // 分隔线
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#ededed",
  },
  // 底部按钮区域
  popupBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    height: 51,
  },
  // 左侧按钮
  btnLeft: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  btnLeftText: {
    fontSize: 18,
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
    fontSize: 18,
    fontWeight: "500",
    color: "#08ae3c",
    textAlign: "center",
  },
  // 按钮分隔线
  cross: {
    width: 1,
    height: 16,
    backgroundColor: "#ededed",
  },
  closePopupBtn: {
    position: "absolute",
    top: 20,
    right: 0,
    transform: [{translateX: 15}],
    width: 32,
    height: 32,
  },
  closePopupIcon: {
    width: "100%",
    height: "100%",
  },
});

export default PopupInfo;
