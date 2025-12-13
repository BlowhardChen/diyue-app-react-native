// 中心弹窗组件（扫描银行卡/身份证）
import React from "react";
import {View, Text, TouchableOpacity, StyleSheet, Dimensions} from "react-native";

// 适配 750 设计稿的 rpx 转换
const SCREEN_WIDTH = Dimensions.get("window").width;
const rpx = SCREEN_WIDTH / 750;

// 定义 OCR 信息类型
interface OcrInfoType {
  bankName?: string;
  cardNumber?: string;
  name?: string;
  idNumber?: string;
  bankAccount?: string;
  [key: string]: any;
}

// 定义组件属性类型
interface PopupBoxProps {
  msgText: string; // 弹窗标题（银行卡信息/身份证信息）
  ocrInfo: OcrInfoType; // OCR 识别信息
  onLeftBtn: () => void; // 取消按钮回调
  onRightBtn: () => void; // 确定按钮回调
}

const PopupBox: React.FC<PopupBoxProps> = ({msgText, ocrInfo, onLeftBtn, onRightBtn}) => {
  // 格式化银行卡号（每4位加空格）
  const formatBankCardNumber = (cardNumber: string = "") => {
    return cardNumber.replace(/(.{4})/g, "$1 ").trim();
  };

  return (
    <View style={styles.popupBox}>
      {/* 弹窗内容容器 */}
      <View style={styles.popupContent}>
        {/* 弹窗标题 */}
        <View style={styles.popupContentTop}>
          <View style={styles.msg}>
            <Text style={styles.msgText}>{msgText}</Text>
          </View>
        </View>

        {/* 银行卡信息展示 */}
        {msgText === "银行卡信息" && (
          <View style={styles.popupContentMain}>
            <View style={styles.msgItem}>
              <Text style={styles.label}>卡类型：</Text>
              <Text style={styles.text}>{ocrInfo.bankName || ""} 储蓄卡</Text>
            </View>
            <View style={styles.msgItem}>
              <Text style={styles.label}>卡号：</Text>
              <Text style={styles.text}>{formatBankCardNumber(ocrInfo.cardNumber)}</Text>
            </View>
          </View>
        )}

        {/* 身份证信息展示 */}
        {msgText === "身份证信息" && (
          <View style={styles.popupContentMain}>
            <View style={styles.msgItem}>
              <Text style={styles.label}>姓名：</Text>
              <Text style={styles.text}>{ocrInfo.name || ""}</Text>
            </View>
            <View style={styles.msgItem}>
              <Text style={styles.label}>身份证号：</Text>
              <Text style={styles.text}>{ocrInfo.idNumber || ""}</Text>
            </View>
            {ocrInfo.bankAccount && (
              <View style={styles.msgItem}>
                <Text style={styles.label}>卡号：</Text>
                <Text style={styles.text}>{formatBankCardNumber(ocrInfo.bankAccount)}</Text>
              </View>
            )}
          </View>
        )}

        {/* 分隔线 */}
        <View style={styles.divider} />

        {/* 底部按钮区域 */}
        <View style={styles.popupBottom}>
          <TouchableOpacity style={styles.btnLeft} onPress={onLeftBtn}>
            <Text style={styles.btnLeftText}>取消</Text>
          </TouchableOpacity>
          <View style={styles.cross} />
          <TouchableOpacity style={styles.btnRight} onPress={onRightBtn}>
            <Text style={styles.btnRightText}>确定</Text>
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
    zIndex: 3999,
    justifyContent: "center",
    alignItems: "center",
  },
  // 弹窗内容容器
  popupContent: {
    backgroundColor: "#fff",
    borderRadius: 16 * rpx,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: -4 * rpx},
    shadowOpacity: 0.1,
    shadowRadius: 12 * rpx,
    elevation: 5, // Android 阴影
    alignItems: "center",
    minWidth: 560 * rpx,
  },
  // 弹窗标题区域
  popupContentTop: {
    alignItems: "center",
    justifyContent: "center",
  },
  msg: {
    marginTop: 32 * rpx,
    textAlign: "center",
  },
  msgText: {
    fontSize: 40 * rpx,
    fontWeight: "500",
    color: "#000",
    textAlign: "center",
  },
  // 信息内容区域
  popupContentMain: {
    minWidth: 560 * rpx,
    paddingHorizontal: 46 * rpx,
    paddingBottom: 48 * rpx,
    width: "100%",
  },
  msgItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: 16 * rpx,
  },
  label: {
    width: 185 * rpx,
    fontSize: 36 * rpx,
    fontWeight: "400",
    color: "#666",
  },
  text: {
    flex: 1,
    fontSize: 36 * rpx,
    fontWeight: "400",
    color: "#000",
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
    justifyContent: "space-between",
    height: 102 * rpx,
    width: "100%",
  },
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
  },
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
  },
  // 按钮分隔线
  cross: {
    width: 2 * rpx,
    height: 32 * rpx,
    backgroundColor: "#ededed",
  },
});

export default PopupBox;
