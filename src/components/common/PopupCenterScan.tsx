// 中心弹窗组件（扫描银行卡/身份证）
import React from "react";
import {View, Text, TouchableOpacity, StyleSheet} from "react-native";

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

const styles = StyleSheet.create({
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

  popupContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 5,
    alignItems: "center",
    maxWidth: 330,
  },
  // 弹窗标题区域
  popupContentTop: {
    alignItems: "center",
    justifyContent: "center",
  },
  msg: {
    marginTop: 16,
    textAlign: "center",
  },
  msgText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
    textAlign: "center",
  },
  // 信息内容区域
  popupContentMain: {
    minWidth: 280,
    paddingHorizontal: 23,
    paddingBottom: 24,
    width: "100%",
  },
  msgItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: 8,
  },
  label: {
    width: 92,
    fontSize: 18,
    fontWeight: "400",
    color: "#666",
  },
  text: {
    flex: 1,
    fontSize: 18,
    fontWeight: "400",
    color: "#000",
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
    justifyContent: "space-between",
    height: 51,
    width: "100%",
  },
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
  },
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
  },
  // 按钮分隔线
  cross: {
    width: 1,
    height: 16,
    backgroundColor: "#ededed",
  },
});

export default PopupBox;
