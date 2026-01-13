// 付款方式选择器组件
import {dictDataList} from "@/services/common";
import {Global} from "@/styles/global";
import React, {useState, useEffect} from "react";
import {View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions, ToastAndroid} from "react-native";
import {WheelPicker} from "react-native-wheel-picker-android";
import {showCustomToast} from "./CustomToast";

// 适配 750 设计稿的 rpx 转换
const {width: SCREEN_WIDTH} = Dimensions.get("window");
const rpx = SCREEN_WIDTH / 750;

// 定义付款方式数据类型
interface PaymentMethodItem {
  dictLabel: string;
  dictValue: string;
  [key: string]: any;
}

// 定义组件属性类型
interface PaymentMethodPickerProps {
  visible: boolean; // 控制弹窗显示隐藏
  onClose: () => void; // 关闭弹窗回调
  onConfirm: (method: PaymentMethodItem) => void; // 确认选择回调
  initialValue?: string; // 新增：默认选中的付款方式值（如 "1"、"2"）
}

const PaymentMethodPicker: React.FC<PaymentMethodPickerProps> = ({visible, onClose, onConfirm, initialValue}) => {
  // 状态管理
  const [selectedIndex, setSelectedIndex] = useState<number>(0); // 选中索引
  const [methods, setMethods] = useState<PaymentMethodItem[]>([]); // 付款方式列表
  const [loading, setLoading] = useState<boolean>(true); // 加载状态

  // 获取付款方式列表
  const getPaymentList = async () => {
    try {
      setLoading(true);
      const {data} = await dictDataList({dictType: "contract_pay_methods"});
      console.log("getPaymentList", data);
      setMethods(data);

      // 新增：如果有初始值，找到对应索引，否则默认0
      if (initialValue && data.length > 0) {
        const targetIndex = data.findIndex(item => item.dictValue === initialValue);
        setSelectedIndex(targetIndex >= 0 ? targetIndex : 0);
      } else {
        setSelectedIndex(0); // 默认选中第一个
      }
    } catch (error: any) {
      showCustomToast("error", error?.data?.msg || "请求失败");
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时加载数据
  useEffect(() => {
    if (visible) {
      // 仅在弹窗显示时加载数据
      getPaymentList();
    }
  }, [visible, initialValue]); // 新增：initialValue变化时重新计算索引

  // 确认选择
  const handleConfirm = () => {
    if (methods.length === 0 || loading) return;

    const selectedMethod = methods[selectedIndex];
    onConfirm(selectedMethod);
    onClose();
  };

  // 处理滚轮数据渲染
  const getWheelData = () => {
    if (loading) {
      return ["加载中..."];
    }
    if (methods.length === 0) {
      return ["暂无数据"];
    }
    return methods.map(item => item.dictLabel);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {/* 遮罩层可点击关闭 */}
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} />

        {/* 选择器内容 */}
        <View style={styles.pickerContent}>
          {/* 顶部操作栏 */}
          <View style={styles.pickerTop}>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.pickerButton, styles.cancel]}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} disabled={loading || methods.length === 0}>
              <Text style={[styles.pickerButton, styles.confirm, (loading || methods.length === 0) && styles.confirmDisabled]}>
                确认
              </Text>
            </TouchableOpacity>
          </View>

          {/* 滚轮选择区域 */}
          <View style={styles.wheelContainer}>
            <WheelPicker
              data={getWheelData()}
              selectedItem={selectedIndex}
              onItemSelected={index => setSelectedIndex(index)}
              itemTextSize={36 * rpx}
              selectedItemTextSize={36 * rpx}
              itemTextFontFamily="System"
              selectedItemTextFontFamily="System"
              selectedItemTextColor="#000000"
              indicatorColor="#e7e7e7"
              isCyclic={false}
              style={styles.wheel}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

// 样式定义
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  overlayTouchable: {
    flex: 1,
  },
  pickerContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingBottom: 10,
  },
  pickerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e7e7e7",
  },
  pickerButton: {
    fontSize: 16,
  },
  cancel: {
    color: "#666666",
  },
  confirm: {
    color: Global.colors.primary,
    fontWeight: "500",
  },
  confirmDisabled: {
    color: "#999999",
    fontWeight: "normal",
  },
  wheelContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 5,
    height: 150,
  },
  wheel: {
    width: SCREEN_WIDTH - 32,
    height: 125,
  },
});

export default PaymentMethodPicker;
