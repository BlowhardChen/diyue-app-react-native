// 付款方式选择器组件
import {Global} from "@/styles/global";
import React, {useState, useEffect} from "react";
import {View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions, ToastAndroid} from "react-native";
import {WheelPicker} from "react-native-wheel-picker-android";

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
}

// 模拟接口请求（需替换为实际接口调用）
const dictDataList = async (params: {dictType: string}): Promise<{data: PaymentMethodItem[]}> => {
  // 实际项目中替换为真实接口请求
  // 示例返回数据（模拟 contract_pay_methods 字典）
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        data: [
          {dictLabel: "年付", dictValue: "1"},
          {dictLabel: "两季付", dictValue: "2"},
          {dictLabel: "三季付", dictValue: "3"},
        ],
      });
    }, 500);
  });
};

const PaymentMethodPicker: React.FC<PaymentMethodPickerProps> = ({visible, onClose, onConfirm}) => {
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
      setSelectedIndex(0); // 默认选中第一个
    } catch (error: any) {
      ToastAndroid.show(error?.data?.msg || "请求失败", ToastAndroid.SHORT);
      throw error;
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
  }, [visible]);

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
