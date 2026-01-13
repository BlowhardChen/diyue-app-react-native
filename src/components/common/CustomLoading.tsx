// 自定义加载弹窗组件
import React from "react";
import {View, Text, ActivityIndicator, StyleSheet, Modal} from "react-native";

interface CustomLoadingType {
  visible: boolean;
  text?: string;
}

const CustomLoading: React.FC<CustomLoadingType> = ({visible, text = "加载中..."}) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.container}>
        <View style={styles.box}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.text}>{text}</Text>
        </View>
      </View>
    </Modal>
  );
};

export default CustomLoading;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent", // 背景透明，不阻挡操作
  },
  box: {
    width: 120,
    height: 120,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.7)", // 方块背景
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    marginTop: 10,
    color: "#fff",
    fontSize: 14,
  },
});
